using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Api.Controllers;

/// <summary>
/// Multipart form wrapper for Excel spreadsheet uploads.
/// </summary>
public class FileUploadDto
{
    public IFormFile File { get; set; } = null!;
}

/// <summary>
/// REST Controller managing participant workshop enrollments, cancellations,
/// resilient Excel batch imports (.xlsx), and PDF attendance certificate downloads.
/// </summary>
[ApiController]
[Route("api/v1/enrollments")]
public class EnrollmentsController : ControllerBase
{
    private readonly IEnrollmentService _enrollmentService;
    private readonly IExcelImportService _excelImportService;

    public EnrollmentsController(
        IEnrollmentService enrollmentService,
        IExcelImportService excelImportService)
    {
        _enrollmentService = enrollmentService;
        _excelImportService = excelImportService;
    }

    /// <summary>
    /// Enrolls the authenticated participant into a workshop, enforcing capacity, duplicate, and schedule collision rules.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<EnrollmentResponseDto>> EnrollInWorkshop([FromBody] CreateEnrollmentRequestDto request)
    {
        var participantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(participantId))
            return Unauthorized();

        var enrollment = await _enrollmentService.EnrollParticipantAsync(participantId, request.WorkshopId);
        return StatusCode(StatusCodes.Status201Created, enrollment);
    }

    /// <summary>
    /// Returns all active and cancelled enrollments belonging to the authenticated participant.
    /// </summary>
    [HttpGet("mine")]
    [Authorize(Roles = "Participant")]
    public async Task<ActionResult<IEnumerable<EnrollmentResponseDto>>> GetMyEnrollments()
    {
        var participantId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(participantId))
            return Unauthorized();

        var enrollments = await _enrollmentService.GetMyEnrollmentsAsync(participantId);
        return Ok(enrollments);
    }

    /// <summary>
    /// Cancels an enrollment and immediately releases the seat.
    /// Enforces the 24-hour rule for participants; allows direct cancellation for employees.
    /// </summary>
    [HttpPatch("{id:int}/cancel")]
    [Authorize]
    public async Task<ActionResult<EnrollmentResponseDto>> CancelEnrollment(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var isEmployee = User.IsInRole("Employee");
        var enrollment = await _enrollmentService.CancelEnrollmentAsync(id, userId, isEmployee);
        return Ok(enrollment);
    }

    /// <summary>
    /// Resiliently imports participant enrollments in batch from an Excel spreadsheet (.xlsx).
    /// Persists valid rows and reports rejected rows with row numbers and detailed reasons.
    /// </summary>
    [HttpPost("import")]
    [Authorize(Roles = "Employee")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<ExcelImportResultDto>> ImportEnrollmentsFromExcel([FromForm] FileUploadDto upload)
    {
        var file = upload?.File;
        if (file == null || file.Length == 0)
            throw new BusinessRuleValidationException("Please provide a valid Excel file (.xlsx).");

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            throw new BusinessRuleValidationException("File format must be .xlsx");

        using var stream = file.OpenReadStream();
        var result = await _excelImportService.ImportEnrollmentsAsync(stream);
        return Ok(result);
    }

    /// <summary>
    /// Generates and downloads a PDF attendance certificate for an active enrollment.
    /// Accessible by the enrolled participant or any user with the "Employee" role.
    /// </summary>
    [HttpGet("{id:int}/certificate")]
    [Authorize]
    public async Task<IActionResult> DownloadCertificatePdf(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var isEmployee = User.IsInRole("Employee");
        var pdfBytes = await _enrollmentService.GenerateCertificatePdfAsync(id, userId, isEmployee);

        return File(pdfBytes, "application/pdf", $"Constancia_Inscripcion_{id}.pdf");
    }
}
