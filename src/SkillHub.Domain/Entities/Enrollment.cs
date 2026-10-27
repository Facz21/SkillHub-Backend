using SkillHub.Domain.Enums;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Domain.Entities;

public class Enrollment
{
    public int Id { get; set; }
    public string ParticipantId { get; set; } = string.Empty;
    public virtual ApplicationUser? Participant { get; set; }
    public int WorkshopId { get; set; }
    public virtual Workshop? Workshop { get; set; }
    public EnrollmentStatus Status { get; set; } = EnrollmentStatus.Active;
    public DateTime EnrolledAt { get; set; } = DateTime.UtcNow;
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }

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

    public void Reactivate(DateTime currentUtc)
    {
        Status = EnrollmentStatus.Active;
        EnrolledAt = currentUtc;
        CancelledAt = null;
        CancelledBy = null;
    }
}
