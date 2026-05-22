using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using VetVik.Modules.Appointments.Application.Services;
using VetVik.Modules.Clinic.Application.Services;
using VetVik.Modules.Doctors.Application.Services;
using VetVik.Modules.Identity.Application.Services;
using VetVik.Modules.MedicalRecords.Application.Services;
using VetVik.Modules.Pets.Application.Services;
using VetVik.Modules.Services.Application.Services;

namespace VetVik.Modules;

public static class ModuleRegistration
{
    public static IServiceCollection AddVetVikModules(this IServiceCollection services)
    {
        // Identity
        services.AddScoped<IIdentityService, IdentityService>();
        services.AddScoped<IStaffService, StaffService>();
        services.AddScoped<IClientDirectoryService, ClientDirectoryService>();
        services.AddScoped<IAnalyticsService, AnalyticsService>();

        // Clinic
        services.AddScoped<IClinicService, ClinicService>();

        // Pets
        services.AddScoped<IAnimalSpeciesService, AnimalSpeciesService>();
        services.AddScoped<IBreedService, BreedService>();
        services.AddScoped<IPetService, PetService>();
        services.AddScoped<IVaccinationService, VaccinationService>();

        // Doctors
        services.AddScoped<IDoctorService, DoctorService>();
        services.AddScoped<ISpecializationService, SpecializationService>();
        services.AddScoped<IDoctorWorkingHoursService, DoctorWorkingHoursService>();

        // Services catalog
        services.AddScoped<IServiceCategoryService, ServiceCategoryService>();
        services.AddScoped<IServiceCatalogService, ServiceCatalogService>();

        // Appointments
        services.AddScoped<IAppointmentService, AppointmentService>();

        // Medical records
        services.AddScoped<IMedicalRecordService, MedicalRecordService>();

        // FluentValidation: scan this assembly for validators.
        services.AddValidatorsFromAssembly(typeof(ModuleRegistration).Assembly);

        return services;
    }
}
