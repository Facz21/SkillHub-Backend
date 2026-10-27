using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Entities;
using SkillHub.Domain.Enums;
using SkillHub.Domain.Exceptions;
using SkillHub.Infrastructure.Data;

namespace SkillHub.Infrastructure.Services;

public class EnrollmentService : IEnrollmentService
{
    private readonly AppDbContext _context;
    private readonly IPdfCertificateService _pdfService;
    private readonly UserManager<ApplicationUser> _userManager;

    public EnrollmentService(
        AppDbContext context,
        IPdfCertificateService pdfService,
        UserManager<ApplicationUser> userManager)
    {
        _context = context;
        _pdfService = pdfService;
        _userManager = userManager;
    }

    public async Task<EnrollmentResponseDto> EnrollParticipantAsync(string participantId, int workshopId)
    {
        var now = DateTime.UtcNow;

        var participant = await _userManager.FindByIdAsync(participantId);
        if (participant == null)
            throw new NotFoundException($"Participant with ID '{participantId}' was not found.");

        var workshop = await _context.Workshops
            .Include(w => w.Instructor)
            .Include(w => w.Enrollments)
            .FirstOrDefaultAsync(w => w.Id == workshopId);

        if (workshop == null)
            throw new NotFoundException($"Workshop with ID {workshopId} was not found.");

        // Rule 4: Future workshops only
        if (workshop.StartDateTime <= now)
            throw new BusinessRuleValidationException("Cannot enroll in a workshop that has already started or finished.");

        // Rule 1: Capacity check (only active enrollments count)
        var activeEnrollmentsCount = workshop.Enrollments.Count(e => e.Status == EnrollmentStatus.Active);
        if (activeEnrollmentsCount >= workshop.Capacity)
            throw new CapacityExceededException($"The workshop '{workshop.Title}' is at full capacity ({workshop.Capacity} seats).");

        // Rule 2 & 6: Duplicate active check & Re-enrollment handling
        var existingEnrollment = await _context.Enrollments
            .FirstOrDefaultAsync(e => e.ParticipantId == participantId && e.WorkshopId == workshopId);

        if (existingEnrollment != null && existingEnrollment.Status == EnrollmentStatus.Active)
            throw new DuplicateEnrollmentException($"You are already actively enrolled in '{workshop.Title}'.");

        // Rule 3: No schedule collisions with any OTHER active enrollments
        var conflictingEnrollment = await _context.Enrollments
            .Include(e => e.Workshop)
            .Where(e => e.ParticipantId == participantId &&
                        e.Status == EnrollmentStatus.Active &&
                        e.WorkshopId != workshopId)
            .FirstOrDefaultAsync(e =>
                workshop.StartDateTime < e.Workshop!.EndDateTime &&
                workshop.EndDateTime > e.Workshop!.StartDateTime);

        if (conflictingEnrollment != null)
        {
            throw new ScheduleConflictException(
                $"Schedule conflict: workshop time ({workshop.StartDateTime:g} - {workshop.EndDateTime:t}) overlaps with your active enrollment in '{conflictingEnrollment.Workshop?.Title}' ({conflictingEnrollment.Workshop?.StartDateTime:g} - {conflictingEnrollment.Workshop?.EndDateTime:t}).");
        }

        Enrollment enrollmentToSave;

        if (existingEnrollment != null)
        {
            // Rule 6: Re-enrollment
            existingEnrollment.Reactivate(now);
            enrollmentToSave = existingEnrollment;
        }
        else
        {
            enrollmentToSave = new Enrollment
            {
                ParticipantId = participantId,
                Participant = participant,
                WorkshopId = workshopId,
                Workshop = workshop,
                Status = EnrollmentStatus.Active,
                EnrolledAt = now
            };
            _context.Enrollments.Add(enrollmentToSave);
        }

        await _context.SaveChangesAsync();

        return MapToDto(enrollmentToSave, now);
    }

    public async Task<IEnumerable<EnrollmentResponseDto>> GetMyEnrollmentsAsync(string participantId)
    {
        var now = DateTime.UtcNow;

        var enrollments = await _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Workshop)
                .ThenInclude(w => w!.Instructor)
            .Where(e => e.ParticipantId == participantId)
            .OrderByDescending(e => e.EnrolledAt)
            .ToListAsync();

        return enrollments.Select(e => MapToDto(e, now));
    }

    public async Task<EnrollmentResponseDto> CancelEnrollmentAsync(int enrollmentId, string userId, bool isEmployee)
    {
        var now = DateTime.UtcNow;

        var enrollment = await _context.Enrollments
            .Include(e => e.Workshop)
                .ThenInclude(w => w!.Instructor)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId);

        if (enrollment == null)
            throw new NotFoundException($"Enrollment with ID {enrollmentId} was not found.");

        // Authorization check: participant can only cancel their own enrollment
        if (!isEmployee && enrollment.ParticipantId != userId)
            throw new CancellationNotAllowedException("You are not authorized to cancel this enrollment.");

        // Domain method handles 24h rule and started workshop validation
        enrollment.Cancel(userId, isEmployee, now);

        await _context.SaveChangesAsync();

        return MapToDto(enrollment, now);
    }

    public async Task<byte[]> GenerateCertificatePdfAsync(int enrollmentId, string userId, bool isEmployee)
    {
        var enrollment = await _context.Enrollments
            .AsNoTracking()
            .Include(e => e.Participant)
            .Include(e => e.Workshop)
                .ThenInclude(w => w!.Instructor)
            .FirstOrDefaultAsync(e => e.Id == enrollmentId);

        if (enrollment == null)
            throw new NotFoundException($"Enrollment with ID {enrollmentId} was not found.");

        if (!isEmployee && enrollment.ParticipantId != userId)
            throw new BusinessRuleValidationException("You are not authorized to download this certificate.");

        if (enrollment.Status != EnrollmentStatus.Active)
            throw new BusinessRuleValidationException("Certificates are only issued for active enrollments.");

        var certificateData = new CertificateDataDto
        {
            InstitutionName = "SkillHub",
            DocumentTitle = "Constancia de inscripción",
            ParticipantName = enrollment.Participant?.FullName ?? "Participante",
            ParticipantEmail = enrollment.Participant?.Email ?? string.Empty,
            WorkshopCode = enrollment.Workshop?.Code ?? string.Empty,
            WorkshopTitle = enrollment.Workshop?.Title ?? "Taller",
            InstructorName = enrollment.Workshop?.Instructor?.FullName ?? "Instructor asignado",
            StartDateTime = enrollment.Workshop?.StartDateTime ?? DateTime.MinValue,
            EndDateTime = enrollment.Workshop?.EndDateTime ?? DateTime.MinValue,
            EnrolledAt = enrollment.EnrolledAt,
            GeneratedAt = DateTime.UtcNow
        };

        return _pdfService.GenerateCertificate(certificateData);
    }

    private static EnrollmentResponseDto MapToDto(Enrollment e, DateTime currentUtc)
    {
        var canCancel = false;
        if (e.Status == EnrollmentStatus.Active && e.Workshop != null)
        {
            canCancel = currentUtc <= e.Workshop.StartDateTime.AddHours(-24);
        }

        return new EnrollmentResponseDto
        {
            Id = e.Id,
            WorkshopId = e.WorkshopId,
            WorkshopCode = e.Workshop?.Code ?? string.Empty,
            WorkshopTitle = e.Workshop?.Title ?? string.Empty,
            InstructorName = e.Workshop?.Instructor?.FullName ?? "Unknown",
            StartDateTime = e.Workshop?.StartDateTime ?? DateTime.MinValue,
            EndDateTime = e.Workshop?.EndDateTime ?? DateTime.MinValue,
            Status = e.Status,
            EnrolledAt = e.EnrolledAt,
            CancelledAt = e.CancelledAt,
            CancelledBy = e.CancelledBy,
            CanParticipantCancel = canCancel
        };
    }
}
