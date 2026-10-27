using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Entities;
using SkillHub.Domain.Enums;
using SkillHub.Domain.Exceptions;
using SkillHub.Infrastructure.Data;

namespace SkillHub.Infrastructure.Services;

public class WorkshopService : IWorkshopService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;

    public WorkshopService(AppDbContext context, UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task<IEnumerable<WorkshopResponseDto>> GetUpcomingWorkshopsAsync()
    {
        var now = DateTime.UtcNow;

        var workshops = await _context.Workshops
            .AsNoTracking()
            .Include(w => w.Instructor)
            .Include(w => w.Enrollments)
            .Where(w => w.StartDateTime > now)
            .OrderBy(w => w.StartDateTime)
            .ToListAsync();

        return workshops.Select(w => MapToDto(w));
    }

    public async Task<WorkshopResponseDto> GetWorkshopByIdAsync(int id)
    {
        var workshop = await _context.Workshops
            .AsNoTracking()
            .Include(w => w.Instructor)
            .Include(w => w.Enrollments)
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workshop == null)
            throw new NotFoundException($"Workshop with ID {id} was not found.");

        return MapToDto(workshop);
    }

    public async Task<WorkshopResponseDto> CreateWorkshopAsync(CreateWorkshopRequestDto request)
    {
        var now = DateTime.UtcNow;

        // Validate unique code
        var existingCode = await _context.Workshops.AnyAsync(w => w.Code.ToUpper() == request.Code.ToUpper());
        if (existingCode)
            throw new BusinessRuleValidationException($"A workshop with code '{request.Code}' already exists.");

        // Validate instructor exists
        var instructor = await _userManager.FindByEmailAsync(request.InstructorEmail);
        if (instructor == null)
            throw new NotFoundException($"Instructor with email '{request.InstructorEmail}' does not exist.");

        var isEmployee = await _userManager.IsInRoleAsync(instructor, "Employee");
        if (!isEmployee)
            throw new BusinessRuleValidationException($"User '{request.InstructorEmail}' is not registered as an instructor/employee.");

        var workshop = new Workshop
        {
            Code = request.Code.Trim().ToUpper(),
            Title = request.Title.Trim(),
            Description = request.Description.Trim(),
            InstructorId = instructor.Id,
            Instructor = instructor,
            StartDateTime = DateTime.SpecifyKind(request.StartDateTime, DateTimeKind.Utc),
            EndDateTime = DateTime.SpecifyKind(request.EndDateTime, DateTimeKind.Utc),
            Capacity = request.Capacity,
            CreatedAt = now
        };

        workshop.ValidateCreation(now);

        _context.Workshops.Add(workshop);
        await _context.SaveChangesAsync();

        return MapToDto(workshop);
    }

    public async Task<IEnumerable<WorkshopEnrollmentItemDto>> GetWorkshopEnrollmentsAsync(int workshopId)
    {
        var workshopExists = await _context.Workshops.AnyAsync(w => w.Id == workshopId);
        if (!workshopExists)
            throw new NotFoundException($"Workshop with ID {workshopId} was not found.");

        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Participant)
            .Where(e => e.WorkshopId == workshopId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        return enrollments.Select(e => new WorkshopEnrollmentItemDto
        {
            EnrollmentId = e.Id,
            ParticipantId = e.ParticipantId,
            ParticipantName = e.Participant?.FullName ?? "Unknown",
            ParticipantEmail = e.Participant?.Email ?? "Unknown",
            Status = e.Status,
            EnrolledAt = e.EnrolledAt,
            CancelledAt = e.CancelledAt,
            CancelledBy = e.CancelledBy
        });
    }

    public async Task<IEnumerable<InstructorSummaryDto>> GetInstructorsAsync()
    {
        var instructors = await _userManager.GetUsersInRoleAsync("Employee");
        return instructors
            .OrderBy(i => i.FullName)
            .Select(i => new InstructorSummaryDto
            {
                Id = i.Id,
                FullName = i.FullName,
                Email = i.Email ?? string.Empty,
                Specialty = i.Specialty
            });
    }

    private static WorkshopResponseDto MapToDto(Workshop w)
    {
        var activeCount = w.Enrollments.Count(e => e.Status == EnrollmentStatus.Active);
        var availableSeats = Math.Max(0, w.Capacity - activeCount);

        return new WorkshopResponseDto
        {
            Id = w.Id,
            Code = w.Code,
            Title = w.Title,
            Description = w.Description,
            InstructorName = w.Instructor?.FullName ?? "Unknown",
            InstructorEmail = w.Instructor?.Email ?? string.Empty,
            InstructorSpecialty = w.Instructor?.Specialty,
            StartDateTime = w.StartDateTime,
            EndDateTime = w.EndDateTime,
            Capacity = w.Capacity,
            ActiveEnrollmentsCount = activeCount,
            AvailableSeats = availableSeats
        };
    }
}
