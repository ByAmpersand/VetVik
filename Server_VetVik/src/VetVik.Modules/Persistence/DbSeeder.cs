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
using VetVik.Modules.MedicalRecords.Domain.Entities;
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
        var (superAdmin, admin, doctor, owner) = await SeedUsersWithProfilesAsync(db, userManager, seedSettings, logger, ct);
        await SeedClinicAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedSpeciesAndBreedsAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedSpecializationsAsync(db, doctor, ct);
        await SeedDoctorWorkingHoursAsync(db, doctor, ct);
        await db.SaveChangesAsync(ct);
        await SeedServiceCatalogAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedDemoPetsAsync(db, owner, ct);
        await db.SaveChangesAsync(ct);
        await SeedDemoAppointmentsAsync(db, owner, doctor, ct);
        await db.SaveChangesAsync(ct);
        await SeedDemoMedicalRecordsAsync(db, ct);
        await SeedDemoVaccinationsAsync(db, doctor, ct);

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

    private static async Task<(AdminProfile superAdmin, AdminProfile admin, DoctorProfile doctor, OwnerProfile owner)>
        SeedUsersWithProfilesAsync(
            VetVikDbContext db,
            UserManager<ApplicationUser> userManager,
            SeedSettings s,
            ILogger logger,
            CancellationToken ct)
    {
        var superAdminUser = await EnsureUserAsync(userManager, s.SuperAdmin, Roles.SuperAdmin, logger);
        var adminUser = await EnsureUserAsync(userManager, s.Admin, Roles.Admin, logger);
        var doctorUser = await EnsureUserAsync(userManager, s.Doctor, Roles.Doctor, logger);
        var ownerUser = await EnsureUserAsync(userManager, s.Owner, Roles.Owner, logger);

        var superAdmin = await EnsureAdminProfileAsync(db, superAdminUser, s.SuperAdmin, ct);
        var admin = await EnsureAdminProfileAsync(db, adminUser, s.Admin, ct);

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
        return (superAdmin, admin, doctor, owner);
    }

    private static async Task<AdminProfile> EnsureAdminProfileAsync(
        VetVikDbContext db, ApplicationUser user, SeedUser seed, CancellationToken ct)
    {
        var profile = await db.AdminProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id, ct);
        if (profile is null)
        {
            profile = new AdminProfile
            {
                UserId = user.Id,
                FirstName = seed.FirstName,
                LastName = seed.LastName
            };
            db.AdminProfiles.Add(profile);
        }

        return profile;
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
        var clinic = await db.ClinicSettings
            .Include(c => c.WorkingHours)
            .FirstOrDefaultAsync(ct);

        if (clinic is null)
        {
            clinic = new ClinicSettings
            {
                Name = "VetVik Veterinary Clinic",
                Address = "1 Demo Avenue, Kyiv",
                PhoneNumber = "+380 44 000 0000",
                Email = "hello@vetvik.local",
                Description = "Modern small-animal veterinary clinic."
            };
            db.ClinicSettings.Add(clinic);
        }

        foreach (var day in Enumerable.Range(0, 7).Select(d => (DayOfWeek)d))
        {
            if (clinic.WorkingHours.Any(h => h.DayOfWeek == day)) continue;

            clinic.WorkingHours.Add(new ClinicWorkingHour
            {
                DayOfWeek = day,
                OpenTime = new TimeOnly(9, 0),
                CloseTime = new TimeOnly(19, 0),
                IsWorkingDay = day is not DayOfWeek.Sunday
            });
        }

        await EnsureRoomAsync(db, "Exam Room 1", "General examination", ct);
        await EnsureRoomAsync(db, "Exam Room 2", "General examination", ct);
        await EnsureRoomAsync(db, "Surgery Room", "Surgical procedures", ct);
        await EnsureRoomAsync(db, "Dental Room", "Dental cleaning and oral procedures", ct);
        await EnsureRoomAsync(db, "Diagnostics Room", "Ultrasound and laboratory diagnostics", ct);
    }

    private static async Task SeedSpeciesAndBreedsAsync(VetVikDbContext db, CancellationToken ct)
    {
        var dog = await EnsureSpeciesAsync(db, "Dog", "Domestic dog", ct);
        var cat = await EnsureSpeciesAsync(db, "Cat", "Domestic cat", ct);
        var rabbit = await EnsureSpeciesAsync(db, "Rabbit", "Domestic rabbit", ct);
        var bird = await EnsureSpeciesAsync(db, "Bird", "Pet birds", ct);
        var reptile = await EnsureSpeciesAsync(db, "Reptile", "Terrarium reptiles", ct);
        var rodent = await EnsureSpeciesAsync(db, "Rodent", "Small rodents", ct);

        foreach (var name in new[]
        {
            "Golden Retriever", "German Shepherd", "Labrador Retriever", "French Bulldog",
            "Yorkshire Terrier", "Poodle", "Beagle", "Dachshund", "Rottweiler", "Husky",
            "Cocker Spaniel", "Border Collie", "Chihuahua", "Shiba Inu", "Mixed breed",
        })
            await EnsureBreedAsync(db, dog, name, ct);

        foreach (var name in new[]
        {
            "British Shorthair", "Maine Coon", "Sphynx", "Persian", "Siamese",
            "Bengal", "Ragdoll", "Scottish Fold", "Russian Blue", "Abyssinian",
            "Norwegian Forest Cat", "Devon Rex", "Mixed breed",
        })
            await EnsureBreedAsync(db, cat, name, ct);

        foreach (var name in new[] { "Holland Lop", "Netherland Dwarf", "Mini Rex", "Lionhead", "Mixed breed" })
            await EnsureBreedAsync(db, rabbit, name, ct);

        foreach (var name in new[] { "Parrot", "Canary", "Budgerigar", "Cockatiel", "Lovebird", "Mixed breed" })
            await EnsureBreedAsync(db, bird, name, ct);

        foreach (var name in new[] { "Bearded Dragon", "Leopard Gecko", "Corn Snake", "Turtle", "Mixed breed" })
            await EnsureBreedAsync(db, reptile, name, ct);

        foreach (var name in new[] { "Guinea Pig", "Hamster", "Rat", "Chinchilla", "Gerbil", "Mixed breed" })
            await EnsureBreedAsync(db, rodent, name, ct);
    }

    private static async Task SeedSpecializationsAsync(VetVikDbContext db, DoctorProfile doctor, CancellationToken ct)
    {
        var general = await EnsureSpecializationAsync(db, "General Veterinary", "General practice", ct);
        await EnsureSpecializationAsync(db, "Surgery & Orthopedics", "Surgical procedures", ct);
        await EnsureSpecializationAsync(db, "Dermatology", "Skin conditions", ct);
        await EnsureSpecializationAsync(db, "Dentistry", "Dental care", ct);
        await EnsureSpecializationAsync(db, "Cardiology", "Heart and vascular care", ct);
        await EnsureSpecializationAsync(db, "Diagnostics", "Imaging and laboratory diagnostics", ct);
        await EnsureSpecializationAsync(db, "Exotic Pets", "Care for birds, reptiles and small mammals", ct);

        if (!await db.DoctorSpecializations.AnyAsync(d => d.DoctorId == doctor.Id, ct))
        {
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
        var consultations = await EnsureServiceCategoryAsync(db, "Consultations", "Primary and specialist consultations", ct);
        var preventive = await EnsureServiceCategoryAsync(db, "Preventive Care", "Vaccination and routine prevention", ct);
        var diagnostics = await EnsureServiceCategoryAsync(db, "Diagnostics", "Laboratory and imaging diagnostics", ct);
        var dentistry = await EnsureServiceCategoryAsync(db, "Dentistry", "Dental treatment and oral care", ct);
        var surgery = await EnsureServiceCategoryAsync(db, "Surgery", "Surgical procedures", ct);
        var grooming = await EnsureServiceCategoryAsync(db, "Grooming", "Basic hygiene services", ct);

        await EnsureServiceAsync(db, consultations, "General checkup", "Routine physical examination and consultation.", 30, 30m, ct);
        await EnsureServiceAsync(db, consultations, "Dermatology consultation", "Skin, coat and allergy consultation.", 30, 40m, ct);
        await EnsureServiceAsync(db, consultations, "Emergency consultation", "Urgent same-day assessment.", 45, 60m, ct);
        await EnsureServiceAsync(db, preventive, "Vaccination", "Core vaccination appointment.", 20, 25m, ct);
        await EnsureServiceAsync(db, preventive, "Microchipping", "Pet microchip implantation and registration.", 20, 35m, ct);
        await EnsureServiceAsync(db, diagnostics, "Blood test", "Standard complete blood count and biochemistry.", 20, 45m, ct);
        await EnsureServiceAsync(db, diagnostics, "Ultrasound", "Abdominal ultrasound diagnostics.", 45, 90m, ct);
        await EnsureServiceAsync(db, dentistry, "Dental cleaning", "Dental scaling and polishing.", 60, 80m, ct);
        await EnsureServiceAsync(db, surgery, "Minor surgery", "Minor outpatient surgical procedure.", 90, 150m, ct);
        await EnsureServiceAsync(db, surgery, "Spay/neuter surgery", "Routine sterilization procedure.", 120, 180m, ct);
        await EnsureServiceAsync(db, grooming, "Nail trimming", "Claw trimming for cats, dogs and small pets.", 15, 15m, ct);
    }

    private static async Task SeedDemoPetsAsync(VetVikDbContext db, OwnerProfile owner, CancellationToken ct)
    {
        var dog = await db.AnimalSpecies.FirstAsync(s => s.Name == "Dog", ct);
        var cat = await db.AnimalSpecies.FirstAsync(s => s.Name == "Cat", ct);
        var rabbit = await db.AnimalSpecies.FirstAsync(s => s.Name == "Rabbit", ct);
        var bird = await db.AnimalSpecies.FirstAsync(s => s.Name == "Bird", ct);
        var golden = await db.Breeds.FirstAsync(br => br.Name == "Golden Retriever", ct);
        var british = await db.Breeds.FirstAsync(br => br.Name == "British Shorthair", ct);
        var holland = await db.Breeds.FirstAsync(br => br.Name == "Holland Lop", ct);
        var parrot = await db.Breeds.FirstAsync(br => br.Name == "Parrot", ct);

        await EnsurePetAsync(db, owner, dog, golden, "Luna", PetSex.Female, new DateOnly(2022, 5, 10), 28m,
            "Friendly golden retriever. Sensitive stomach.", ct);
        await EnsurePetAsync(db, owner, cat, british, "Max", PetSex.Male, new DateOnly(2020, 8, 22), 5.2m,
            "Indoor cat. Previous mild dermatitis.", ct);
        await EnsurePetAsync(db, owner, rabbit, holland, "Bella", PetSex.Female, new DateOnly(2023, 3, 15), 1.8m,
            "Diet monitored for dental health.", ct);
        await EnsurePetAsync(db, owner, bird, parrot, "Kiwi", PetSex.Unknown, new DateOnly(2021, 11, 3), 0.35m,
            "Requires annual exotic-pet wellness checks.", ct);
    }

    private static async Task SeedDemoAppointmentsAsync(
        VetVikDbContext db, OwnerProfile owner, DoctorProfile doctor, CancellationToken ct)
    {
        var luna = await db.Pets.FirstAsync(p => p.Name == "Luna", ct);
        var max = await db.Pets.FirstAsync(p => p.Name == "Max", ct);
        var bella = await db.Pets.FirstAsync(p => p.Name == "Bella", ct);
        var kiwi = await db.Pets.FirstAsync(p => p.Name == "Kiwi", ct);
        var room = await db.Rooms.FirstAsync(r => r.Name == "Exam Room 1", ct);
        var surgeryRoom = await db.Rooms.FirstAsync(r => r.Name == "Surgery Room", ct);
        var diagnosticsRoom = await db.Rooms.FirstAsync(r => r.Name == "Diagnostics Room", ct);
        var checkup = await db.Services.FirstAsync(s => s.Name == "General checkup", ct);
        var derm = await db.Services.FirstAsync(s => s.Name == "Dermatology consultation", ct);
        var vaccination = await db.Services.FirstAsync(s => s.Name == "Vaccination", ct);
        var ultrasound = await db.Services.FirstAsync(s => s.Name == "Ultrasound", ct);
        var minorSurgery = await db.Services.FirstAsync(s => s.Name == "Minor surgery", ct);

        var today = DateTime.UtcNow.Date.AddHours(10);
        var past = DateTime.UtcNow.Date.AddDays(-12).AddHours(11);
        var earlierPast = DateTime.UtcNow.Date.AddDays(-35).AddHours(15);
        var upcoming = DateTime.UtcNow.Date.AddDays(3).AddHours(14);
        var cancelledAt = DateTime.UtcNow.Date.AddDays(-2).AddHours(9);

        await EnsureAppointmentAsync(db, owner, luna, doctor, room, checkup, past, AppointmentStatus.Completed,
            "Seed: Annual wellness visit", "Patient was bright, alert and responsive.", ct);
        await EnsureAppointmentAsync(db, owner, max, doctor, room, derm, earlierPast, AppointmentStatus.Completed,
            "Seed: Skin irritation follow-up", "Symptoms improved after treatment.", ct);
        await EnsureAppointmentAsync(db, owner, luna, doctor, room, vaccination, today, AppointmentStatus.Scheduled,
            "Seed: Rabies booster", "Due for annual booster.", ct);
        await EnsureAppointmentAsync(db, owner, max, doctor, diagnosticsRoom, ultrasound, upcoming, AppointmentStatus.Confirmed,
            "Seed: Abdominal ultrasound", "Owner confirmed appointment.", ct);
        await EnsureAppointmentAsync(db, owner, bella, doctor, surgeryRoom, minorSurgery, cancelledAt, AppointmentStatus.Cancelled,
            "Seed: Cancelled nail injury procedure", "Owner cancelled due to symptom improvement.", ct);
        await EnsureAppointmentAsync(db, owner, kiwi, doctor, room, checkup, DateTime.UtcNow.Date.AddDays(-5).AddHours(16),
            AppointmentStatus.NoShow, "Seed: Missed exotic wellness visit", "Owner did not arrive.", ct);
    }

    private static async Task SeedDemoMedicalRecordsAsync(VetVikDbContext db, CancellationToken ct)
    {
        var completedAppointments = await db.Appointments
            .Where(a => a.Status == AppointmentStatus.Completed
                && a.Reason != null
                && a.Reason.StartsWith("Seed:"))
            .ToListAsync(ct);

        foreach (var appointment in completedAppointments)
        {
            if (await db.MedicalRecords.AnyAsync(r => r.AppointmentId == appointment.Id, ct)) continue;

            var (symptoms, diagnosis, treatment, recommendations) = appointment.Reason switch
            {
                "Seed: Annual wellness visit" => (
                    "No acute complaints. Routine preventive examination.",
                    "Clinically healthy. Mild dental plaque noted.",
                    "Physical exam, body condition scoring and preventive counselling.",
                    "Continue balanced diet, schedule dental cleaning within 6 months."),
                "Seed: Skin irritation follow-up" => (
                    "Previous itching and redness on dorsal skin.",
                    "Resolving allergic dermatitis.",
                    "Topical antiseptic care and antihistamine course completed.",
                    "Monitor for recurrence and continue flea prevention monthly."),
                _ => (
                    "Completed appointment documented during initial data seeding.",
                    "No critical findings recorded.",
                    "Standard veterinary care provided.",
                    "Follow up as clinically indicated.")
            };

            db.MedicalRecords.Add(new MedicalRecord
            {
                AppointmentId = appointment.Id,
                PetId = appointment.PetId,
                DoctorId = appointment.DoctorId,
                Symptoms = symptoms,
                Diagnosis = diagnosis,
                Treatment = treatment,
                Recommendations = recommendations,
                CreatedAt = appointment.StartAt
            });
        }
    }

    private static async Task SeedDemoVaccinationsAsync(
        VetVikDbContext db, DoctorProfile doctor, CancellationToken ct)
    {
        var luna = await db.Pets.FirstAsync(p => p.Name == "Luna", ct);
        var max = await db.Pets.FirstAsync(p => p.Name == "Max", ct);
        var bella = await db.Pets.FirstAsync(p => p.Name == "Bella", ct);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        await EnsureVaccinationAsync(db, luna, "Rabies", today.AddMonths(-5), today.AddMonths(7), doctor, ct);
        await EnsureVaccinationAsync(db, luna, "DHPP (Distemper)", today.AddMonths(-5), today.AddMonths(7), doctor, ct);
        await EnsureVaccinationAsync(db, luna, "Bordetella", today.AddMonths(-11), today.AddDays(20), doctor, ct);
        await EnsureVaccinationAsync(db, max, "Rabies", today.AddMonths(-14), today.AddDays(-30), doctor, ct);
        await EnsureVaccinationAsync(db, max, "FVRCP", today.AddMonths(-8), today.AddMonths(4), doctor, ct);
        await EnsureVaccinationAsync(db, bella, "Myxomatosis/RHD", today.AddMonths(-6), today.AddMonths(6), doctor, ct);
    }

    private static async Task EnsureRoomAsync(VetVikDbContext db, string name, string description, CancellationToken ct)
    {
        if (await db.Rooms.AnyAsync(r => r.Name == name, ct)) return;

        db.Rooms.Add(new Room
        {
            Name = name,
            Description = description,
            IsActive = true
        });
    }

    private static async Task<AnimalSpecies> EnsureSpeciesAsync(
        VetVikDbContext db, string name, string description, CancellationToken ct)
    {
        var species = await db.AnimalSpecies.FirstOrDefaultAsync(s => s.Name == name, ct);
        if (species is not null) return species;

        species = new AnimalSpecies
        {
            Name = name,
            Description = description,
            IsActive = true
        };
        db.AnimalSpecies.Add(species);
        return species;
    }

    private static async Task EnsureBreedAsync(
        VetVikDbContext db, AnimalSpecies species, string name, CancellationToken ct)
    {
        if (await db.Breeds.AnyAsync(b => b.SpeciesId == species.Id && b.Name == name, ct)) return;

        db.Breeds.Add(new Breed
        {
            SpeciesId = species.Id,
            Species = species,
            Name = name,
            IsActive = true
        });
    }

    private static async Task<Specialization> EnsureSpecializationAsync(
        VetVikDbContext db, string name, string description, CancellationToken ct)
    {
        var specialization = await db.Specializations.FirstOrDefaultAsync(s => s.Name == name, ct);
        if (specialization is not null) return specialization;

        specialization = new Specialization
        {
            Name = name,
            Description = description,
            IsActive = true
        };
        db.Specializations.Add(specialization);
        return specialization;
    }

    private static async Task<ServiceCategoryEntity> EnsureServiceCategoryAsync(
        VetVikDbContext db, string name, string description, CancellationToken ct)
    {
        var category = await db.ServiceCategories.FirstOrDefaultAsync(c => c.Name == name, ct);
        if (category is not null) return category;

        category = new ServiceCategoryEntity
        {
            Name = name,
            Description = description,
            IsActive = true
        };
        db.ServiceCategories.Add(category);
        return category;
    }

    private static async Task EnsureServiceAsync(
        VetVikDbContext db,
        ServiceCategoryEntity category,
        string name,
        string description,
        int durationMinutes,
        decimal price,
        CancellationToken ct)
    {
        if (await db.Services.AnyAsync(s => s.CategoryId == category.Id && s.Name == name, ct)) return;

        db.Services.Add(new ServiceEntity
        {
            CategoryId = category.Id,
            Category = category,
            Name = name,
            Description = description,
            DurationMinutes = durationMinutes,
            Price = price,
            IsActive = true
        });
    }

    private static async Task EnsurePetAsync(
        VetVikDbContext db,
        OwnerProfile owner,
        AnimalSpecies species,
        Breed breed,
        string name,
        PetSex sex,
        DateOnly birthDate,
        decimal weight,
        string notes,
        CancellationToken ct)
    {
        if (await db.Pets.AnyAsync(p => p.OwnerId == owner.Id && p.Name == name, ct)) return;

        db.Pets.Add(new Pet
        {
            OwnerId = owner.Id,
            SpeciesId = species.Id,
            BreedId = breed.Id,
            Name = name,
            Sex = sex,
            BirthDate = birthDate,
            Weight = weight,
            Notes = notes
        });
    }

    private static async Task<Appointment> EnsureAppointmentAsync(
        VetVikDbContext db,
        OwnerProfile owner,
        Pet pet,
        DoctorProfile doctor,
        Room room,
        ServiceEntity service,
        DateTime startAt,
        AppointmentStatus status,
        string reason,
        string notes,
        CancellationToken ct)
    {
        var appointment = await db.Appointments
            .FirstOrDefaultAsync(a => a.OwnerId == owner.Id && a.PetId == pet.Id && a.Reason == reason, ct);
        if (appointment is not null) return appointment;

        appointment = new Appointment
        {
            OwnerId = owner.Id,
            PetId = pet.Id,
            DoctorId = doctor.Id,
            RoomId = room.Id,
            ServiceId = service.Id,
            StartAt = startAt,
            EndAt = startAt.AddMinutes(service.DurationMinutes),
            Status = status,
            Reason = reason,
            Notes = notes,
            CreatedAt = startAt.AddDays(-2),
            CancelledAt = status == AppointmentStatus.Cancelled ? startAt.AddDays(-1) : null,
            CancellationReason = status == AppointmentStatus.Cancelled ? notes : null
        };
        db.Appointments.Add(appointment);
        return appointment;
    }

    private static async Task EnsureVaccinationAsync(
        VetVikDbContext db,
        Pet pet,
        string vaccineName,
        DateOnly administeredDate,
        DateOnly nextDueDate,
        DoctorProfile doctor,
        CancellationToken ct)
    {
        if (await db.Vaccinations.AnyAsync(v => v.PetId == pet.Id && v.VaccineName == vaccineName, ct)) return;

        db.Vaccinations.Add(new Vaccination
        {
            PetId = pet.Id,
            VaccineName = vaccineName,
            AdministeredDate = administeredDate,
            NextDueDate = nextDueDate,
            AdministeredByDoctorId = doctor.Id
        });
    }
}
