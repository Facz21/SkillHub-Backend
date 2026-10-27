using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;

namespace SkillHub.Api.Controllers;

[ApiController]
[Route("api/v1/workshops")]
public class WorkshopsController : ControllerBase
{
    private readonly IWorkshopService _workshopService;

    public WorkshopsController(IWorkshopService workshopService)
    {
        _workshopService = workshopService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IEnumerable<WorkshopResponseDto>>> GetUpcomingWorkshops()
    {
        var workshops = await _workshopService.GetUpcomingWorkshopsAsync();
        return Ok(workshops);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<WorkshopResponseDto>> GetWorkshopById(int id)
    {
        var workshop = await _workshopService.GetWorkshopByIdAsync(id);
        return Ok(workshop);
    }

    [HttpPost]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<WorkshopResponseDto>> CreateWorkshop([FromBody] CreateWorkshopRequestDto request)
    {
        var workshop = await _workshopService.CreateWorkshopAsync(request);
        return CreatedAtAction(nameof(GetWorkshopById), new { id = workshop.Id }, workshop);
    }

    [HttpGet("{id:int}/enrollments")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<WorkshopEnrollmentItemDto>>> GetWorkshopEnrollments(int id)
    {
        var enrollments = await _workshopService.GetWorkshopEnrollmentsAsync(id);
        return Ok(enrollments);
    }
}
