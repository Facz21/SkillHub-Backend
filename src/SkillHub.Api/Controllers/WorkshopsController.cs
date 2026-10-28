using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;

namespace SkillHub.Api.Controllers;

/// <summary>
/// REST Controller for querying upcoming workshops, listing instructors, creating new workshops,
/// and inspecting workshop participant rosters.
/// </summary>
[ApiController]
[Route("api/v1/workshops")]
public class WorkshopsController : ControllerBase
{
    private readonly IWorkshopService _workshopService;

    public WorkshopsController(IWorkshopService workshopService)
    {
        _workshopService = workshopService;
    }

    /// <summary>
    /// Public endpoint returning all upcoming workshops with calculated available seats.
    /// </summary>
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<WorkshopResponseDto>>> GetUpcomingWorkshops()
    {
        var workshops = await _workshopService.GetUpcomingWorkshopsAsync();
        return Ok(workshops);
    }

    /// <summary>
    /// Returns the list of registered instructors ("Employee" role) for workshop assignment.
    /// </summary>
    [HttpGet("instructors")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<InstructorSummaryDto>>> GetInstructors()
    {
        var instructors = await _workshopService.GetInstructorsAsync();
        return Ok(instructors);
    }

    /// <summary>
    /// Public endpoint returning detailed information for a single workshop by ID.
    /// </summary>
    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<WorkshopResponseDto>> GetWorkshopById(int id)
    {
        var workshop = await _workshopService.GetWorkshopByIdAsync(id);
        return Ok(workshop);
    }

    /// <summary>
    /// Creates a new workshop. Restricted to users with the "Employee" role.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<WorkshopResponseDto>> CreateWorkshop([FromBody] CreateWorkshopRequestDto request)
    {
        var workshop = await _workshopService.CreateWorkshopAsync(request);
        return CreatedAtAction(nameof(GetWorkshopById), new { id = workshop.Id }, workshop);
    }

    /// <summary>
    /// Lists all enrolled participants for a specific workshop. Restricted to "Employee" role.
    /// </summary>
    [HttpGet("{id:int}/enrollments")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<WorkshopEnrollmentItemDto>>> GetWorkshopEnrollments(int id)
    {
        var enrollments = await _workshopService.GetWorkshopEnrollmentsAsync(id);
        return Ok(enrollments);
    }
}
