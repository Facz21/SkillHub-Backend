# SkillHub — Workshop and Enrollment Management Platform (Backend API)

SkillHub is an educational center dedicated to practical training through short, in-person workshops in areas such as photography, culinary arts, public speaking, music, graphic design, and digital marketing. This repository contains the Backend API of the platform, engineered following Clean Architecture principles on .NET 10 to automate the full lifecycle of workshop scheduling, real-time seat capacity control, individual and batch enrollments from Excel spreadsheets, PDF attendance certificate generation, and advanced identity security powered by ASP.NET Core Identity.

Frontend Repository (Next.js 16 + TypeScript): [https://github.com/Facz21/SkillHub-Frontend](https://github.com/Facz21/SkillHub-Frontend)

---

## System Architecture (Clean Architecture)

The solution is structured into four independent projects inside `src/`, ensuring strict decoupling between core business rules, data persistence, and the HTTP presentation layer:

```text
+-----------------------------------------------------------------------+
|                           SkillHub Solution                           |
+-----------------------------------------------------------------------+
|  1. Presentation Layer (src/SkillHub.Api)                             |
|     - RESTful Controllers (/api/v1/*)                                 |
|     - JWT Bearer Authentication and CORS policy configuration         |
|     - Interactive OpenAPI Documentation (Scalar API Reference/Swagger)|
|     - Automatic EF Core migrations and database seeding on startup    |
+-----------------------------------------------------------------------+
|  2. Application Layer (src/SkillHub.Application)                      |
|     - Use cases and business services (WorkshopService,               |
|       EnrollmentService)                                              |
|     - Service contracts and interfaces (IAuthService,                 |
|       IWorkshopService, IEnrollmentService, IEmailService,            |
|       IPdfCertificateGenerator, IExcelEnrollmentImporter)             |
|     - Request and response Data Transfer Objects (DTOs)               |
+-----------------------------------------------------------------------+
|  3. Infrastructure Layer (src/SkillHub.Infrastructure)                |
|     - EF Core Database Context (SkillHubDbContext)                    |
|     - Fluent API entity configurations and PostgreSQL composite       |
|       indexes                                                         |
|     - Identity and JWT authentication service (AuthService)           |
|     - Transactional SMTP email service (SmtpEmailService)             |
|     - PDF certificate generator (QuestPdfCertificateGenerator)        |
|     - Resilient Excel batch importer (ClosedXmlEnrollmentImporter)    |
|     - Initial database seeder from Excel (ExcelSeederService)         |
+-----------------------------------------------------------------------+
|  4. Domain Layer (src/SkillHub.Domain)                                |
|     - Core entities (Workshop, Enrollment, ApplicationUser)           |
|     - Domain enumerations (EnrollmentStatus, Roles)                   |
|     - Domain exceptions and business rule invariants                  |
+-----------------------------------------------------------------------+
```

---

## Technology Stack

- **Runtime and Language:** .NET 10 / C# 13 (ASP.NET Core Web API)
- **Database Engine and ORM:** PostgreSQL 16 + Entity Framework Core 10 (`Npgsql.EntityFrameworkCore.PostgreSQL`) using a Code-First approach with automated migrations.
- **Security, Identity, and Authentication:**
  - `Microsoft.AspNetCore.Identity.EntityFrameworkCore` for user management, role-based access control (`Employee` and `Participant`), account lockout protection, and cryptographic token generation for password recovery and email confirmation.
  - `Microsoft.AspNetCore.Authentication.JwtBearer` for issuing and validating JWT tokens with dynamic expiration (2 hours by default or 7 days when `RememberMe` is enabled).
- **Transactional SMTP Email Service:** Native implementation via `System.Net.Mail.SmtpClient` (`SmtpEmailService`) with TLS/SSL support for sending HTML account verification and password reset emails, including an automatic console fallback mode when SMTP credentials are not configured.
- **PDF Document Generation:** `QuestPDF` (2025.1.1) for programmatic composition of landscape A4 attendance certificates with unique verification codes.
- **Spreadsheet Processing:** `ClosedXML` (0.104.2) for reading seed data (`SkillHub_Data.xlsx`) and performing resilient batch enrollment imports from `.xlsx` files.
- **API Documentation:** `Scalar.AspNetCore` and `Swashbuckle.AspNetCore` (Swagger UI).
- **Containerization:** Multi-stage `Dockerfile` and `docker-compose.yml` orchestrating PostgreSQL 16 (with healthchecks) and the .NET 10 Web API service.

---

## Enforced Business Rules

1. **Strict Maximum Capacity Control:**
   Each workshop defines a maximum seat capacity (`Capacity > 0`). The system calculates occupied seats in real time by counting only enrollments in `Active` status. Once available seats reach zero, any individual or batch enrollment attempt is rejected.
2. **Duplicate Enrollment Prevention:**
   A participant cannot hold more than one active enrollment in the same workshop simultaneously.
3. **Schedule Collision Detection:**
   Before confirming an enrollment, the system verifies that the time window of the target workshop (`StartDateTime` to `EndDateTime`) does not overlap with any other workshop in which the participant already holds an active enrollment, evaluating the condition:
   `Start_A < End_B AND End_A > Start_B`.
4. **Upcoming Workshops Only:**
   Enrollments are permitted exclusively for workshops whose start date and time is in the future (`StartDateTime > DateTime.UtcNow`).
5. **Differentiated Cancellation Policy and Audit Trail:**
   - **Participant:** May cancel their own enrollment only if **at least 24 hours** remain before the workshop starts.
   - **Instructor / Employee (`Employee`):** May cancel any participant's enrollment at any time prior to the workshop start time, without the 24-hour restriction.
   - **Seat Release and Traceability:** Upon cancellation, the enrollment transitions to `Cancelled`, the seat is immediately released, and audit metadata (`CancelledAt` in UTC and `CancelledBy`) is permanently recorded.
6. **Re-enrollment Support:**
   A participant who previously cancelled an enrollment in a workshop may re-enroll in that same workshop as long as seats remain available and all business rules are satisfied. In this scenario, the existing record is reactivated and previous cancellation metadata is cleared.
7. **Resilient Excel Batch Import (`.xlsx`):**
   The batch import endpoint processes rows sequentially without aborting the entire operation when invalid rows are encountered. Valid rows are persisted to the database, while rejected rows (non-existent participant, non-existent workshop, full capacity, duplicate enrollment, or schedule collision) are reported with the exact row number and rejection reason.
8. **Conditional PDF Certificate Generation:**
   Attendance certificates can only be generated for enrollments in `Active` status. Cancelled enrollments return an HTTP `400 Bad Request` response. Both the enrolled participant and any user with the `Employee` role are authorized to download the certificate.
9. **Identity Security and Session Management:**
   - User registration triggers an automatic email confirmation link.
   - Password recovery is protected against user enumeration.
   - Dynamic JWT lifetimes support short-lived sessions (2 hours) or persistent sessions (7 days) based on the `RememberMe` flag.

---

## Data Model

### Core Entities

- **`ApplicationUser` (inherits from `IdentityUser`):**
  - `Id` (string, PK)
  - `FullName` (string, max 150)
  - `Specialty` (string?, max 100, teaching specialty for users with the `Employee` role)
  - `CreatedAt` (DateTime UTC)
  - `Email`, `EmailConfirmed`, `PasswordHash` (managed by ASP.NET Core Identity)

- **`Workshop`:**
  - `Id` (int, auto-increment PK)
  - `Code` (string, unique workshop code, e.g., `FOT-001`)
  - `Title` (string, workshop name)
  - `Description` (string, detailed description)
  - `InstructorId` (string, FK to `ApplicationUser`)
  - `StartDateTime` (DateTime UTC, start date and time)
  - `EndDateTime` (DateTime UTC, end date and time)
  - `Capacity` (int, maximum number of participants)
  - `CreatedAt` (DateTime UTC)

- **`Enrollment`:**
  - `Id` (int, auto-increment PK)
  - `WorkshopId` (int, FK to `Workshop`)
  - `ParticipantId` (string, FK to `ApplicationUser`)
  - `EnrolledAt` (DateTime UTC)
  - `Status` (`EnrollmentStatus`: `Active = 1`, `Cancelled = 2`)
  - `CancelledAt` (DateTime? UTC)
  - `CancelledBy` (string?, identifier of the user who executed the cancellation)

---

## REST API Endpoints Specification (`/api/v1`)

### 1. Authentication and Identity Management (`/api/v1/auth`)

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Registers a new participant, assigns the `Participant` role, and sends a confirmation email. |
| `POST` | `/api/v1/auth/login` | Public | Authenticates credentials (`Email`, `Password`, `RememberMe`) and returns the JWT token and user profile. |
| `POST` | `/api/v1/auth/forgot-password` | Public | Generates a password reset token and sends a recovery link via SMTP email. |
| `POST` | `/api/v1/auth/reset-password` | Public | Resets the user's password after validating the cryptographic Identity token. |
| `POST` | `/api/v1/auth/confirm-email` | Public | Confirms the user's email address using the verification token sent upon registration. |
| `POST` | `/api/v1/auth/resend-confirmation` | Public | Resends the email verification link to accounts pending confirmation. |

### 2. Workshops and Instructors (`/api/v1/workshops`)

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/workshops` | Public | Lists all upcoming workshops ordered by start date with calculated active enrollments and available seats. |
| `GET` | `/api/v1/workshops/{id}` | Public | Retrieves full details for a specific workshop by its integer `Id`. |
| `GET` | `/api/v1/workshops/instructors` | Public | Lists all registered instructors (`Employee` role) with their name, email, and specialty. |
| `POST` | `/api/v1/workshops` | `Employee` | Creates a new workshop after validating future dates, positive capacity, and instructor existence. |
| `GET` | `/api/v1/workshops/{id}/enrollments` | `Employee` | Retrieves the complete roster of participants enrolled in a specific workshop. |

### 3. Enrollments, Batch Import, and Certificates (`/api/v1/enrollments`)

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/enrollments` | `Participant` | Enrolls the authenticated participant into a workshop after validating capacity, duplicates, and schedule overlaps. |
| `GET` | `/api/v1/enrollments/mine` | `Participant` | Returns the enrollment history (active and cancelled) of the authenticated participant. |
| `PATCH` | `/api/v1/enrollments/{id}/cancel` | Owner / `Employee` | Cancels an enrollment enforcing the 24-hour policy for participants or direct cancellation for employees. |
| `POST` | `/api/v1/enrollments/import` | `Employee` | Batch imports enrollments from an Excel file (`.xlsx` via `multipart/form-data`), returning success counts and row-level rejection diagnostics. |
| `GET` | `/api/v1/enrollments/{id}/certificate` | Owner / `Employee` | Generates and streams a real-time PDF attendance certificate for an active enrollment. |

### 4. Administrative Reports (`/api/v1/reports`)

| Method | Route | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/top-workshops` | `Employee` | Returns the workshop demand ranking ordered descending by active enrollments. |

---

## Deployment and Execution Guide

### Option A: Full Deployment with Docker Compose (Recommended)

The repository includes a `docker-compose.yml` file and a multi-stage `Dockerfile` that launch both PostgreSQL 16 and the .NET 10 Web API, automatically applying EF Core migrations and seeding initial data from `SkillHub_Data.xlsx`.

1. Clone the repository and navigate to the project root:
   ```bash
   git clone https://github.com/Facz21/SkillHub-Backend.git
   cd SkillHub-Backend
   ```
2. Build and start the containers in detached mode:
   ```bash
   docker compose up -d --build
   ```
3. Verify that both `skillhub-postgres` and `skillhub-api` containers are running:
   ```bash
   docker ps
   ```
4. The API will be available at `http://localhost:5076`.

### Option B: Local Development Execution

#### 1. Prerequisites
- .NET SDK 10.0 installed (`dotnet --version`)
- Running PostgreSQL instance (you can start only the database container with `docker compose up -d postgres`)

#### 2. Environment and User Secrets Configuration (Optional for Real SMTP)
For security reasons, SMTP credentials are never stored in Git-tracked files. To enable real email delivery via Gmail or another SMTP provider during local development, configure `.NET User Secrets`:
```bash
dotnet user-secrets set "Smtp:Host" "smtp.gmail.com" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:Port" "587" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:Username" "your_email@gmail.com" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:Password" "your_app_password" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:FromEmail" "your_email@gmail.com" --project src/SkillHub.Api
```
*(If no SMTP credentials are provided, the application runs in development fallback mode and logs confirmation and password reset links directly to the API console).*

#### 3. Start the API
```bash
dotnet run --project src/SkillHub.Api
```
On first startup, the application automatically runs Entity Framework Core migrations and populates the database from `SkillHub_Data.xlsx`.

#### 4. Interactive API Documentation
When running in development mode (`ASPNETCORE_ENVIRONMENT=Development`), interactive documentation is available at:
- **Scalar API Reference:** `http://localhost:5076/scalar/v1`
- **Swagger OpenAPI JSON:** `http://localhost:5076/swagger/v1/swagger.json`

---

## Pre-Seeded Test Credentials

On initial startup, `ExcelSeederService` automatically creates the following accounts from `SkillHub_Data.xlsx`:

### Instructor / Employee Accounts (Role: `Employee`)
| Full Name | Email Address | Password | Specialty |
| :--- | :--- | :--- | :--- |
| Andres Felipe Mejia Arango | `andres.mejia@correo.com` | `Instructor2026*` | Fotografia |
| Rosa Elena Barrios Polo | `rosa.barrios@correo.com` | `Instructor2026*` | Cocina |
| Mauricio Jimenez Cardenas | `mauricio.jimenez@correo.com` | `Instructor2026*` | Oratoria |
| Natalia Herrera Castano | `natalia.herrera@correo.com` | `Instructor2026*` | Diseno grafico |
| Santiago Vargas Montoya | `santiago.vargas@correo.com` | `Instructor2026*` | Musica |
| Carolina Suarez Restrepo | `carolina.suarez@correo.com` | `Instructor2026*` | Marketing digital |

### Participant Accounts (Role: `Participant`)
| Full Name | Email Address | Password | Role |
| :--- | :--- | :--- | :--- |
| Jorge Andres Perez Rojas | `jorge.perez@correo.com` | `Skillhub2026*` | Participant |
| Luz Marina Ospina Rios | `luz.ospina@correo.com` | `Skillhub2026*` | Participant |
| Carlos Eduardo Rincon Diaz | `carlos.rincon@correo.com` | `Skillhub2026*` | Participant |

---

## Included Database Deliverables

- **Code-First Migrations:** Located in `src/SkillHub.Infrastructure/Migrations`, covering the initial workshop and enrollment schema, ASP.NET Core Identity tables, and email confirmation state.
- **Complete SQL Dump (`SkillHub_Database_Dump.sql`):** Full SQL export containing the database DDL structure and pre-populated data (`INSERT INTO` statements) at the repository root.
- **Seed Workbook (`SkillHub_Data.xlsx`):** Excel spreadsheet containing Instructors, Participants, Workshops, and Enrollments sheets processed by the seeder and batch importer.

---

## Author

Andrés Felipe Cortés Zambrano
