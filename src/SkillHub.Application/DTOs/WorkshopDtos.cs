using System.ComponentModel.DataAnnotations;

namespace SkillHub.Application.DTOs;

public class WorkshopResponseDto
{
    public int Id { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public string InstructorEmail { get; set; } = string.Empty;
    public string? InstructorSpecialty { get; set; }
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int Capacity { get; set; }
    public int ActiveEnrollmentsCount { get; set; }
    public int AvailableSeats { get; set; }
}

public class CreateWorkshopRequestDto
{
    [Required]
    public string Code { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Description { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string InstructorEmail { get; set; } = string.Empty;

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Required]
    [Range(1, 1000)]
    public int Capacity { get; set; }
}

public class InstructorSummaryDto
{
    public string Id { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Specialty { get; set; }
}
