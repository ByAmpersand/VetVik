# VetVik — Architecture

This document explains the design choices behind the backend and where it deliberately deviates from the original specification.

## Goals

1. **Production-like, not enterprise.** A diploma reviewer should be able to read a single module and understand it without needing extra documentation.
2. **Modular monolith.** Strong logical boundaries between modules. One process, one DbContext, one migration history.
3. **Practical Clean Architecture.** Inside each module, code is layered: `Domain` (entities + enums) → `Application` (services, DTOs, validators) → `Infrastructure` (EF configurations, persistence) → `Presentation` (controllers). Layers above can depend on layers below, never the reverse.
4. **The Appointment system is the core.** All decisions optimise for clarity and correctness there.

## Project layout

| Project | Type | Purpose |
|---|---|---|
| `VetVik.Api` | ASP.NET Core Web API (executable) | Composition root: `Program.cs`, configuration, Swagger, JWT, CORS, exception middleware, seeder kick-off. |
| `VetVik.BuildingBlocks` | Class library | Cross-module primitives: `BaseEntity`, `IAuditableEntity`, `Result<T>`, exception types, `GlobalExceptionMiddleware`, JWT helpers, `ICurrentUser`, `IClock`, role constants. |
| `VetVik.Modules` | Class library | All feature modules. Internally organised into `Identity`, `Clinic`, `Pets`, `Doctors`, `Services`, `Appointments`, `MedicalRecords`, plus a shared `Persistence/VetVikDbContext`. |

### Why one `VetVik.Modules` project instead of one per module?

A "true" modular monolith with N projects multiplies migrations, references, and build time, and forces extra plumbing (per-module DbContext or facades). For a diploma the cost outweighs the benefit. Logical separation is enforced by folder layout, `internal` visibility on services, and the `ModuleRegistration` extension. Splitting later is mechanical.

## Database

A single `VetVikDbContext` extends `IdentityDbContext<ApplicationUser, IdentityRole, string>`. It applies all `IEntityTypeConfiguration<T>` from the assembly via `modelBuilder.ApplyConfigurationsFromAssembly(...)`, so each module owns its own configuration file alongside its entities.

### Entity overview (matches the spec, with a few documented improvements)

```
AspNetUsers (Identity)
 ├─ 1:0..1 OwnerProfiles
 ├─ 1:0..1 DoctorProfiles
 └─ 1:0..1 AdminProfiles

OwnerProfiles 1:N Pets
AnimalSpecies 1:N Breeds, 1:N Pets
Breeds        1:N Pets               (Breed.SpeciesId must match Pet.SpeciesId — enforced in service layer)

DoctorProfiles M:N Specializations through DoctorSpecializations (composite PK)
DoctorProfiles 1:N DoctorWorkingHours

ClinicSettings (singleton row) 1:N ClinicWorkingHours
Rooms (standalone)

ServiceCategories 1:N Services

Appointments references OwnerProfiles, Pets, DoctorProfiles, Rooms, Services
MedicalRecords 1:1 Appointment, N:1 Pets, N:1 DoctorProfiles
```

### Deliberate changes from the spec

| Change | Why |
|---|---|
| `Appointments.Status` stored as `int` (enum), not `nvarchar(30)` | Smaller, faster, type-safe, surfaced as readable strings in JSON via `JsonStringEnumConverter`. Same end-user experience. |
| `Pets.Sex` stored as `int` (enum `PetSex { Unknown, Male, Female }`) | Same reasoning as above. Spec said `nvarchar(20)`; enum is safer. |
| `ClinicWorkingHours.DayOfWeek` and `DoctorWorkingHours.DayOfWeek` are stored as `int` via converter, mapped from `System.DayOfWeek` | Aligns with .NET's built-in type. |
| Times stored as SQL `time` (`TimeOnly` in C#) | Matches semantics; doesn't drag a date along. |
| Pet/Breed/Species/Specialization soft-delete via `IsActive` when a delete would cascade-break referential integrity | Pragmatic: avoids "cannot delete because in use" forever. The service layer downgrades a hard delete to deactivation when references exist. |
| `ClinicSettings` is a singleton row (single record by convention) | A clinic has exactly one settings record; a join table would be artificial. |
| FluentValidation is enforced by a global `ValidationFilter` action filter | Avoids `ModelState.IsValid` checks in every controller. |
| Half-open intervals `[start, end)` for booking conflict checks | Back-to-back appointments (`10:00–11:00` and `11:00–12:00`) are allowed. This is the standard convention. |
| `Service.DurationMinutes` drives `Appointment.EndAt` when caller doesn't supply one | Matches business rule #6. |

## Appointment business rules

Encoded in two layers:

1. **`AppointmentRules`** — pure static functions (no DB, no time, no DI) for: overlap, same-day, clinic-hours fit, doctor-hours fit. Trivially unit-testable; see `VetVik.UnitTests/AppointmentRulesTests.cs`.
2. **`AppointmentService`** — orchestrates EF queries, applies pure rules, and persists. Throws `BusinessRuleException` (→ HTTP 422) or `ConflictException` (→ HTTP 409) with a clear message.

Concretely, on `CreateAppointmentAsync`:

1. Resolve the pet → derive `OwnerId` from the pet (single source of truth).
2. Verify the doctor exists and is active.
3. Verify the room exists and is active.
4. Compute `EndAt` from `Service.DurationMinutes` if not supplied.
5. Pure checks: end > start, same day, not in the past.
6. Check clinic working hours.
7. Check doctor working hours.
8. Conflict check on doctor (excludes Cancelled / NoShow).
9. Conflict check on room (excludes Cancelled / NoShow).
10. Persist with `Status = Scheduled`.

`Cancel` flips status to `Cancelled`, stamps `CancelledAt`, records the reason. `Complete` requires non-cancelled status. `MedicalRecord` insertion requires `Appointment.Status == Completed`.

## Authentication & authorization

- ASP.NET Core Identity with `ApplicationUser : IdentityUser` (only `CreatedAt`, `LastLoginAt`, `IsActive` added — business data lives in profile tables).
- Three roles: `Admin`, `Doctor`, `Owner` (constants in `VetVik.BuildingBlocks.Security.Roles`).
- JWT bearer tokens issued by `JwtTokenGenerator` from `JwtSettings`. The signing key, issuer, and audience come from configuration.
- `ICurrentUser` exposes the current user's id / email / roles via `IHttpContextAccessor`.
- Authorization is enforced declaratively via `[Authorize(Roles = ...)]`. Endpoints that touch "mine" data resolve the current user's `OwnerProfile` / `DoctorProfile` server-side; the client cannot tamper with the owner id.

## Error handling

`GlobalExceptionMiddleware` maps:

| Exception | HTTP |
|---|---|
| `ValidationAppException` | 400 (with `errors` dictionary) |
| `NotFoundException` | 404 |
| `ForbiddenException` | 403 |
| `ConflictException` | 409 |
| `BusinessRuleException` | 422 |
| everything else | 500 (logged with TraceId) |

The response body follows a small `ApiErrorResponse` shape (RFC 7807-like but not enforced).

## Testing strategy

- **Unit tests** target `AppointmentRules` — pure, fast, demo-friendly.
- **Integration tests** spin up the API via `WebApplicationFactory<Program>` and swap SQL Server for SQLite in-memory. Useful as a smoke check that DI and Swagger compose correctly without needing Docker to be up.

## Performance considerations

- All read APIs use `AsNoTracking` projections directly into DTOs to avoid hydrating entity graphs.
- Composite indexes are configured on `Appointments(DoctorId, StartAt)`, `Appointments(RoomId, StartAt)`, and `Appointments(OwnerId, StartAt)` — the dominant query patterns for the calendar views.
- Unique constraints enforced at the DB level: `OwnerProfile.UserId`, `DoctorProfile.UserId`, `AdminProfile.UserId`, `Rooms.Name`, `AnimalSpecies.Name`, `Breeds(SpeciesId, Name)`, `MedicalRecords.AppointmentId` (1:1 with Appointment), `Services(CategoryId, Name)`.

## Out of scope (intentionally)

- Microservices, message bus, event sourcing.
- Refresh tokens (the current setup uses long-ish access tokens for dev convenience — easy to add later).
- File storage for `Pet.PhotoUrl` / `DoctorProfile.PhotoUrl` — fields exist; the controller layer treats them as opaque URLs for now.
- Multi-tenant clinic support — one clinic per deployment.
- Calendar exports (iCal) and email/SMS notifications — clear extension points (`IClock`, dependency injection).
