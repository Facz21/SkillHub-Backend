using SkillHub.Application.DTOs;

namespace SkillHub.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterParticipantAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
}

public interface IWorkshopService
{
    Task<IEnumerable<WorkshopResponseDto>> GetUpcomingWorkshopsAsync();
    Task<WorkshopResponseDto> GetWorkshopByIdAsync(int id);
    Task<WorkshopResponseDto> CreateWorkshopAsync(CreateWorkshopRequestDto request);
    Task<IEnumerable<WorkshopEnrollmentItemDto>> GetWorkshopEnrollmentsAsync(int workshopId);
}

public interface IEnrollmentService
{
    Task<EnrollmentResponseDto> EnrollParticipantAsync(string participantId, int workshopId);
    Task<IEnumerable<EnrollmentResponseDto>> GetMyEnrollmentsAsync(string participantId);
    Task<EnrollmentResponseDto> CancelEnrollmentAsync(int enrollmentId, string userId, bool isEmployee);
    Task<byte[]> GenerateCertificatePdfAsync(int enrollmentId, string userId, bool isEmployee);
}

public interface IReportService
{
    Task<IEnumerable<TopWorkshopReportDto>> GetTopWorkshopsAsync();
}

public interface IPdfCertificateService
{
    byte[] GenerateCertificate(CertificateDataDto data);
}

public interface IExcelImportService
{
    Task<ExcelImportResultDto> ImportEnrollmentsAsync(Stream excelStream);
}

public interface IExcelSeederService
{
    Task SeedAsync();
}
