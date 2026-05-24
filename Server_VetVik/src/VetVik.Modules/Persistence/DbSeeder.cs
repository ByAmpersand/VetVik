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
    private const string DemoPassword = "VetVik123!";

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
        var (_, _, doctors, owners) = await SeedUsersWithProfilesAsync(db, userManager, seedSettings, logger, ct);
        await SeedClinicAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedSpeciesAndBreedsAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedSpecializationsAsync(db, doctors, ct);
        await SeedDoctorWorkingHoursAsync(db, doctors, ct);
        await db.SaveChangesAsync(ct);
        await SeedServiceCatalogAsync(db, ct);
        await db.SaveChangesAsync(ct);
        await SeedDemoPetsAsync(db, owners, ct);
        await db.SaveChangesAsync(ct);
        await SeedDemoAppointmentsAsync(db, owners, doctors, ct);
        await db.SaveChangesAsync(ct);
        await SeedDemoMedicalRecordsAsync(db, ct);
        await SeedDemoVaccinationsAsync(db, doctors, ct);

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

    private static async Task<(
            AdminProfile superAdmin,
            AdminProfile admin,
            IReadOnlyList<DoctorProfile> doctors,
            IReadOnlyList<OwnerProfile> owners)>
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
        await EnsureDemoAdminsAsync(db, userManager, logger, ct);

        await EnsureDoctorProfileAsync(db, doctorUser, s.Doctor.FirstName, s.Doctor.LastName,
            "Senior veterinarian, general practice.", ct);
        await EnsureDemoDoctorsAsync(db, userManager, logger, ct);

        await EnsureOwnerProfileAsync(db, ownerUser, s.Owner.FirstName, s.Owner.LastName, "100 Demo Street", ct);
        await EnsureDemoOwnersAsync(db, userManager, logger, ct);

        await db.SaveChangesAsync(ct);

        var doctors = await db.DoctorProfiles.OrderBy(d => d.LastName).ThenBy(d => d.FirstName).ToListAsync(ct);
        var owners = await db.OwnerProfiles.OrderBy(o => o.LastName).ThenBy(o => o.FirstName).ToListAsync(ct);
        return (superAdmin, admin, doctors, owners);
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

    private static async Task EnsureDemoAdminsAsync(
        VetVikDbContext db, UserManager<ApplicationUser> userManager, ILogger logger, CancellationToken ct)
    {
        foreach (var seed in new[]
        {
            new SeedUser { Email = "admin.ops@vetvik.local", Password = DemoPassword, FirstName = "Oksana", LastName = "Koval" },
            new SeedUser { Email = "admin.reception@vetvik.local", Password = DemoPassword, FirstName = "Marta", LastName = "Shevchenko" },
            new SeedUser { Email = "super.demo@vetvik.local", Password = DemoPassword, FirstName = "Ihor", LastName = "Melnyk" }
        })
        {
            var role = seed.Email.StartsWith("super.", StringComparison.OrdinalIgnoreCase)
                ? Roles.SuperAdmin
                : Roles.Admin;
            var user = await EnsureUserAsync(userManager, seed, role, logger);
            await EnsureAdminProfileAsync(db, user, seed, ct);
        }
    }

    private static async Task EnsureDemoDoctorsAsync(
        VetVikDbContext db, UserManager<ApplicationUser> userManager, ILogger logger, CancellationToken ct)
    {
        foreach (var seed in new[]
        {
            new
            {
                User = new SeedUser { Email = "doctor.surgery@vetvik.local", Password = DemoPassword, FirstName = "Andrii", LastName = "Bondarenko" },
                Bio = "Soft tissue surgeon with emergency care experience."
            },
            new
            {
                User = new SeedUser { Email = "doctor.derm@vetvik.local", Password = DemoPassword, FirstName = "Olena", LastName = "Tkachenko" },
                Bio = "Dermatology and allergy consultations for cats and dogs."
            },
            new
            {
                User = new SeedUser { Email = "doctor.dental@vetvik.local", Password = DemoPassword, FirstName = "Dmytro", LastName = "Savchuk" },
                Bio = "Veterinary dentistry, oral surgery and preventive dental care."
            },
            new
            {
                User = new SeedUser { Email = "doctor.exotics@vetvik.local", Password = DemoPassword, FirstName = "Natalia", LastName = "Moroz" },
                Bio = "Exotic pets, birds, rabbits, reptiles and small mammals."
            }
        })
        {
            var user = await EnsureUserAsync(userManager, seed.User, Roles.Doctor, logger);
            await EnsureDoctorProfileAsync(db, user, seed.User.FirstName, seed.User.LastName, seed.Bio, ct);
        }
    }

    private static async Task EnsureDemoOwnersAsync(
        VetVikDbContext db, UserManager<ApplicationUser> userManager, ILogger logger, CancellationToken ct)
    {
        foreach (var seed in new[]
        {
            new
            {
                User = new SeedUser { Email = "client.anna@vetvik.local", Password = DemoPassword, FirstName = "Anna", LastName = "Petrenko" },
                Address = "12 Khreshchatyk Street, Kyiv"
            },
            new
            {
                User = new SeedUser { Email = "client.bohdan@vetvik.local", Password = DemoPassword, FirstName = "Bohdan", LastName = "Lysenko" },
                Address = "48 Lvivska Street, Kyiv"
            },
            new
            {
                User = new SeedUser { Email = "client.iryna@vetvik.local", Password = DemoPassword, FirstName = "Iryna", LastName = "Romanenko" },
                Address = "7 Obolonska Avenue, Kyiv"
            },
            new
            {
                User = new SeedUser { Email = "client.taras@vetvik.local", Password = DemoPassword, FirstName = "Taras", LastName = "Hrytsenko" },
                Address = "21 Podilska Street, Kyiv"
            },
            new
            {
                User = new SeedUser { Email = "client.sofia@vetvik.local", Password = DemoPassword, FirstName = "Sofia", LastName = "Marchenko" },
                Address = "5 Dniprovska Embankment, Kyiv"
            }
        })
        {
            var user = await EnsureUserAsync(userManager, seed.User, Roles.Owner, logger);
            await EnsureOwnerProfileAsync(db, user, seed.User.FirstName, seed.User.LastName, seed.Address, ct);
        }
    }

    private static async Task<DoctorProfile> EnsureDoctorProfileAsync(
        VetVikDbContext db,
        ApplicationUser user,
        string firstName,
        string lastName,
        string bio,
        CancellationToken ct)
    {
        var doctor = await db.DoctorProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id, ct);
        if (doctor is null)
        {
            doctor = new DoctorProfile
            {
                UserId = user.Id,
                FirstName = firstName,
                LastName = lastName,
                Bio = bio,
                IsActive = true
            };
            db.DoctorProfiles.Add(doctor);
        }
        else
        {
            doctor.FirstName = firstName;
            doctor.LastName = lastName;
            doctor.Bio = bio;
            doctor.IsActive = true;
        }

        return doctor;
    }

    private static async Task<OwnerProfile> EnsureOwnerProfileAsync(
        VetVikDbContext db,
        ApplicationUser user,
        string firstName,
        string lastName,
        string address,
        CancellationToken ct)
    {
        var owner = await db.OwnerProfiles.FirstOrDefaultAsync(p => p.UserId == user.Id, ct);
        if (owner is null)
        {
            owner = new OwnerProfile
            {
                UserId = user.Id,
                FirstName = firstName,
                LastName = lastName,
                Address = address
            };
            db.OwnerProfiles.Add(owner);
        }
        else
        {
            owner.FirstName = firstName;
            owner.LastName = lastName;
            owner.Address = address;
        }

        return owner;
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
        else if (!await userManager.CheckPasswordAsync(user, s.Password))
        {
            var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
            var reset = await userManager.ResetPasswordAsync(user, resetToken, s.Password);
            if (!reset.Succeeded)
                throw new InvalidOperationException(
                    $"Failed to sync seed password for {s.Email}: " +
                    string.Join("; ", reset.Errors.Select(e => e.Description)));
            logger.LogInformation("Synced seed password for {Email}", s.Email);
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

    private static async Task SeedSpecializationsAsync(
        VetVikDbContext db, IReadOnlyList<DoctorProfile> doctors, CancellationToken ct)
    {
        var general = await EnsureSpecializationAsync(db, "General Veterinary", "General practice", ct);
        var surgery = await EnsureSpecializationAsync(db, "Surgery & Orthopedics", "Surgical procedures", ct);
        var dermatology = await EnsureSpecializationAsync(db, "Dermatology", "Skin conditions", ct);
        var dentistry = await EnsureSpecializationAsync(db, "Dentistry", "Dental care", ct);
        var cardiology = await EnsureSpecializationAsync(db, "Cardiology", "Heart and vascular care", ct);
        var diagnostics = await EnsureSpecializationAsync(db, "Diagnostics", "Imaging and laboratory diagnostics", ct);
        var exotics = await EnsureSpecializationAsync(db, "Exotic Pets", "Care for birds, reptiles and small mammals", ct);

        foreach (var doctor in doctors)
        {
            await EnsureDoctorSpecializationAsync(db, doctor, general, ct);

            var lastName = doctor.LastName.ToLowerInvariant();
            if (lastName.Contains("bondarenko"))
                await EnsureDoctorSpecializationAsync(db, doctor, surgery, ct);
            if (lastName.Contains("tkachenko"))
                await EnsureDoctorSpecializationAsync(db, doctor, dermatology, ct);
            if (lastName.Contains("savchuk"))
                await EnsureDoctorSpecializationAsync(db, doctor, dentistry, ct);
            if (lastName.Contains("moroz"))
                await EnsureDoctorSpecializationAsync(db, doctor, exotics, ct);
            if (lastName.Contains("melnyk") || lastName.Contains("savchuk"))
                await EnsureDoctorSpecializationAsync(db, doctor, diagnostics, ct);
            if (lastName.Contains("bondarenko"))
                await EnsureDoctorSpecializationAsync(db, doctor, cardiology, ct);
        }
    }

    private static async Task SeedDoctorWorkingHoursAsync(
        VetVikDbContext db, IReadOnlyList<DoctorProfile> doctors, CancellationToken ct)
    {
        var workdays = new[]
        {
            DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday,
            DayOfWeek.Thursday, DayOfWeek.Friday
        };

        for (var index = 0; index < doctors.Count; index++)
        {
            var doctor = doctors[index];
            if (await db.DoctorWorkingHours.AnyAsync(w => w.DoctorId == doctor.Id, ct)) continue;

            var startsAtNine = index % 2 == 0;
            foreach (var d in workdays)
            {
                db.DoctorWorkingHours.Add(new DoctorWorkingHour
                {
                    DoctorId = doctor.Id,
                    DayOfWeek = d,
                    StartTime = startsAtNine ? new TimeOnly(9, 0) : new TimeOnly(10, 0),
                    EndTime = startsAtNine ? new TimeOnly(18, 0) : new TimeOnly(19, 0),
                    IsActive = true
                });
            }
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

    private static async Task SeedDemoPetsAsync(
        VetVikDbContext db, IReadOnlyList<OwnerProfile> owners, CancellationToken ct)
    {
        if (owners.Count == 0) return;

        var dog = await db.AnimalSpecies.FirstAsync(s => s.Name == "Dog", ct);
        var cat = await db.AnimalSpecies.FirstAsync(s => s.Name == "Cat", ct);
        var rabbit = await db.AnimalSpecies.FirstAsync(s => s.Name == "Rabbit", ct);
        var bird = await db.AnimalSpecies.FirstAsync(s => s.Name == "Bird", ct);
        var reptile = await db.AnimalSpecies.FirstAsync(s => s.Name == "Reptile", ct);
        var rodent = await db.AnimalSpecies.FirstAsync(s => s.Name == "Rodent", ct);
        var golden = await db.Breeds.FirstAsync(br => br.Name == "Golden Retriever", ct);
        var british = await db.Breeds.FirstAsync(br => br.Name == "British Shorthair", ct);
        var holland = await db.Breeds.FirstAsync(br => br.Name == "Holland Lop", ct);
        var parrot = await db.Breeds.FirstAsync(br => br.Name == "Parrot", ct);
        var labrador = await db.Breeds.FirstAsync(br => br.Name == "Labrador Retriever", ct);
        var maine = await db.Breeds.FirstAsync(br => br.Name == "Maine Coon", ct);
        var beardedDragon = await db.Breeds.FirstAsync(br => br.Name == "Bearded Dragon", ct);
        var guineaPig = await db.Breeds.FirstAsync(br => br.Name == "Guinea Pig", ct);
        var poodle = await db.Breeds.FirstAsync(br => br.Name == "Poodle", ct);
        var sphynx = await db.Breeds.FirstAsync(br => br.Name == "Sphynx", ct);

        await EnsurePetAsync(db, owners[0], dog, golden, "Luna", PetSex.Female, new DateOnly(2022, 5, 10), 28m,
            "Friendly golden retriever. Sensitive stomach.", ct);
        await EnsurePetAsync(db, owners[0], cat, british, "Max", PetSex.Male, new DateOnly(2020, 8, 22), 5.2m,
            "Indoor cat. Previous mild dermatitis.", ct);
        await EnsurePetAsync(db, owners[1 % owners.Count], rabbit, holland, "Bella", PetSex.Female, new DateOnly(2023, 3, 15), 1.8m,
            "Diet monitored for dental health.", ct);
        await EnsurePetAsync(db, owners[1 % owners.Count], bird, parrot, "Kiwi", PetSex.Unknown, new DateOnly(2021, 11, 3), 0.35m,
            "Requires annual exotic-pet wellness checks.", ct);
        await EnsurePetAsync(db, owners[2 % owners.Count], dog, labrador, "Rex", PetSex.Male, new DateOnly(2019, 9, 2), 31m,
            "Energetic labrador. Monitor joints and weight.", ct);
        await EnsurePetAsync(db, owners[2 % owners.Count], cat, maine, "Mia", PetSex.Female, new DateOnly(2021, 1, 18), 6.8m,
            "Long-haired cat. Needs regular grooming and dental checks.", ct);
        await EnsurePetAsync(db, owners[3 % owners.Count], reptile, beardedDragon, "Draco", PetSex.Male, new DateOnly(2020, 4, 9), 0.48m,
            "Bearded dragon. UVB and diet reviewed regularly.", ct);
        await EnsurePetAsync(db, owners[3 % owners.Count], rodent, guineaPig, "Nori", PetSex.Female, new DateOnly(2023, 7, 1), 0.9m,
            "Guinea pig. Vitamin C supplementation discussed.", ct);
        await EnsurePetAsync(db, owners[4 % owners.Count], dog, poodle, "Archie", PetSex.Male, new DateOnly(2021, 12, 12), 8.4m,
            "Mini poodle. Dental tartar risk.", ct);
        await EnsurePetAsync(db, owners[4 % owners.Count], cat, sphynx, "Simba", PetSex.Male, new DateOnly(2022, 2, 24), 4.7m,
            "Sphynx cat. Skin care and bathing schedule.", ct);
    }

    private static async Task SeedDemoAppointmentsAsync(
        VetVikDbContext db,
        IReadOnlyList<OwnerProfile> owners,
        IReadOnlyList<DoctorProfile> doctors,
        CancellationToken ct)
    {
        if (owners.Count == 0 || doctors.Count == 0) return;

        var seededPets = await db.Pets.Where(p => new[]
            {
                "Luna", "Max", "Bella", "Kiwi", "Rex", "Mia", "Draco", "Nori", "Archie", "Simba"
            }.Contains(p.Name))
            .OrderBy(p => p.CreatedAt)
            .ToListAsync(ct);
        var pets = seededPets
            .GroupBy(p => p.Name)
            .ToDictionary(g => g.Key, g => g.First());
        var ownersById = owners.ToDictionary(o => o.Id);

        var room = await db.Rooms.FirstAsync(r => r.Name == "Exam Room 1", ct);
        var room2 = await db.Rooms.FirstAsync(r => r.Name == "Exam Room 2", ct);
        var surgeryRoom = await db.Rooms.FirstAsync(r => r.Name == "Surgery Room", ct);
        var diagnosticsRoom = await db.Rooms.FirstAsync(r => r.Name == "Diagnostics Room", ct);
        var dentalRoom = await db.Rooms.FirstAsync(r => r.Name == "Dental Room", ct);
        var checkup = await db.Services.FirstAsync(s => s.Name == "General checkup", ct);
        var derm = await db.Services.FirstAsync(s => s.Name == "Dermatology consultation", ct);
        var vaccination = await db.Services.FirstAsync(s => s.Name == "Vaccination", ct);
        var ultrasound = await db.Services.FirstAsync(s => s.Name == "Ultrasound", ct);
        var minorSurgery = await db.Services.FirstAsync(s => s.Name == "Minor surgery", ct);
        var dental = await db.Services.FirstAsync(s => s.Name == "Dental cleaning", ct);
        var bloodTest = await db.Services.FirstAsync(s => s.Name == "Blood test", ct);
        var microchip = await db.Services.FirstAsync(s => s.Name == "Microchipping", ct);
        var emergency = await db.Services.FirstAsync(s => s.Name == "Emergency consultation", ct);
        var nailTrim = await db.Services.FirstAsync(s => s.Name == "Nail trimming", ct);

        var today = DateTime.UtcNow.Date.AddHours(10);
        var past = DateTime.UtcNow.Date.AddDays(-12).AddHours(11);
        var earlierPast = DateTime.UtcNow.Date.AddDays(-35).AddHours(15);
        var upcoming = DateTime.UtcNow.Date.AddDays(3).AddHours(14);
        var cancelledAt = DateTime.UtcNow.Date.AddDays(-2).AddHours(9);
        var doctorIndex = 0;

        async Task AddAsync(
            string petName,
            DoctorProfile doctor,
            Room appointmentRoom,
            ServiceEntity service,
            DateTime startAt,
            AppointmentStatus status,
            string reason,
            string notes)
        {
            if (!pets.TryGetValue(petName, out var pet) || !ownersById.TryGetValue(pet.OwnerId, out var owner))
                return;

            await EnsureAppointmentAsync(db, owner, pet, doctor, appointmentRoom, service, startAt, status, reason, notes, ct);
        }

        DoctorProfile NextDoctor() => doctors[doctorIndex++ % doctors.Count];

        await AddAsync("Luna", NextDoctor(), room, checkup, past, AppointmentStatus.Completed,
            "Seed: Annual wellness visit", "Patient was bright, alert and responsive.");
        await AddAsync("Max", NextDoctor(), room2, derm, earlierPast, AppointmentStatus.Completed,
            "Seed: Skin irritation follow-up", "Symptoms improved after treatment.");
        await AddAsync("Luna", NextDoctor(), room, vaccination, today, AppointmentStatus.Scheduled,
            "Seed: Rabies booster", "Due for annual booster.");
        await AddAsync("Max", NextDoctor(), diagnosticsRoom, ultrasound, upcoming, AppointmentStatus.Confirmed,
            "Seed: Abdominal ultrasound", "Owner confirmed appointment.");
        await AddAsync("Bella", NextDoctor(), surgeryRoom, minorSurgery, cancelledAt, AppointmentStatus.Cancelled,
            "Seed: Cancelled nail injury procedure", "Owner cancelled due to symptom improvement.");
        await AddAsync("Kiwi", NextDoctor(), room, checkup, DateTime.UtcNow.Date.AddDays(-5).AddHours(16),
            AppointmentStatus.NoShow, "Seed: Missed exotic wellness visit", "Owner did not arrive.");
        await AddAsync("Rex", NextDoctor(), diagnosticsRoom, bloodTest, DateTime.UtcNow.Date.AddDays(-20).AddHours(10),
            AppointmentStatus.Completed, "Seed: Senior dog blood panel", "Bloodwork completed for preventive screening.");
        await AddAsync("Mia", NextDoctor(), dentalRoom, dental, DateTime.UtcNow.Date.AddDays(-8).AddHours(13),
            AppointmentStatus.Completed, "Seed: Dental cleaning", "Dental scaling completed without complications.");
        await AddAsync("Draco", NextDoctor(), room2, checkup, DateTime.UtcNow.Date.AddDays(1).AddHours(12),
            AppointmentStatus.Confirmed, "Seed: Reptile wellness exam", "Owner confirmed exotic pet consultation.");
        await AddAsync("Nori", NextDoctor(), room, nailTrim, DateTime.UtcNow.Date.AddDays(2).AddHours(15),
            AppointmentStatus.Scheduled, "Seed: Guinea pig nail trim", "Routine small mammal nail trim.");
        await AddAsync("Archie", NextDoctor(), dentalRoom, dental, DateTime.UtcNow.Date.AddDays(5).AddHours(11),
            AppointmentStatus.Scheduled, "Seed: Poodle dental assessment", "Assess dental tartar and home-care plan.");
        await AddAsync("Simba", NextDoctor(), room2, derm, DateTime.UtcNow.Date.AddDays(-3).AddHours(17),
            AppointmentStatus.Completed, "Seed: Sphynx skin check", "Skin condition stable, bathing schedule adjusted.");
        await AddAsync("Bella", NextDoctor(), room, microchip, DateTime.UtcNow.Date.AddDays(8).AddHours(10),
            AppointmentStatus.Scheduled, "Seed: Rabbit microchip", "Microchip appointment requested.");
        await AddAsync("Rex", NextDoctor(), room2, emergency, DateTime.UtcNow.Date.AddDays(-1).AddHours(18),
            AppointmentStatus.Completed, "Seed: Limping emergency", "No fracture suspected. Rest and anti-inflammatory plan.");
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
        VetVikDbContext db, IReadOnlyList<DoctorProfile> doctors, CancellationToken ct)
    {
        if (doctors.Count == 0) return;

        var luna = await db.Pets.FirstAsync(p => p.Name == "Luna", ct);
        var max = await db.Pets.FirstAsync(p => p.Name == "Max", ct);
        var bella = await db.Pets.FirstAsync(p => p.Name == "Bella", ct);
        var rex = await db.Pets.FirstOrDefaultAsync(p => p.Name == "Rex", ct);
        var mia = await db.Pets.FirstOrDefaultAsync(p => p.Name == "Mia", ct);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        await EnsureVaccinationAsync(db, luna, "Rabies", today.AddMonths(-5), today.AddMonths(7), doctors[0], ct);
        await EnsureVaccinationAsync(db, luna, "DHPP (Distemper)", today.AddMonths(-5), today.AddMonths(7), doctors[0], ct);
        await EnsureVaccinationAsync(db, luna, "Bordetella", today.AddMonths(-11), today.AddDays(20), doctors[0], ct);
        await EnsureVaccinationAsync(db, max, "Rabies", today.AddMonths(-14), today.AddDays(-30), doctors[1 % doctors.Count], ct);
        await EnsureVaccinationAsync(db, max, "FVRCP", today.AddMonths(-8), today.AddMonths(4), doctors[1 % doctors.Count], ct);
        await EnsureVaccinationAsync(db, bella, "Myxomatosis/RHD", today.AddMonths(-6), today.AddMonths(6), doctors[2 % doctors.Count], ct);

        if (rex is not null)
        {
            await EnsureVaccinationAsync(db, rex, "Rabies", today.AddMonths(-2), today.AddMonths(10), doctors[3 % doctors.Count], ct);
            await EnsureVaccinationAsync(db, rex, "Leptospirosis", today.AddMonths(-2), today.AddMonths(10), doctors[3 % doctors.Count], ct);
        }

        if (mia is not null)
            await EnsureVaccinationAsync(db, mia, "FVRCP", today.AddMonths(-1), today.AddMonths(11), doctors[4 % doctors.Count], ct);
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

    private static async Task EnsureDoctorSpecializationAsync(
        VetVikDbContext db, DoctorProfile doctor, Specialization specialization, CancellationToken ct)
    {
        if (await db.DoctorSpecializations.AnyAsync(
            d => d.DoctorId == doctor.Id && d.SpecializationId == specialization.Id, ct))
        {
            return;
        }

        db.DoctorSpecializations.Add(new DoctorSpecialization
        {
            DoctorId = doctor.Id,
            SpecializationId = specialization.Id
        });
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
