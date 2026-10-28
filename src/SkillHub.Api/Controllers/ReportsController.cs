using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;

namespace SkillHub.Api.Controllers;

/// <summary>
/// REST Controller providing administrative analytics and demand reports.
/// </summary>
[ApiController]
[Route("api/v1/reports")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    /// <summary>
    /// Returns the ranking of workshops ordered descending by active enrollments.
    /// Restricted to users with the "Employee" role.
    /// </summary>
    [HttpGet("top-workshops")]
    [Authorize(Roles = "Employee")]
    public async Task<ActionResult<IEnumerable<TopWorkshopReportDto>>> GetTopWorkshops()
    {
        var report = await _reportService.GetTopWorkshopsAsync();
        return Ok(report);
    }
}
