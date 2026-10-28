using SkillHub.Domain.Enums;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Domain.Entities;

/// <summary>
/// Core domain entity representing a short, in-person workshop offered by SkillHub.
/// Encapsulates seat capacity calculations and creation invariants.
/// </summary>
public class Workshop
{
    public int Id { get; set; }

    /// <summary>
    /// Unique business code identifying the workshop (e.g., "FOT-001").
    /// </summary>
    public string Code { get; set; } = string.Empty;

    /// <summary>
    /// Display title of the workshop.
    /// </summary>
    public string Title { get; set; } = string.Empty;

    /// <summary>
    /// Detailed summary of topics covered in the workshop.
    /// </summary>
    public string Description { get; set; } = string.Empty;

    /// <summary>
    /// Foreign key referencing the assigned instructor (ApplicationUser with role "Employee").
    /// </summary>
    public string InstructorId { get; set; } = string.Empty;
    public virtual ApplicationUser? Instructor { get; set; }

    /// <summary>
    /// Scheduled start date and time in UTC.
    /// </summary>
    public DateTime StartDateTime { get; set; }

    /// <summary>
    /// Scheduled end date and time in UTC.
    /// </summary>
    public DateTime EndDateTime { get; set; }

    /// <summary>
    /// Maximum number of active participants allowed in the workshop.
    /// </summary>
    public int Capacity { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();

    /// <summary>
    /// Determines whether the workshop has not yet started relative to the given UTC timestamp.
    /// </summary>
    public bool IsUpcoming(DateTime currentUtc) => StartDateTime > currentUtc;

    /// <summary>
    /// Counts only enrollments currently in Active status (cancelled enrollments do not consume seats).
    /// </summary>
    public int GetActiveEnrollmentsCount() =>
        Enrollments.Count(e => e.Status == EnrollmentStatus.Active);

    /// <summary>
    /// Calculates remaining available seats in real time.
    /// </summary>
    public int GetAvailableSeats() =>
        Math.Max(0, Capacity - GetActiveEnrollmentsCount());

    public bool HasAvailableSeats() =>
        GetAvailableSeats() > 0;

    /// <summary>
    /// Enforces domain invariants required prior to persisting a new workshop.
    /// </summary>
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
