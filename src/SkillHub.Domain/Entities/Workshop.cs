using SkillHub.Domain.Enums;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Domain.Entities;

public class Workshop
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InstructorId { get; set; } = string.Empty;
    public virtual ApplicationUser? Instructor { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int Capacity { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    public bool IsUpcoming(DateTime currentUtc) => StartDateTime > currentUtc;

    public int GetActiveEnrollmentsCount() =>
        Enrollments.Count(e => e.Status == EnrollmentStatus.Active);

    public int GetAvailableSeats() =>
        Math.Max(0, Capacity - GetActiveEnrollmentsCount());

    public bool HasAvailableSeats() =>
        GetAvailableSeats() > 0;

    public void ValidateCreation(DateTime currentUtc)
    {
        if (string.IsNullOrWhiteSpace(Code))
            throw new BusinessRuleValidationException("Workshop code is required.");

        if (string.IsNullOrWhiteSpace(Title))
            throw new BusinessRuleValidationException("Workshop title is required.");

        if (Capacity <= 0)
            throw new BusinessRuleValidationException("Workshop capacity must be greater than zero.");

        if (StartDateTime <= currentUtc)
            throw new BusinessRuleValidationException("Workshop must be scheduled for a future date and time.");

        if (EndDateTime <= StartDateTime)
            throw new BusinessRuleValidationException("Workshop end time must be after the start time.");
    }
}
