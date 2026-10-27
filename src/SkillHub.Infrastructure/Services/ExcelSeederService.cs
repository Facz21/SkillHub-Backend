using ClosedXML.Excel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Entities;
using SkillHub.Infrastructure.Data;

namespace SkillHub.Infrastructure.Services;

public class ExcelSeederService : IExcelSeederService
{
    private readonly AppDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly ILogger<ExcelSeederService> _logger;

    public ExcelSeederService(
        AppDbContext context,
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        ILogger<ExcelSeederService> logger)
    {
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
        _logger = logger;
    }

    public async Task SeedAsync()
    {
        _logger.LogInformation("Starting database initialization and seeding...");

        // 1. Roles
        await EnsureRoleExistsAsync("Employee");
        await EnsureRoleExistsAsync("Participant");

        // Locate Excel file
        var currentDir = Directory.GetCurrentDirectory();
        var possiblePaths = new[]
        {
            Path.Combine(currentDir, "SkillHub_Data.xlsx"),
            Path.Combine(currentDir, "..", "SkillHub_Data.xlsx"),
            Path.Combine(currentDir, "..", "..", "SkillHub_Data.xlsx"),
            Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "SkillHub_Data.xlsx")
        };

        var filePath = possiblePaths.FirstOrDefault(File.Exists);
        if (filePath == null)
        {
            _logger.LogWarning("SkillHub_Data.xlsx was not found in searched paths. Skipping automatic excel seed.");
            return;
        }

        _logger.LogInformation("Found Excel file at: {FilePath}", filePath);

        using var workbook = new XLWorkbook(filePath);

        // 2. Seed Instructors
        var instructorsSheet = workbook.Worksheets.FirstOrDefault(w => w.Name.Equals("Instructors", StringComparison.OrdinalIgnoreCase));
        if (instructorsSheet != null)
        {
            var rows = instructorsSheet.RowsUsed().Skip(1);
            foreach (var row in rows)
            {
                var fullName = row.Cell(1).GetString().Trim();
                var email = row.Cell(2).GetString().Trim();
                var password = row.Cell(3).GetString().Trim();
                var specialty = row.Cell(4).GetString().Trim();

                if (string.IsNullOrWhiteSpace(email)) continue;

                var existingUser = await _userManager.FindByEmailAsync(email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = fullName,
                        Specialty = specialty,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await _userManager.CreateAsync(user, password);
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "Employee");
                        _logger.LogInformation("Created instructor: {Email}", email);
                    }
                    else
                    {
                        _logger.LogError("Failed to create instructor {Email}: {Errors}", email, string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
            }
        }

        // 3. Seed Participants
        var participantsSheet = workbook.Worksheets.FirstOrDefault(w => w.Name.Equals("Participants", StringComparison.OrdinalIgnoreCase));
        if (participantsSheet != null)
        {
            var rows = participantsSheet.RowsUsed().Skip(1);
            foreach (var row in rows)
            {
                var fullName = row.Cell(1).GetString().Trim();
                var email = row.Cell(2).GetString().Trim();
                var password = row.Cell(3).GetString().Trim();

                if (string.IsNullOrWhiteSpace(email)) continue;

                var existingUser = await _userManager.FindByEmailAsync(email);
                if (existingUser == null)
                {
                    var user = new ApplicationUser
                    {
                        UserName = email,
                        Email = email,
                        FullName = fullName,
                        CreatedAt = DateTime.UtcNow
                    };

                    var result = await _userManager.CreateAsync(user, password);
                    if (result.Succeeded)
                    {
                        await _userManager.AddToRoleAsync(user, "Participant");
                        _logger.LogInformation("Created participant: {Email}", email);
                    }
                    else
                    {
                        _logger.LogError("Failed to create participant {Email}: {Errors}", email, string.Join(", ", result.Errors.Select(e => e.Description)));
                    }
                }
            }
        }

        // 4. Seed Workshops
        var workshopsSheet = workbook.Worksheets.FirstOrDefault(w => w.Name.Equals("Workshops", StringComparison.OrdinalIgnoreCase));
        if (workshopsSheet != null)
        {
            var rows = workshopsSheet.RowsUsed().Skip(1);
            foreach (var row in rows)
            {
                var code = row.Cell(1).GetString().Trim().ToUpperInvariant();
                var title = row.Cell(2).GetString().Trim();
                var description = row.Cell(3).GetString().Trim();
                var instructorEmail = row.Cell(4).GetString().Trim();

                var startCell = row.Cell(5);
                var endCell = row.Cell(6);
                var capacity = row.Cell(7).GetValue<int>();

                if (string.IsNullOrWhiteSpace(code)) continue;

                var existingWorkshop = await _context.Workshops.FirstOrDefaultAsync(w => w.Code == code);
                if (existingWorkshop == null)
                {
                    var instructor = await _userManager.FindByEmailAsync(instructorEmail);
                    if (instructor == null)
                    {
                        _logger.LogWarning("Cannot create workshop {Code}: Instructor {Email} not found.", code, instructorEmail);
                        continue;
                    }

                    DateTime startDateTime = ParseExcelDateTime(startCell);
                    DateTime endDateTime = ParseExcelDateTime(endCell);

                    var workshop = new Workshop
                    {
                        Code = code,
                        Title = title,
                        Description = description,
                        InstructorId = instructor.Id,
                        StartDateTime = DateTime.SpecifyKind(startDateTime, DateTimeKind.Utc),
                        EndDateTime = DateTime.SpecifyKind(endDateTime, DateTimeKind.Utc),
                        Capacity = capacity,
                        CreatedAt = DateTime.UtcNow
                    };

                    _context.Workshops.Add(workshop);
                    _logger.LogInformation("Added workshop: {Code} ({Title})", code, title);
                }
            }

            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("Database seeding completed successfully.");
    }

    private async Task EnsureRoleExistsAsync(string roleName)
    {
        if (!await _roleManager.RoleExistsAsync(roleName))
        {
            await _roleManager.CreateAsync(new IdentityRole(roleName));
        }
    }

    private static DateTime ParseExcelDateTime(IXLCell cell)
    {
        if (cell.DataType == XLDataType.DateTime)
        {
            return cell.GetDateTime();
        }

        if (cell.DataType == XLDataType.Number)
        {
            double oaDate = cell.GetDouble();
            return DateTime.FromOADate(oaDate);
        }

        var str = cell.GetString();
        if (double.TryParse(str, System.Globalization.NumberStyles.Any, System.Globalization.CultureInfo.InvariantCulture, out double parsedOa))
        {
            return DateTime.FromOADate(parsedOa);
        }

        if (DateTime.TryParse(str, out DateTime parsedDt))
        {
            return parsedDt;
        }

        return DateTime.UtcNow.AddDays(7);
    }
}
