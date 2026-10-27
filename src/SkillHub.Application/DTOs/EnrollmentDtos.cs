using System.ComponentModel.DataAnnotations;
using SkillHub.Domain.Enums;

namespace SkillHub.Application.DTOs;

public class CreateEnrollmentRequestDto
{
    [Required]
    public int WorkshopId { get; set; }
}

public class EnrollmentResponseDto
{
    public int Id { get; set; }
    public int WorkshopId { get; set; }
    public string WorkshopCode { get; set; } = string.Empty;
    public string WorkshopTitle { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
    public bool CanParticipantCancel { get; set; }
}

public class WorkshopEnrollmentItemDto
{
    public int EnrollmentId { get; set; }
    public string ParticipantId { get; set; } = string.Empty;
    public string ParticipantName { get; set; } = string.Empty;
    public string ParticipantEmail { get; set; } = string.Empty;
    public EnrollmentStatus Status { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public string? CancelledBy { get; set; }
}

public class ExcelImportResultDto
{
    public int TotalRows { get; set; }
    public int SuccessfulCount { get; set; }
    public int RejectedCount { get; set; }
    public List<ExcelRowErrorDto> RejectedDetails { get; set; } = new();
}

public class ExcelRowErrorDto
{
    public int RowNumber { get; set; }
    public string ParticipantEmail { get; set; } = string.Empty;
    public string WorkshopCode { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}
