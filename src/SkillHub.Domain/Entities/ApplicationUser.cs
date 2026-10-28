using Microsoft.AspNetCore.Identity;

namespace SkillHub.Domain.Entities;

/// <summary>
/// Represents an authenticated user in the SkillHub platform, extending ASP.NET Core IdentityUser.
/// Can hold either the "Employee" (Instructor/Administrator) or "Participant" role.
/// </summary>
public class ApplicationUser : IdentityUser
{
    /// <summary>
    /// Full legal name of the participant or instructor.
    /// </summary>
    public string FullName { get; set; } = string.Empty;

    /// <summary>
    /// Teaching specialty (e.g., Photography, Culinary Arts) applicable to instructors ("Employee" role).
    /// </summary>
    public string? Specialty { get; set; }

    /// <summary>
    /// UTC timestamp when the user account was created.
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Navigation collection of workshops assigned to this instructor.
    /// </summary>
    public virtual ICollection<Workshop> WorkshopsTaught { get; set; } = new List<Workshop>();

    /// <summary>
    /// Navigation collection of workshop enrollments belonging to this participant.
    /// </summary>
    public virtual ICollection<Enrollment> Enrollments { get; set; } = new List<Enrollment>();
}
