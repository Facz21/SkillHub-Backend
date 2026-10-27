using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Api.Controllers;

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

    [HttpPost("import")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<ExcelImportResultDto>> ImportEnrollmentsFromExcel([FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            throw new BusinessRuleValidationException("Please provide a valid Excel file (.xlsx).");

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            throw new BusinessRuleValidationException("File format must be .xlsx");

        using var stream = file.OpenReadStream();
        var result = await _excelImportService.ImportEnrollmentsAsync(stream);
        return Ok(result);
    }

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
