# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Backend: .NET 10 / ASP.NET Core Web API with Clean Architecture (Domain, Application, Infrastructure, Api), EF Core Code-First, ASP.NET Core Identity, JWT Bearer authentication, ClosedXML (Excel import/seeding), QuestPDF (certificate generation), Scalar / Swagger UI.
Frontend: Decoupled Single-Page Web App using semantic HTML5, CSS3, Tailwind CSS, modern ES6 JavaScript, SweetAlert2 for accessible dialogs/alerts, and Lucide icons.

## Users

- **Participant (Primary Audience):** Learners seeking short, hands-on workshops in photography, cooking, public speaking, design, etc. They register, log in, browse available future workshops with live seat capacity, enroll, manage their enrollments, cancel within the 24-hour policy, and download formal PDF attendance certificates.
- **Employee / Instructor:** Center staff and teachers who manage workshops, inspect attendees, perform batch enrollments via Excel spreadsheets, cancel enrollments with administrative privileges, and review workshop demand analytics.
- **Visitor (Public):** Prospective students exploring the catalog of upcoming workshops and available seats without needing an account.

## Product Purpose

SkillHub replaces error-prone spreadsheet and form workflows with an automated, robust management platform. It eliminates overbooking, duplicate enrollments, and schedule collisions through strict domain enforcement while providing participants with an intuitive, self-service web interface.

## Positioning

Unlike generic form builders or bare CRUD systems, SkillHub guarantees data integrity through domain-driven schedule conflict detection, dynamic seat capacity calculation, audit-trailed cancellations, and instant cryptographic/PDF certificate generation under Clean Architecture standards.
