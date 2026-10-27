# SkillHub — Workshop & Enrollment Management Platform

SkillHub is an educational center offering short, in-person workshops in photography, culinary arts, public speaking, music, graphic design, and digital marketing. This project provides a robust, enterprise-grade solution that replaces legacy manual spreadsheet processes with an automated system ensuring strict data integrity, preventing overbooking, duplicate enrollments, and schedule collisions.

---

## 🏗️ Architectural Overview (Clean Architecture)

The solution is engineered according to the principles of **Clean Architecture**, completely decoupling business rules from frameworks and presentation mechanisms:

```
┌─────────────────────────────────────────────────────────────┐
│                      SkillHub Solution                      │
├─────────────────────────────────────────────────────────────┤
│  Presentation Layer                                         │
│    - SkillHub.Api (ASP.NET Core Web API, JWT, Scalar/Swagger)│
│    - Frontend (Decoupled SPA with HTML5, Tailwind CSS, JS)  │
├─────────────────────────────────────────────────────────────┤
│  Application Layer (SkillHub.Application)                   │
│    - DTOs, Mappings, Business Validations, Interfaces       │
├─────────────────────────────────────────────────────────────┤
│  Infrastructure Layer (SkillHub.Infrastructure)             │
│    - EF Core Code-First, PostgreSQL, Identity, ClosedXML,   │
│      QuestPDF, Excel Data Seeder                            │
├─────────────────────────────────────────────────────────────┤
│  Domain Layer (SkillHub.Domain)                             │
│    - Entities (Workshop, Enrollment, ApplicationUser),      │
│      Enums, Domain Exceptions & Core Invariants             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Technologies Used

- **Runtime & Language:** .NET 10 / C# 13 (ASP.NET Core Web API)
- **Database & ORM:** PostgreSQL 16 + Entity Framework Core (Code-First with Migrations via `Npgsql.EntityFrameworkCore.PostgreSQL`)
- **Security & Authentication:** ASP.NET Core Identity + JWT Bearer Tokens (`System.IdentityModel.Tokens.Jwt`)
- **Document Generation:** `QuestPDF` for cryptographic, structured attendance certificates
- **Spreadsheet Processing:** `ClosedXML` for resilient batch enrollments (`.xlsx`)
- **API Documentation:** Interactive Scalar API Reference (`Scalar.AspNetCore`) & Swagger UI (`Swashbuckle.AspNetCore`)
- **Frontend Layer:** Decoupled SPA built with semantic HTML5, CSS3, Tailwind CSS, modern ES6 JavaScript, SweetAlert2 for accessible dialogs, Lucide Icons, and Canvas Confetti.

---

## 📋 Business Rules Enforced

1. **Capacity Limit:** An enrollment cannot exceed the workshop's maximum seat capacity. Only active enrollments are counted.
2. **No Duplicate Enrollments:** A participant cannot have more than one active enrollment in the same workshop.
3. **No Schedule Collisions:** A participant cannot enroll in a workshop whose schedule overlaps with another workshop where they already have an active enrollment ($\text{Start}_A < \text{End}_B \land \text{End}_A > \text{Start}_B$).
4. **Future Workshops Only:** Enrollments are strictly permitted only for workshops that have not yet started.
5. **Cancellation Policy:**
   - **Participant:** Allowed up to **24 hours before** the workshop's start time. Releasing the seat immediately.
   - **Employee:** Can cancel any participant's enrollment at any time prior to workshop start without the 24-hour restriction.
   - Audit trail is permanently recorded with `CancelledBy` and `CancelledAt`.
6. **Re-enrollment:** Participants with a previously cancelled enrollment can re-enroll in the same workshop if seats remain available and all business invariants hold.
7. **Resilient Excel Batch Import:** Valid rows in the Excel spreadsheet are persisted even if other rows are rejected. The response provides the count of successful enrollments and detailed diagnostics for each rejected row (row number and specific rejection reason).
8. **Conditional PDF Certificate:** Certificates are strictly generated for active enrollments only; cancelled enrollments return an HTTP 400 error.

---

## 🛠️ Setup and Execution Guide

### 1. Prerequisites
- [.NET SDK 10 or 8+](https://dotnet.microsoft.com/download)
- [Docker](https://docs.docker.com/get-docker/) & Docker Compose (or a local PostgreSQL instance)

### 2. Database Configuration
Run the included Docker Compose configuration to start PostgreSQL:
```bash
docker compose up -d
```
The database will be available at `localhost:5432` with:
- **Database:** `SkillHubDb`
- **Username:** `postgres`
- **Password:** `postgres`

### 3. Run the Backend API
From the repository root, start the API:
```bash
dotnet run --project src/SkillHub.Api
```
The API will automatically:
1. Apply pending EF Core database migrations.
2. Seed instructors, participants, and workshops from `SkillHub_Data.xlsx`.
3. Start listening at `http://localhost:5076` (or `http://localhost:5000`).

### 4. Interactive Documentation
- **Scalar API Reference:** [http://localhost:5076/scalar/v1](http://localhost:5076/scalar/v1)
- **Swagger UI:** [http://localhost:5076/swagger](http://localhost:5076/swagger)

### 5. Run the Decoupled Frontend
Serve the static frontend application:
```bash
python3 -m http.server 3000 --directory frontend
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🔑 Default Test Credentials

All accounts are pre-seeded upon first application startup:

### Employee / Instructor Accounts:
| Full Name | Email | Password | Specialty |
| :--- | :--- | :--- | :--- |
| Andrés Felipe Mejía Arango | `andres.mejia@correo.com` | `Instructor2026*` | Fotografía |
| Rosa Elena Barrios Polo | `rosa.barrios@correo.com` | `Instructor2026*` | Cocina |
| Mauricio Jiménez Cárdenas | `mauricio.jimenez@correo.com` | `Instructor2026*` | Oratoria |
| Natalia Herrera Castaño | `natalia.herrera@correo.com` | `Instructor2026*` | Diseño gráfico |

### Participant Accounts:
| Full Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| Jorge Andrés Pérez Rojas | `jorge.perez@correo.com` | `Skillhub2026*` | Participant |
| Luz Marina Ospina Ríos | `luz.ospina@correo.com` | `Skillhub2026*` | Participant |
| Carlos Eduardo Rincón Díaz | `carlos.rincon@correo.com` | `Skillhub2026*` | Participant |

*(New participants can also register directly via `POST /api/v1/auth/register` or through the Web UI).*

---

## 📡 API Endpoints Specification

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Public | Registers a new participant |
| `POST` | `/api/v1/auth/login` | Public | Authenticates and returns JWT token |
| `GET` | `/api/v1/workshops` | Public | Lists upcoming workshops with calculated available seats |
| `GET` | `/api/v1/workshops/{id}` | Public | Gets detailed workshop information |
| `POST` | `/api/v1/workshops` | Employee | Creates a new workshop |
| `GET` | `/api/v1/workshops/{id}/enrollments` | Employee | Lists all attendees for a specific workshop |
| `POST` | `/api/v1/enrollments` | Participant | Enrolls authenticated participant into a workshop |
| `GET` | `/api/v1/enrollments/mine` | Participant | Lists enrollments belonging to authenticated participant |
| `PATCH` | `/api/v1/enrollments/{id}/cancel` | Owner / Employee | Cancels enrollment with policy validation and seat release |
| `POST` | `/api/v1/enrollments/import` | Employee | Batch enrolls participants from an Excel spreadsheet (`.xlsx`) |
| `GET` | `/api/v1/enrollments/{id}/certificate` | Owner / Employee | Downloads attendance certificate in PDF format |
| `GET` | `/api/v1/reports/top-workshops` | Employee | Demand report sorted by active enrollments descending |

---

## 💾 Database Deliverables

- **SQL Dump:** The complete database schema and pre-populated data export is available in `SkillHub_Database_Dump.sql`.
- **Migrations:** Full version-controlled EF Core migration source files are located in `src/SkillHub.Infrastructure/Migrations`.

---

## 👤 Author Information

- **Full Name:** Andrés Felipe Cortés Zambrano
- **Clan:** Riwi Development Clan
- **Email:** andres.cortes@riwi.io
- **Identity Document:** 1020304050
