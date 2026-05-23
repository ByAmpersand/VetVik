# VetVik — Veterinary Clinic Management System

A production-like web platform that automates a veterinary clinic's day-to-day work: pet records, doctor schedules, room and service catalogs, and — at the centre — the appointment booking system. Built as a diploma project.

## Tech stack

- **Backend**: ASP.NET Core 10 Web API, C#
- **Architecture**: Modular Monolith + practical Clean Architecture per module
- **ORM**: Entity Framework Core 10 (Code First, migrations)
- **Database**: Microsoft SQL Server 2022 (in Docker for local dev)
- **Auth**: ASP.NET Core Identity + JWT bearer tokens
- **Validation**: FluentValidation
- **API docs**: Swashbuckle / Swagger
- **Logging**: Serilog
- **Frontend**: React 18 + TypeScript + Vite + Tailwind v4 + shadcn/ui (Figma export, located in `Client_VetVik/`)
- **Tests**: xUnit + FluentAssertions (unit), `Microsoft.AspNetCore.Mvc.Testing` + SQLite in-memory (integration)
- **Infra**: docker-compose for SQL Server

## Repository layout

```
VetVik/
├── Server_VetVik/                       # .NET 10 backend
│   ├── src/
│   │   ├── VetVik.Api/                  # Web API entry point (Program.cs, appsettings, Swagger, JWT)
│   │   ├── VetVik.BuildingBlocks/       # BaseEntity, Result, exceptions, middleware, JWT helpers, IClock
│   │   └── VetVik.Modules/              # all feature modules
│   │       ├── Identity/                # ApplicationUser + Admin/Doctor/Owner profiles, auth
│   │       ├── Clinic/                  # ClinicSettings, working hours, rooms
│   │       ├── Pets/                    # AnimalSpecies, Breeds, Pets
│   │       ├── Doctors/                 # Specializations, DoctorSpecializations, working hours
│   │       ├── Services/                # ServiceCategories, Services
│   │       ├── Appointments/            # core scheduling + business rules
│   │       ├── MedicalRecords/          # 1:0..1 per appointment
│   │       ├── Persistence/             # VetVikDbContext, DbSeeder, Migrations/
│   │       ├── Filters/                 # ValidationFilter (FluentValidation glue)
│   │       └── ModuleRegistration.cs    # AddVetVikModules() DI extension
│   ├── tests/
│   │   ├── VetVik.UnitTests/            # AppointmentRules etc.
│   │   └── VetVik.IntegrationTests/     # WebApplicationFactory smoke tests
│   └── VetVik.slnx
│
├── Client_VetVik/                       # Existing Figma export (untouched)
│   └── src/
│       └── api/                         # NEW: typed API client, JWT storage, fetch wrapper
│
├── docs/
│   └── architecture.md                  # rationale and ERD details
├── docker-compose.yml                   # MS SQL Server 2022
└── README.md
```

## Prerequisites

- .NET 10 SDK (`dotnet --list-sdks` should show 10.x)
- Docker (or Docker Desktop) for SQL Server
- SSMS 22 (optional, for browsing the database)
- `dotnet-ef` global tool: `dotnet tool install --global dotnet-ef`

## 1. Start SQL Server in Docker

From the repository root:

```bash
docker compose up -d
```

This runs **SQL Server 2022 Developer** on `localhost:1433` with credentials `sa / YourStrong@Passw0rd`. Data is persisted in the named volume `vetvik_sql_data`.

Verify:

```bash
docker compose ps
docker compose logs sqlserver --tail=30
```

## 2. Connect from SSMS 22

| Field | Value |
|---|---|
| Server name | `localhost,1433` (or `localhost`) |
| Authentication | SQL Server Authentication |
| Login | `sa` |
| Password | `YourStrong@Passw0rd` |
| Encryption | Optional, **Trust server certificate**: ON |

The `VetVikDb` database is created automatically on first run (see step 4).

## 3. Apply migrations manually (optional)

Migrations are applied automatically on startup in `Development` (`SeedOnStartup=true` in `appsettings.Development.json`). To run them by hand:

```bash
cd Server_VetVik
dotnet ef database update --startup-project src/VetVik.Api --project src/VetVik.Modules
```

To create a new migration after changing entities:

```bash
dotnet ef migrations add <Name> --startup-project src/VetVik.Api --project src/VetVik.Modules --output-dir Persistence/Migrations
```

## 4. Run the backend

From Visual Studio, set `VetVik.Api` as startup project and run (F5). Or from the CLI:

```bash
cd Server_VetVik
dotnet run --project src/VetVik.Api
```

On first run the seeder will:

1. Run all pending migrations.
2. Create roles **Admin**, **Doctor**, **Owner**.
3. Create seed users with profiles (credentials from `appsettings.Development.json`):
   - `super@vetvik.local` / `Super123`
   - `admin@vetvik.local` / `Admin123`
   - `doctor@vetvik.local` / `Doctor123`
   - `anna@vetvik.local` / `Client123`
4. Seed `ClinicSettings`, working hours, rooms, species/breeds, specializations, services, and two demo pets.

## 5. Open Swagger

Once the backend is running:

- HTTP: <http://localhost:5071/swagger>
- HTTPS: <https://localhost:7262/swagger>

To call protected endpoints from Swagger:

1. `POST /api/auth/login` with `{ "email": "admin@vetvik.local", "password": "Admin123" }`.
2. Copy the `accessToken` from the response.
3. Click **Authorize** at the top right and paste the token (Swagger prefixes `Bearer ` automatically).

## 6. Run tests

```bash
cd Server_VetVik
dotnet test
```

## Frontend integration

The Vite client lives in `Client_VetVik/` and has not been touched apart from a new `src/api/` folder:

```ts
import { authApi, appointmentsApi, petsApi } from "@/api";

const auth = await authApi.login({ email, password });   // stores JWT in localStorage
const myAppointments = await appointmentsApi.mineOwner();
```

The base URL defaults to `http://localhost:5071`. Override per environment with `VITE_API_BASE_URL` in `.env`.

To run the frontend:

```bash
cd Client_VetVik
pnpm install            # or npm install
pnpm dev                # http://localhost:5173
```

CORS is preconfigured on the API for `http://localhost:5173`.

## Next steps (post-stage-1)

- Wire individual pages (`OwnerAppointments`, `DoctorSchedule`, `ClinicCalendar`, ...) to the API client.
- Add refresh tokens if access-token-only proves limiting in practice.
- Wire `dotnet ef bundle` or a startup migration runner for non-development environments.
- Add health checks (`Microsoft.Extensions.Diagnostics.HealthChecks.SqlServer`).
- Add OpenAPI-driven TypeScript generation (e.g., `openapi-typescript`) to keep `src/api/types.ts` in sync.

See `docs/architecture.md` for the design rationale.
