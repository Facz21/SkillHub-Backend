using ClosedXML.Excel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Entities;
using SkillHub.Domain.Enums;
using SkillHub.Infrastructure.Data;

namespace SkillHub.Infrastructure.Services;

public class ClosedXmlImportService : IExcelImportService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public ClosedXmlImportService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<ExcelImportResultDto> ImportEnrollmentsAsync(Stream excelStream)
    {
        var result = new ExcelImportResultDto();
        var now = DateTime.UtcNow;

        using var workbook = new XLWorkbook(excelStream);
        // Find sheet named 'Enrollments' or first sheet
        var worksheet = workbook.Worksheets.FirstOrDefault(w => w.Name.Equals("Enrollments", StringComparison.OrdinalIgnoreCase))
                        ?? workbook.Worksheets.FirstOrDefault();

        if (worksheet == null)
        {
            result.RejectedDetails.Add(new ExcelRowErrorDto
            {
                RowNumber = 1,
                ParticipantEmail = string.Empty,
                WorkshopCode = string.Empty,
                Reason = "No worksheet found in the provided Excel workbook."
            });
            return result;
        }

        // Detect column indices
        var headerRow = worksheet.Row(1);
        int emailCol = -1;
        int codeCol = -1;

        for (int col = 1; col <= worksheet.ColumnsUsed().Count(); col++)
        {
            var cellValue = headerRow.Cell(col).GetString().Trim();
            if (cellValue.Equals("ParticipantEmail", StringComparison.OrdinalIgnoreCase))
                emailCol = col;
            else if (cellValue.Equals("WorkshopCode", StringComparison.OrdinalIgnoreCase))
                codeCol = col;
        }

        if (emailCol == -1 || codeCol == -1)
        {
            // Fallback: assume column 1 is ParticipantEmail, column 2 is WorkshopCode
            emailCol = 1;
            codeCol = 2;
        }

        var rows = worksheet.RowsUsed().Skip(1).ToList();
        result.TotalRows = rows.Count;

        // Preload participants and workshops into dictionaries for high performance
        var allUsers = await _userManager.Users.ToListAsync();
        var userDict = allUsers.ToDictionary(u => u.Email?.Trim().ToLowerInvariant() ?? string.Empty, u => u);

        var workshops = await _context.Workshops
            .Include(w => w.Enrollments)
            .ToListAsync();
        var workshopDict = workshops.ToDictionary(w => w.Code.Trim().ToUpperInvariant(), w => w);

        int rowIndex = 2; // Rows in Excel start at 1, data starts at 2
        var enrollmentsToSave = new List<Enrollment>();

        foreach (var row in rows)
        {
            var email = row.Cell(emailCol).GetString().Trim();
            var code = row.Cell(codeCol).GetString().Trim().ToUpperInvariant();

            if (string.IsNullOrWhiteSpace(email) && string.IsNullOrWhiteSpace(code))
            {
                rowIndex++;
                continue;
            }

            // Validation 1: Participant exists
            if (!userDict.TryGetValue(email.ToLowerInvariant(), out var participant))
            {
                result.RejectedCount++;
                result.RejectedDetails.Add(new ExcelRowErrorDto
                {
                    RowNumber = rowIndex,
                    ParticipantEmail = email,
                    WorkshopCode = code,
                    Reason = $"Participant with email '{email}' does not exist."
                });
                rowIndex++;
                continue;
            }

            // Validation 2: Workshop exists
            if (!workshopDict.TryGetValue(code, out var workshop))
            {
                result.RejectedCount++;
                result.RejectedDetails.Add(new ExcelRowErrorDto
                {
                    RowNumber = rowIndex,
                    ParticipantEmail = email,
                    WorkshopCode = code,
                    Reason = $"Workshop with code '{code}' does not exist."
                });
                rowIndex++;
                continue;
            }

            // Validation 3: Workshop is in the future
            if (workshop.StartDateTime <= now)
            {
                result.RejectedCount++;
                result.RejectedDetails.Add(new ExcelRowErrorDto
                {
                    RowNumber = rowIndex,
                    ParticipantEmail = email,
                    WorkshopCode = code,
                    Reason = $"Workshop '{code}' has already started or concluded."
                });
                rowIndex++;
                continue;
            }

            // Validation 4: Capacity check (including pending newly added enrollments in this batch)
            var currentActiveCount = workshop.Enrollments.Count(e => e.Status == EnrollmentStatus.Active)
                                   + enrollmentsToSave.Count(e => e.WorkshopId == workshop.Id && e.Status == EnrollmentStatus.Active);

            if (currentActiveCount >= workshop.Capacity)
            {
                result.RejectedCount++;
                result.RejectedDetails.Add(new ExcelRowErrorDto
                {
                    RowNumber = rowIndex,
                    ParticipantEmail = email,
                    WorkshopCode = code,
                    Reason = $"Workshop '{code}' is at full capacity ({workshop.Capacity} seats)."
                });
                rowIndex++;
                continue;
            }

            // Validation 5: Duplicate active enrollment check
            var alreadyEnrolledInDb = workshop.Enrollments.Any(e => e.ParticipantId == participant.Id && e.Status == EnrollmentStatus.Active);
            var alreadyEnrolledInBatch = enrollmentsToSave.Any(e => e.ParticipantId == participant.Id && e.WorkshopId == workshop.Id && e.Status == EnrollmentStatus.Active);

            if (alreadyEnrolledInDb || alreadyEnrolledInBatch)
            {
                result.RejectedCount++;
                result.RejectedDetails.Add(new ExcelRowErrorDto
                {
                    RowNumber = rowIndex,
                    ParticipantEmail = email,
                    WorkshopCode = code,
                    Reason = $"Participant '{email}' already has an active enrollment in '{code}'."
                });
                rowIndex++;
                continue;
            }

            // Validation 6: Schedule collision check against other active workshops
            var hasOverlapInDb = await _context.Enrollments
                .Include(e => e.Workshop)
                .AnyAsync(e => e.ParticipantId == participant.Id &&
                               e.Status == EnrollmentStatus.Active &&
                               e.WorkshopId != workshop.Id &&
                               workshop.StartDateTime < e.Workshop!.EndDateTime &&
                               workshop.EndDateTime > e.Workshop!.StartDateTime);

            var hasOverlapInBatch = enrollmentsToSave.Any(e =>
            {
                if (e.ParticipantId != participant.Id || e.WorkshopId == workshop.Id || e.Status != EnrollmentStatus.Active)
                    return false;
                var otherWorkshop = workshops.FirstOrDefault(w => w.Id == e.WorkshopId);
                return otherWorkshop != null &&
                       workshop.StartDateTime < otherWorkshop.EndDateTime &&
                       workshop.EndDateTime > otherWorkshop.StartDateTime;
            });

            if (hasOverlapInDb || hasOverlapInBatch)
            {
                result.RejectedCount++;
                result.RejectedDetails.Add(new ExcelRowErrorDto
                {
                    RowNumber = rowIndex,
                    ParticipantEmail = email,
                    WorkshopCode = code,
                    Reason = $"Schedule conflict: Workshop '{code}' conflicts in time with an existing active enrollment for '{email}'."
                });
                rowIndex++;
                continue;
            }

            // Passed all checks: Add or reactivate
            var existingInactive = workshop.Enrollments.FirstOrDefault(e => e.ParticipantId == participant.Id && e.Status == EnrollmentStatus.Cancelled);
            if (existingInactive != null)
            {
                existingInactive.Reactivate(now);
            }
            else
            {
                var newEnrollment = new Enrollment
                {
                    ParticipantId = participant.Id,
                    WorkshopId = workshop.Id,
                    Status = EnrollmentStatus.Active,
                    EnrolledAt = now
                };
                enrollmentsToSave.Add(newEnrollment);
            }

            result.SuccessfulCount++;
            rowIndex++;
        }

        if (enrollmentsToSave.Any())
        {
            _context.Enrollments.AddRange(enrollmentsToSave);
        }

        await _context.SaveChangesAsync();
        return result;
    }
}
