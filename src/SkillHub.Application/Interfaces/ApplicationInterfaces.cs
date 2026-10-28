using SkillHub.Application.DTOs;

namespace SkillHub.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponseDto> RegisterParticipantAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<UserProfileDto> GetProfileAsync(string userId);
    Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto request);
    Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request);
    Task<AuthTokenDispatchResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request);
    Task ResetPasswordAsync(ResetPasswordRequestDto request);
    Task<AuthTokenDispatchResponseDto> ResendEmailConfirmationAsync(ForgotPasswordRequestDto request);
    Task ConfirmEmailAsync(ConfirmEmailRequestDto request);
}

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody);
}

public interface IWorkshopService
{
    Task<IEnumerable<WorkshopResponseDto>> GetUpcomingWorkshopsAsync();
    Task<WorkshopResponseDto> GetWorkshopByIdAsync(int id);
    Task<WorkshopResponseDto> CreateWorkshopAsync(CreateWorkshopRequestDto request);
    Task<IEnumerable<WorkshopEnrollmentItemDto>> GetWorkshopEnrollmentsAsync(int workshopId);
    Task<IEnumerable<InstructorSummaryDto>> GetInstructorsAsync();
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
