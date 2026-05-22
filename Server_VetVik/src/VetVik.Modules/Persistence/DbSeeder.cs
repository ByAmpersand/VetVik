using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using VetVik.BuildingBlocks.Security;
using VetVik.Modules.Appointments.Domain.Entities;
using VetVik.Modules.Appointments.Domain.Enums;
using VetVik.Modules.Clinic.Domain.Entities;
using VetVik.Modules.Doctors.Domain.Entities;
using VetVik.Modules.Identity.Domain.Entities;
using VetVik.Modules.Pets.Domain.Entities;
using VetVik.Modules.Pets.Domain.Enums;
using ServiceEntity = VetVik.Modules.Services.Domain.Entities.Service;
using ServiceCategoryEntity = VetVik.Modules.Services.Domain.Entities.ServiceCategory;

namespace VetVik.Modules.Persistence;

/// <summary>
/// Idempotent seeder. Safe to call on every startup.
/// </summary>
public static class DbSeeder
{
    public static async Task SeedAsync(IServiceProvider services, CancellationToken ct = default)
    {
        using var scope = services.CreateScope();
        var sp = scope.ServiceProvider;
        var logger = sp.GetRequiredService<ILogger<VetVikDbContext>>();
        var db = sp.GetRequiredService<VetVikDbContext>();
        var roleManager = sp.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = sp.GetRequiredService<UserManager<ApplicationUser>>();
        var seedSettings = sp.GetRequiredService<IOptions<SeedSettings>>().Value;

        await db.Database.MigrateAsync(ct);

        await SeedRolesAsync(roleManager, logger);
        var (admin, doctor, owner) = await SeedUsersWithProfilesAsync(db, userManager, seedSettings, logger, ct);
        await SeedClinicAsync(db, ct);
        await SeedSpeciesAndBreedsAsync(db, ct);
        await SeedSpecializationsAsync(db, doctor, ct);
        await SeedDoctorWorkingHoursAsync(db, doctor, ct);
        await SeedServiceCatalogAsync(db, ct);
        await SeedDemoPetsAsync(db, owner, ct);

        await db.SaveChangesAsync(ct);
        logger.LogInformation("Database seeded successfully.");
    }

    private static async Task SeedRolesAsync(RoleManager<IdentityRole> roleManager, ILogger logger)
    {
        foreach (var role in Roles.All)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
                logger.LogInformation("Created role {Role}", role);
            }
        }
    }

    private static async Task<(AdminProfile admin, DoctorProfile doctor, OwnerProfile owner)>
        SeedUsersWithProfilesAsync(
            VetVikDbContext db,
            UserManager<ApplicationUser> userManager,
            SeedSettings s,
            ILogger logger,
            CancellationToken ct)
    {
        var adminUser = await EnsureUserAsync(userManager, s.Admin, Roles.Admin, logger);
        var doctorUser = await EnsureUserAsync(userManager, s.Doctor, Roles.Doctor, logger);
        var ownerUser = await EnsureUserAsync(userManager, s.Owner, Roles.Owner, logger);

        var admin = await db.AdminProfiles.FirstOrDefaultAsync(p => p.UserId == adminUser.Id, ct);
        if (admin is null)
        {
            admin = new AdminProfile
            {
                UserId = adminUser.Id,
                FirstName = s.Admin.FirstName,
                LastName = s.Admin.LastName
            };
            db.AdminProfiles.Add(admin);
        }

        var doctor = await db.DoctorProfiles.FirstOrDefaultAsync(p => p.UserId == doctorUser.Id, ct);
        if (doctor is null)
        {
            doctor = new DoctorProfile
            {
                UserId = doctorUser.Id,
                FirstName = s.Doctor.FirstName,
                LastName = s.Doctor.LastName,
                Bio = "Senior veterinarian, general practice.",
                IsActive = true
            };
            db.DoctorProfiles.Add(doctor);
        }

        var owner = await db.OwnerProfiles.FirstOrDefaultAsync(p => p.UserId == ownerUser.Id, ct);
        if (owner is null)
        {
            owner = new OwnerProfile
            {
                UserId = ownerUser.Id,
                FirstName = s.Owner.FirstName,
                LastName = s.Owner.LastName,
                Address = "100 Demo Street"
            };
            db.OwnerProfiles.Add(owner);
        }

        await db.SaveChangesAsync(ct);
        return (admin, doctor, owner);
    }

    private static async Task<ApplicationUser> EnsureUserAsync(
        UserManager<ApplicationUser> userManager, SeedUser s, string role, ILogger logger)
    {
        if (string.IsNullOrWhiteSpace(s.Email) || string.IsNullOrWhiteSpace(s.Password))
            throw new InvalidOperationException(
                $"Seed user for role {role} is missing Email or Password. Configure Seed section in appsettings.");

        var user = await userManager.FindByEmailAsync(s.Email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = s.Email,
                Email = s.Email,
                EmailConfirmed = true,
                IsActive = true
            };
            var result = await userManager.CreateAsync(user, s.Password);
            if (!result.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to create seed user {s.Email}: " +
                    string.Join("; ", result.Errors.Select(e => e.Description)));
            logger.LogInformation("Created seed user {Email} for role {Role}", s.Email, role);
        }

        if (!await userManager.IsInRoleAsync(user, role))
            await userManager.AddToRoleAsync(user, role);

        return user;
    }

    private static async Task SeedClinicAsync(VetVikDbContext db, CancellationToken ct)
    {
        if (await db.ClinicSettings.AnyAsync(ct)) return;

        var clinic = new ClinicSettings
        {
            Name = "VetVik Veterinary Clinic",
            Address = "1 Demo Avenue, Kyiv",
            PhoneNumber = "+380 44 000 0000",
            Email = "hello@vetvik.local",
            Description = "Modern small-animal veterinary clinic.",
            WorkingHours = Enumerable.Range(0, 7).Select(d => new ClinicWorkingHour
            {
                DayOfWeek = (DayOfWeek)d,
                OpenTime = new TimeOnly(9, 0),
                CloseTime = new TimeOnly(19, 0),
                IsWorkingDay = d is not (int)DayOfWeek.Sunday
            }).ToList()
        };
        db.ClinicSettings.Add(clinic);

        if (!await db.Rooms.AnyAsync(ct))
        {
            db.Rooms.AddRange(
                new Room { Name = "Exam Room 1", Description = "General examination", IsActive = true },
                new Room { Name = "Exam Room 2", Description = "General examination", IsActive = true },
                new Room { Name = "Surgery Room", Description = "Surgical procedures", IsActive = true });
        }
    }

    private static async Task SeedSpeciesAndBreedsAsync(VetVikDbContext db, CancellationToken ct)
    {
        if (await db.AnimalSpecies.AnyAsync(ct)) return;

        var dog = new AnimalSpecies { Name = "Dog" };
        var cat = new AnimalSpecies { Name = "Cat" };
        var rabbit = new AnimalSpecies { Name = "Rabbit" };
        var bird = new AnimalSpecies { Name = "Bird" };
        db.AnimalSpecies.AddRange(dog, cat, rabbit, bird);

        db.Breeds.AddRange(
            new Breed { Species = dog, Name = "Golden Retriever" },
            new Breed { Species = dog, Name = "German Shepherd" },
            new Breed { Species = dog, Name = "Labrador" },
            new Breed { Species = cat, Name = "British Shorthair" },
            new Breed { Species = cat, Name = "Maine Coon" },
            new Breed { Species = rabbit, Name = "Holland Lop" },
            new Breed { Species = bird, Name = "Parrot" });
    }

    private static async Task SeedSpecializationsAsync(VetVikDbContext db, DoctorProfile doctor, CancellationToken ct)
    {
        if (!await db.Specializations.AnyAsync(ct))
        {
            db.Specializations.AddRange(
                new Specialization { Name = "General Veterinary", Description = "General practice" },
                new Specialization { Name = "Surgery & Orthopedics", Description = "Surgical procedures" },
                new Specialization { Name = "Dermatology", Description = "Skin conditions" },
                new Specialization { Name = "Dentistry", Description = "Dental care" });
            await db.SaveChangesAsync(ct);
        }

        if (!await db.DoctorSpecializations.AnyAsync(d => d.DoctorId == doctor.Id, ct))
        {
            var general = await db.Specializations.FirstAsync(s => s.Name == "General Veterinary", ct);
            db.DoctorSpecializations.Add(new DoctorSpecialization
            {
                DoctorId = doctor.Id,
                SpecializationId = general.Id
            });
        }
    }

    private static async Task SeedDoctorWorkingHoursAsync(VetVikDbContext db, DoctorProfile doctor, CancellationToken ct)
    {
        if (await db.DoctorWorkingHours.AnyAsync(w => w.DoctorId == doctor.Id, ct)) return;

        var workdays = new[]
        {
            DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
            DayOfWeek.Thursday, DayOfWeek.Friday
        };
        foreach (var d in workdays)
        {
            db.DoctorWorkingHours.Add(new DoctorWorkingHour
            {
                DoctorId = doctor.Id,
                DayOfWeek = d,
                StartTime = new TimeOnly(9, 0),
                EndTime = new TimeOnly(18, 0),
                IsActive = true
            });
        }
    }

    private static async Task SeedServiceCatalogAsync(VetVikDbContext db, CancellationToken ct)
    {
        if (await db.ServiceCategories.AnyAsync(ct)) return;

        var consultations = new ServiceCategoryEntity { Name = "Consultations" };
        var preventive = new ServiceCategoryEntity { Name = "Preventive Care" };
        var surgery = new ServiceCategoryEntity { Name = "Surgery" };
        db.ServiceCategories.AddRange(consultations, preventive, surgery);

        db.Services.AddRange(
            new ServiceEntity { Category = consultations, Name = "General checkup", DurationMinutes = 30, Price = 30m },
            new ServiceEntity { Category = consultations, Name = "Dermatology consultation", DurationMinutes = 30, Price = 40m },
            new ServiceEntity { Category = preventive, Name = "Vaccination", DurationMinutes = 20, Price = 25m },
            new ServiceEntity { Category = preventive, Name = "Dental cleaning", DurationMinutes = 60, Price = 80m },
            new ServiceEntity { Category = surgery, Name = "Minor surgery", DurationMinutes = 90, Price = 150m });
    }

    private static async Task SeedDemoPetsAsync(VetVikDbContext db, OwnerProfile owner, CancellationToken ct)
    {
        if (await db.Pets.AnyAsync(p => p.OwnerId == owner.Id, ct)) return;

        var dog = await db.AnimalSpecies.FirstAsync(s => s.Name == "Dog", ct);
        var cat = await db.AnimalSpecies.FirstAsync(s => s.Name == "Cat", ct);
        var golden = await db.Breeds.FirstAsync(br => br.Name == "Golden Retriever", ct);
        var british = await db.Breeds.FirstAsync(br => br.Name == "British Shorthair", ct);

        db.Pets.AddRange(
            new Pet
            {
                OwnerId = owner.Id, SpeciesId = dog.Id, BreedId = golden.Id,
                Name = "Luna", Sex = PetSex.Female,
                BirthDate = new DateOnly(2022, 5, 10), Weight = 28m
            },
            new Pet
            {
                OwnerId = owner.Id, SpeciesId = cat.Id, BreedId = british.Id,
                Name = "Max", Sex = PetSex.Male,
                BirthDate = new DateOnly(2020, 8, 22), Weight = 5.2m
            });
    }
}
