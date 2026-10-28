using SkillHub.Domain.Enums;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Domain.Entities;

/// <summary>
/// Domain entity representing a participant's enrollment in a specific workshop.
/// Enforces cancellation policies, seat release, and reactivation rules.
/// </summary>
public class Enrollment
{
    public int Id { get; set; }

    /// <summary>
    /// Foreign key referencing the enrolled participant (ApplicationUser).
    /// </summary>
    public string ParticipantId { get; set; } = string.Empty;
    public virtual ApplicationUser? Participant { get; set; }

    /// <summary>
    /// Foreign key referencing the target Workshop.
    /// </summary>
    public int WorkshopId { get; set; }
    public virtual Workshop? Workshop { get; set; }

    /// <summary>
    /// Current lifecycle state of the enrollment (Active or Cancelled).
    /// </summary>
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;

    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// UTC timestamp when the enrollment was cancelled, if applicable.
    /// </summary>
    public DateTime? CancelledAt { get; set; }

    /// <summary>
    /// Identifier of the user (participant or employee) who performed the cancellation.
    /// </summary>
    public string? CancelledBy { get; set; }

    /// <summary>
    /// Cancels an active enrollment while enforcing role-specific time rules:
    /// - Participants must cancel at least 24 hours before the workshop starts.
    /// - Employees may cancel at any time prior to the workshop start time.
    /// </summary>
    public void Cancel(string cancelledById, bool isEmployee, DateTime currentUtc)
    {
        if (Status == EnrollmentStatus.Cancelled)
            throw new CancellationNotAllowedException("This enrollment is already cancelled.");

        if (Workshop != null)
        {
            if (Workshop.StartDateTime <= currentUtc)
                throw new CancellationNotAllowedException("Cannot cancel an enrollment for a workshop that has already started.");

            if (!isEmployee)
            {
                var deadline = Workshop.StartDateTime.AddHours(-24);
                if (currentUtc > deadline)
                {
                    throw new CancellationNotAllowedException(
                        "Participants can only cancel their enrollment up to 24 hours before the workshop starts.");
                }
            }
        }

        Status = EnrollmentStatus.Cancelled;
        CancelledAt = currentUtc;
        CancelledBy = cancelledById;
    }

    /// <summary>
    /// Reactivates a previously cancelled enrollment (re-enrollment rule) and clears cancellation audit fields.
    /// </summary>
    public void Reactivate(DateTime currentUtc)
    {
        Status = EnrollmentStatus.Active;
        EnrolledAt = currentUtc;
        CancelledAt = null;
        CancelledBy = null;
    }
}
