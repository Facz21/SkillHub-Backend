# SkillHub — Plataforma de Gestion de Talleres e Inscripciones (Backend API)

SkillHub es un centro educativo dedicado a la formacion practica mediante talleres presenciales de corta duracion en areas como fotografia, cocina, oratoria, musica, diseno grafico y marketing digital. Este repositorio contiene el Backend de la plataforma, disenado bajo los principios de Clean Architecture en .NET 10 para automatizar el ciclo completo de programacion de talleres, control de cupos en tiempo real, inscripciones individuales y masivas desde archivos Excel, emision de constancias de asistencia en formato PDF y seguridad avanzada mediante ASP.NET Core Identity.

Repositorio del Frontend (Next.js 16 + TypeScript): [https://github.com/Facz21/SkillHub-Frontend](https://github.com/Facz21/SkillHub-Frontend)

---

## Arquitectura del Sistema (Clean Architecture)

La solucion esta dividida en cuatro proyectos independientes dentro de `src/`, garantizando el desacoplamiento estricto entre las reglas de negocio, la persistencia de datos y la capa de exposicion HTTP:

```text
+-----------------------------------------------------------------------+
|                           SkillHub Solution                           |
+-----------------------------------------------------------------------+
|  1. Capa de Presentacion (src/SkillHub.Api)                           |
|     - Controladores RESTful (/api/v1/*)                               |
|     - Configuracion de autenticacion JWT Bearer y politicas de CORS   |
|     - Documentacion interactiva OpenAPI (Scalar API Reference/Swagger)|
|     - Inicializacion automatica de migraciones y seeders al arranque  |
+-----------------------------------------------------------------------+
|  2. Capa de Aplicacion (src/SkillHub.Application)                     |
|     - Casos de uso y servicios de negocio (WorkshopService,           |
|       EnrollmentService)                                              |
|     - Contratos e interfaces (IAuthService, IWorkshopService,         |
|       IEnrollmentService, IEmailService, IPdfCertificateGenerator,    |
|       IExcelEnrollmentImporter)                                       |
|     - Objetos de transferencia de datos (DTOs) de entrada y salida    |
+-----------------------------------------------------------------------+
|  3. Capa de Infraestructura (src/SkillHub.Infrastructure)             |
|     - Contexto de base de datos EF Core (SkillHubDbContext)           |
|     - Configuraciones Fluent API e indices compuestos en PostgreSQL   |
|     - Implementacion de Identity y JWT (AuthService)                  |
|     - Servicio de correo transaccional SMTP (SmtpEmailService)        |
|     - Generador de certificados PDF (QuestPdfCertificateGenerator)    |
|     - Importador resiliente de Excel (ClosedXmlEnrollmentImporter)    |
|     - Seeder inicial desde archivo Excel (ExcelSeederService)         |
+-----------------------------------------------------------------------+
|  4. Capa de Dominio (src/SkillHub.Domain)                             |
|     - Entidades centrales (Workshop, Enrollment, ApplicationUser)     |
|     - Enumeraciones de dominio (EnrollmentStatus, Roles)              |
|     - Excepciones de dominio (DomainValidationException,              |
|       EntityNotFoundException, ForbiddenOperationException)           |
+-----------------------------------------------------------------------+
```

---

## Stack Tecnologico

- **Plataforma y Lenguaje:** .NET 10 / C# 13 (ASP.NET Core Web API)
- **Motor de Base de Datos y ORM:** PostgreSQL 16 + Entity Framework Core 10 (`Npgsql.EntityFrameworkCore.PostgreSQL`) bajo enfoque Code-First con migraciones automaticas.
- **Seguridad, Identidad y Autenticacion:**
  - `Microsoft.AspNetCore.Identity.EntityFrameworkCore` para gestion de usuarios, roles (`Employee` y `Participant`), bloqueo preventivo de cuentas y generacion de tokens criptograficos de recuperacion de contrasena y verificacion de correo electronico.
  - `Microsoft.AspNetCore.Authentication.JwtBearer` para emision y validacion de tokens JWT con expiracion dinamica (2 horas por defecto o 7 dias con la opcion de recordar sesion).
- **Correo Transaccional SMTP:** Implementacion nativa con `System.Net.Mail.SmtpClient` (`SmtpEmailService`) con soporte TLS/SSL para envio de correos HTML de confirmacion de cuenta y restablecimiento de contrasena, y modo de respaldo en consola cuando no se configuran credenciales SMTP.
- **Generacion de Documentos PDF:** `QuestPDF` (2025.1.1) para la composicion programatica de certificados de asistencia en tamano A4 horizontal con identificador unico de verificacion.
- **Procesamiento de Hojas de Calculo:** `ClosedXML` (0.104.2) para lectura de datos semilla (`SkillHub_Data.xlsx`) e importacion masiva de inscripciones desde archivos `.xlsx`.
- **Documentacion de API:** `Scalar.AspNetCore` y `Swashbuckle.AspNetCore` (Swagger UI).
- **Contenerizacion:** `Dockerfile` multi-stage optimizado y `docker-compose.yml` con orquestacion de PostgreSQL (con healthcheck) y el servicio Web API.

---

## Reglas de Negocio Implementadas

1. **Control Estricto de Cupo Maximo:**
   Cada taller define una capacidad maxima (`MaxCapacity > 0`). El sistema calcula en tiempo real los asientos ocupados considerando unicamente las inscripciones en estado `Active`. Cuando los cupos disponibles llegan a cero, cualquier intento de inscripcion individual o por lote es rechazado.
2. **Prevencion de Inscripciones Duplicadas:**
   Un participante no puede mantener mas de una inscripcion activa en el mismo taller simultaneamente.
3. **Deteccion de Cruce de Horarios (Colisiones):**
   Antes de confirmar una inscripcion, el sistema verifica que el rango horario del nuevo taller (`StartDate` a `EndDate`, calculado a partir de `DurationMinutes`) no se solape con ningun otro taller en el que el participante ya posea una inscripcion activa, evaluando la condicion matematica:
   `Start_A < End_B AND End_A > Start_B`.
4. **Restriccion de Talleres Futuros:**
   Solo se permiten inscripciones en talleres cuya fecha y hora de inicio sea posterior al instante actual (`StartDate > DateTime.UtcNow`).
5. **Politica Diferenciada de Cancelacion y Auditoria:**
   - **Participante:** Puede cancelar su propia inscripcion unicamente si faltan **al menos 24 horas** para el inicio del taller.
   - **Instructor / Empleado (`Employee`):** Puede cancelar la inscripcion de cualquier participante en cualquier momento previo al inicio del taller, sin la restriccion de las 24 horas.
   - **Liberacion y Trazabilidad:** Al cancelar, el estado pasa a `Cancelled`, el cupo se libera de inmediato y se registran los campos de auditoria `CancelledAt` (UTC) y `CancelledBy` (correo del ejecutor).
6. **Re-inscripcion Permitida:**
   Un participante que haya cancelado previamente su inscripcion en un taller puede volver a inscribirse en el mismo taller siempre que existan cupos disponibles y se cumplan las demas reglas de negocio. En este caso, el registro existente se reactiva limpiando los metadatos de cancelacion previos.
7. **Importacion Masiva Resiliente desde Excel (`.xlsx`):**
   El endpoint de carga masiva procesa fila por fila sin abortar la transaccion global ante registros invalidos. Las filas que cumplen todas las validaciones se persisten en la base de datos, mientras que las filas con errores (participante inexistente, taller inexistente, cupo agotado, duplicado o cruce de horario) se reportan detalladamente indicando el numero de fila y el motivo exacto del rechazo.
8. **Emision Condicional de Certificados PDF:**
   Los certificados de asistencia solo pueden generarse para inscripciones en estado `Active`. Si una inscripcion fue cancelada, el sistema rechaza la generacion con codigo HTTP `400 Bad Request`. Tanto el participante titular como cualquier usuario con rol `Employee` estan autorizados para descargar la constancia.
9. **Seguridad de Identidad y Sesiones:**
   - Registro con envio automatico de enlace de verificacion de correo electronico.
   - Recuperacion de contrasena protegida contra enumeracion de usuarios.
   - Sesiones JWT de corta duracion (2 horas) o larga duracion (7 dias) segun la preferencia `RememberMe`.

---

## Modelo de Datos

### Entidades Principales

- **`ApplicationUser` (hereda de `IdentityUser`):**
  - `Id` (string, PK)
  - `FullName` (string, max 150)
  - `Specialty` (string?, max 100, especialidad docente para usuarios con rol `Employee`)
  - `CreatedAt` (DateTime UTC)
  - `Email`, `EmailConfirmed`, `PasswordHash` (gestionados por ASP.NET Core Identity)

- **`Workshop`:**
  - `Id` (int, PK autoincremental)
  - `Code` (string, codigo unico del taller, ej. `FOT-001`)
  - `Title` (string, nombre del taller)
  - `Description` (string, descripcion detallada)
  - `InstructorId` (string, FK hacia `ApplicationUser`)
  - `StartDateTime` (DateTime UTC, fecha y hora de inicio)
  - `EndDateTime` (DateTime UTC, fecha y hora de finalizacion)
  - `Capacity` (int, cupo maximo de participantes)
  - `CreatedAt` (DateTime UTC)

- **`Enrollment`:**
  - `Id` (int, PK autoincremental)
  - `WorkshopId` (int, FK hacia `Workshop`)
  - `ParticipantId` (string, FK hacia `ApplicationUser`)
  - `EnrolledAt` (DateTime UTC)
  - `Status` (`EnrollmentStatus`: `Active = 1`, `Cancelled = 2`)
  - `CancelledAt` (DateTime? UTC)
  - `CancelledBy` (string?, identificador del usuario que ejecuto la cancelacion)

---

## Especificacion Detallada de Endpoints REST (`/api/v1`)

### 1. Autenticacion y Gestion de Identidad (`/api/v1/auth`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Publico | Registra un nuevo participante, asigna el rol `Participant` y envia correo de confirmacion. |
| `POST` | `/api/v1/auth/login` | Publico | Autentica credenciales (`Email`, `Password`, `RememberMe`) y retorna el token JWT junto al perfil del usuario. |
| `POST` | `/api/v1/auth/forgot-password` | Publico | Genera un token de recuperacion de contrasena y envia el enlace de restablecimiento por correo SMTP. |
| `POST` | `/api/v1/auth/reset-password` | Publico | Restablece la contrasena del usuario validando el token criptografico de Identity. |
| `POST` | `/api/v1/auth/confirm-email` | Publico | Confirma la direccion de correo electronico del usuario mediante el token enviado al registrarse. |
| `POST` | `/api/v1/auth/resend-confirmation` | Publico | Reenvia el enlace de verificacion de correo a cuentas pendientes de confirmacion. |

### 2. Talleres e Instructores (`/api/v1/workshops`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/workshops` | Publico | Lista todos los talleres futuros ordenados por fecha de inicio con cupos activos y disponibles calculados. |
| `GET` | `/api/v1/workshops/{id}` | Publico | Obtiene el detalle completo de un taller especifico por su identificador `Guid`. |
| `GET` | `/api/v1/workshops/instructors` | Publico | Lista todos los instructores registrados (rol `Employee`) con su nombre, correo y especialidad. |
| `POST` | `/api/v1/workshops` | `Employee` | Crea un nuevo taller validando fecha futura, capacidad mayor a cero, duracion positiva e instructor valido. |
| `GET` | `/api/v1/workshops/{id}/enrollments` | `Employee` | Obtiene la nomina completa de participantes inscritos en un taller especifico. |

### 3. Inscripciones, Carga Masiva y Certificados (`/api/v1/enrollments`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/enrollments` | `Participant` | Inscribe al participante autenticado en un taller validando cupos, duplicados y cruces de horario. |
| `GET` | `/api/v1/enrollments/mine` | `Participant` | Retorna el historial de inscripciones (activas y canceladas) del participante autenticado. |
| `PATCH` | `/api/v1/enrollments/{id}/cancel` | Titular / `Employee` | Cancela una inscripcion aplicando la politica de 24 horas para participantes o cancelacion directa para empleados. |
| `POST` | `/api/v1/enrollments/import` | `Employee` | Importa inscripciones masivas desde un archivo Excel (`.xlsx` en `multipart/form-data`) devolviendo conteo de exitos y detalle de rechazos por fila. |
| `GET` | `/api/v1/enrollments/{id}/certificate` | Titular / `Employee` | Genera y descarga en tiempo real el certificado de asistencia en formato PDF para una inscripcion activa. |

### 4. Reportes Administrativos (`/api/v1/reports`)

| Metodo | Ruta | Acceso | Descripcion |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/reports/top-workshops` | `Employee` | Retorna el ranking de talleres ordenados de forma descendente por cantidad de inscripciones activas. |

---

## Guia de Despliegue y Ejecucion

### Opcion A: Despliegue Completo con Docker Compose (Recomendado)

El repositorio incluye un archivo `docker-compose.yml` y un `Dockerfile` multi-stage que levantan tanto la base de datos PostgreSQL 16 como la API en `.NET 10`, aplicando migraciones y cargando los datos iniciales de `SkillHub_Data.xlsx` automaticamente.

1. Clonar el repositorio y ubicarse en la raiz:
   ```bash
   git clone https://github.com/Facz21/SkillHub-Backend.git
   cd SkillHub-Backend
   ```
2. Construir e iniciar los contenedores en segundo plano:
   ```bash
   docker compose up -d --build
   ```
3. Verificar que los contenedores `skillhub-postgres` y `skillhub-api` esten activos:
   ```bash
   docker ps
   ```
4. La API estara disponible en `http://localhost:5076`.

### Opcion B: Ejecucion Local para Desarrollo

#### 1. Prerrequisitos
- .NET SDK 10.0 instalado (`dotnet --version`)
- Instancia de PostgreSQL en ejecucion (puede iniciarse solo la base de datos con `docker compose up -d postgres`)

#### 2. Configuracion de Variables y Secretos de Usuario (Opcional para SMTP Real)
Por seguridad, las credenciales SMTP no se almacenan en archivos versionados por Git. Para habilitar el envio real de correos mediante Gmail u otro proveedor SMTP en entorno local, configure `.NET User Secrets`:
```bash
dotnet user-secrets set "Smtp:Host" "smtp.gmail.com" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:Port" "587" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:Username" "tu_correo@gmail.com" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:Password" "tu_app_password" --project src/SkillHub.Api
dotnet user-secrets set "Smtp:FromEmail" "tu_correo@gmail.com" --project src/SkillHub.Api
```
*(Si no se configuran credenciales SMTP, el sistema opera en modo desarrollo registrando los enlaces de confirmacion y recuperacion directamente en los logs de consola de la API).*

#### 3. Iniciar la API
```bash
dotnet run --project src/SkillHub.Api
```
Al iniciar por primera vez, el sistema ejecutara automaticamente las migraciones de Entity Framework Core y poblara la base de datos a partir del archivo `SkillHub_Data.xlsx`.

#### 4. Documentacion Interactiva de la API
En entorno de desarrollo (`ASPNETCORE_ENVIRONMENT=Development`), puede explorar y probar todos los endpoints desde el navegador en:
- **Scalar API Reference:** `http://localhost:5076/scalar/v1`
- **Swagger UI:** `http://localhost:5076/swagger/v1/swagger.json`

---

## Credenciales de Prueba Pre-cargadas

Al iniciar el sistema, el servicio `ExcelSeederService` crea automaticamente las siguientes cuentas de prueba a partir de `SkillHub_Data.xlsx`:

### Cuentas de Instructores / Empleados (Rol: `Employee`)
| Nombre Completo | Correo Electronico | Contrasena | Especialidad |
| :--- | :--- | :--- | :--- |
| Andres Felipe Mejia Arango | `andres.mejia@correo.com` | `Instructor2026*` | Fotografia |
| Rosa Elena Barrios Polo | `rosa.barrios@correo.com` | `Instructor2026*` | Cocina |
| Mauricio Jimenez Cardenas | `mauricio.jimenez@correo.com` | `Instructor2026*` | Oratoria |
| Natalia Herrera Castano | `natalia.herrera@correo.com` | `Instructor2026*` | Diseno grafico |
| Santiago Vargas Montoya | `santiago.vargas@correo.com` | `Instructor2026*` | Musica |
| Carolina Suarez Restrepo | `carolina.suarez@correo.com` | `Instructor2026*` | Marketing digital |

### Cuentas de Participantes (Rol: `Participant`)
| Nombre Completo | Correo Electronico | Contrasena | Rol |
| :--- | :--- | :--- | :--- |
| Jorge Andres Perez Rojas | `jorge.perez@correo.com` | `Skillhub2026*` | Participant |
| Luz Marina Ospina Rios | `luz.ospina@correo.com` | `Skillhub2026*` | Participant |
| Carlos Eduardo Rincon Diaz | `carlos.rincon@correo.com` | `Skillhub2026*` | Participant |

---

## Entregables de Base de Datos Incluidos

- **Migraciones Code-First:** Ubicadas en `src/SkillHub.Infrastructure/Migrations`, incluyendo el esquema inicial de talleres e inscripciones, la integracion con tablas de ASP.NET Core Identity y el soporte de estado de verificacion de correo electronico.
- **Volcado SQL (`SkillHub_Database_Dump.sql`):** Archivo SQL completo con la estructura DDL y datos pre-cargados en la raiz del repositorio.
- **Fuente de Datos Semilla (`SkillHub_Data.xlsx`):** Libro de Excel con las hojas de Instructores, Participantes, Talleres e Inscripciones procesadas por el seeder e importador.

---

## Autor

Andrés Felipe Cortés Zambrano
