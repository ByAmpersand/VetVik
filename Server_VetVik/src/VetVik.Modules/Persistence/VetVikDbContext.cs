using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using VetVik.Modules.Appointments.Domain.Entities;
using VetVik.Modules.Clinic.Domain.Entities;
using VetVik.Modules.Doctors.Domain.Entities;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.MedicalRecords.Domain.Entities;
using VetVik.Modules.Pets.Domain.Entities;
using ServiceEntity = VetVik.Modules.Services.Domain.Entities.Service;
using ServiceCategoryEntity = VetVik.Modules.Services.Domain.Entities.ServiceCategory;

namespace VetVik.Modules.Persistence;

public class VetVikDbContext : IdentityDbContext<ApplicationUser, IdentityRole, string>
{
    public VetVikDbContext(DbContextOptions<VetVikDbContext> options) : base(options) { }

    // Identity profiles
    public DbSet<OwnerProfile> OwnerProfiles => Set<OwnerProfile>();
    public DbSet<DoctorProfile> DoctorProfiles => Set<DoctorProfile>();
    public DbSet<AdminProfile> AdminProfiles => Set<AdminProfile>();
    public DbSet<UserNotificationPreferences> UserNotificationPreferences => Set<UserNotificationPreferences>();

    // Clinic
    public DbSet<ClinicSettings> ClinicSettings => Set<ClinicSettings>();
    public DbSet<ClinicWorkingHour> ClinicWorkingHours => Set<ClinicWorkingHour>();
    public DbSet<Room> Rooms => Set<Room>();

    // Pets
    public DbSet<AnimalSpecies> AnimalSpecies => Set<AnimalSpecies>();
    public DbSet<Breed> Breeds => Set<Breed>();
    public DbSet<Pet> Pets => Set<Pet>();
    public DbSet<Vaccination> Vaccinations => Set<Vaccination>();

    // Doctors
    public DbSet<Specialization> Specializations => Set<Specialization>();
    public DbSet<DoctorSpecialization> DoctorSpecializations => Set<DoctorSpecialization>();
    public DbSet<DoctorWorkingHour> DoctorWorkingHours => Set<DoctorWorkingHour>();

    // Services
    public DbSet<ServiceCategoryEntity> ServiceCategories => Set<ServiceCategoryEntity>();
    public DbSet<ServiceEntity> Services => Set<ServiceEntity>();

    // Appointments
    public DbSet<Appointment> Appointments => Set<Appointment>();

    // Medical Records
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.ApplyConfigurationsFromAssembly(typeof(VetVikDbContext).Assembly);

        // Rename ASP.NET Identity tables — keep AspNet* prefix as requested in spec.
        // (Default IdentityDbContext already uses AspNet* names, but we make it explicit.)
        modelBuilder.Entity<ApplicationUser>().ToTable("AspNetUsers");
        modelBuilder.Entity<IdentityRole>().ToTable("AspNetRoles");
        modelBuilder.Entity<IdentityUserRole<string>>().ToTable("AspNetUserRoles");
        modelBuilder.Entity<IdentityUserClaim<string>>().ToTable("AspNetUserClaims");
        modelBuilder.Entity<IdentityUserLogin<string>>().ToTable("AspNetUserLogins");
        modelBuilder.Entity<IdentityRoleClaim<string>>().ToTable("AspNetRoleClaims");
        modelBuilder.Entity<IdentityUserToken<string>>().ToTable("AspNetUserTokens");
    }
}
