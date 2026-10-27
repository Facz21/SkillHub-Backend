namespace SkillHub.Application.DTOs;

public class TopWorkshopReportDto
{
    public int WorkshopId { get; set; }
    public string Code { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int Capacity { get; set; }
    public int ActiveEnrollmentsCount { get; set; }
    public double OccupancyRate { get; set; }
}

public class CertificateDataDto
{
    public string InstitutionName { get; set; } = "SkillHub";
    public string DocumentTitle { get; set; } = "Constancia de inscripción";
    public string ParticipantName { get; set; } = string.Empty;
    public string ParticipantEmail { get; set; } = string.Empty;
    public string WorkshopCode { get; set; } = string.Empty;
    public string WorkshopTitle { get; set; } = string.Empty;
    public string InstructorName { get; set; } = string.Empty;
    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public DateTime EnrolledAt { get; set; }
    public DateTime GeneratedAt { get; set; }
}
