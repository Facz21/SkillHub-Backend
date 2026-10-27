using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using SkillHub.Domain.Entities;

namespace SkillHub.Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Workshop> Workshops => Set<Workshop>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<Workshop>(entity =>
        {
            entity.HasKey(w => w.Id);
            entity.HasIndex(w => w.Code).IsUnique();
            entity.Property(w => w.Code).HasMaxLength(50).IsRequired();
            entity.Property(w => w.Title).HasMaxLength(200).IsRequired();
            entity.Property(w => w.Description).HasMaxLength(2000).IsRequired();
            entity.Property(w => w.Capacity).IsRequired();
            entity.Property(w => w.StartDateTime).IsRequired();
            entity.Property(w => w.EndDateTime).IsRequired();

            entity.HasOne(w => w.Instructor)
                  .WithMany(u => u.WorkshopsTaught)
                  .HasForeignKey(w => w.InstructorId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        builder.Entity<Enrollment>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Status).IsRequired();
            entity.Property(e => e.EnrolledAt).IsRequired();

            entity.HasOne(e => e.Participant)
                  .WithMany(u => u.Enrollments)
                  .HasForeignKey(e => e.ParticipantId)
                  .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.Workshop)
                  .WithMany(w => w.Enrollments)
                  .HasForeignKey(e => e.WorkshopId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(e => new { e.ParticipantId, e.WorkshopId });
        });
    }
}
