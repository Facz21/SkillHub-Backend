using Microsoft.EntityFrameworkCore;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Enums;
using SkillHub.Infrastructure.Data;

namespace SkillHub.Infrastructure.Services;

public class ReportService : IReportService
{
    private readonly AppDbContext _context;

    public ReportService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<TopWorkshopReportDto>> GetTopWorkshopsAsync()
    {
        var workshops = await _context.Workshops
            .AsNoTracking()
            .Include(w => w.Instructor)
            .Include(w => w.Enrollments)
            .ToListAsync();

        var report = workshops.Select(w =>
        {
            var activeCount = w.Enrollments.Count(e => e.Status == EnrollmentStatus.Active);
            var occupancy = w.Capacity > 0
                ? Math.Round((double)activeCount / w.Capacity * 100, 2)
                : 0.0;

            return new TopWorkshopReportDto
            {
                WorkshopId = w.Id,
                Code = w.Code,
                Title = w.Title,
                InstructorName = w.Instructor?.FullName ?? "Unknown",
                StartDateTime = w.StartDateTime,
                EndDateTime = w.EndDateTime,
                Capacity = w.Capacity,
                ActiveEnrollmentsCount = activeCount,
                OccupancyRate = occupancy
            };
        })
        .OrderByDescending(r => r.ActiveEnrollmentsCount)
        .ThenByDescending(r => r.OccupancyRate)
        .ToList();

        return report;
    }
}
