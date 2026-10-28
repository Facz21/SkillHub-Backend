using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;
using SkillHub.Domain.Entities;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IConfiguration configuration,
        IEmailService emailService)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _configuration = configuration;
        _emailService = emailService;
    }

    public async Task<AuthResponseDto> RegisterParticipantAsync(RegisterRequestDto request)
    {
        var existingUser = await _userManager.FindByEmailAsync(request.Email);
        if (existingUser != null)
            throw new BusinessRuleValidationException("Ya existe un usuario registrado con este correo electrónico.");

        var user = new ApplicationUser
        {
            UserName = request.Email.Trim(),
            Email = request.Email.Trim(),
            FullName = request.FullName.Trim(),
            EmailConfirmed = false,
            CreatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, request.Password);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleValidationException($"No se pudo completar el registro: {errors}");
        }

        if (!await _roleManager.RoleExistsAsync("Participant"))
        {
            await _roleManager.CreateAsync(new IdentityRole("Participant"));
        }
        await _userManager.AddToRoleAsync(user, "Participant");

        // Generate Email Confirmation Token & send real email via SMTP
        var confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var htmlBody = BuildEmailTemplate(
            title: "Confirma tu correo electrónico en SkillHub",
            greeting: $"Hola, {WebUtility.HtmlEncode(user.FullName)}:",
            message: "Gracias por registrarte en SkillHub. Para verificar tu dirección de correo electrónico y activar todas las funciones de tu cuenta, copia el siguiente código/token de confirmación en la plataforma:",
            token: confirmToken,
            footerNote: "Si no creaste esta cuenta en SkillHub, puedes ignorar este mensaje.");

        var sentViaSmtp = await _emailService.SendEmailAsync(
            user.Email,
            "SkillHub — Código de Confirmación de Correo Electrónico",
            htmlBody);

        var response = await GenerateAuthResponseAsync(user, "Participant", rememberMe: true);
        response.EmailDispatchedViaSmtp = sentViaSmtp;
        response.DevEmailToken = confirmToken;
        return response;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email);
        if (user == null)
            throw new BusinessRuleValidationException("Credenciales inválidas. Verifica tu correo y contraseña.");

        var isValid = await _userManager.CheckPasswordAsync(user, request.Password);
        if (!isValid)
            throw new BusinessRuleValidationException("Credenciales inválidas. Verifica tu correo y contraseña.");

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Participant";

        return await GenerateAuthResponseAsync(user, primaryRole, request.RememberMe);
    }

    public async Task<UserProfileDto> GetProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID '{userId}' was not found.");

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Participant";

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Specialty = user.Specialty,
            Role = primaryRole,
            CreatedAt = user.CreatedAt,
            EmailConfirmed = user.EmailConfirmed
        };
    }

    public async Task<UserProfileDto> UpdateProfileAsync(string userId, UpdateProfileRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID '{userId}' was not found.");

        if (string.IsNullOrWhiteSpace(request.FullName))
            throw new BusinessRuleValidationException("El nombre completo no puede estar vacío.");

        user.FullName = request.FullName.Trim();
        if (request.Specialty != null)
        {
            user.Specialty = request.Specialty.Trim();
        }

        var result = await _userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleValidationException($"Error al actualizar el perfil: {errors}");
        }

        var roles = await _userManager.GetRolesAsync(user);
        var primaryRole = roles.FirstOrDefault() ?? "Participant";

        return new UserProfileDto
        {
            Id = user.Id,
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Specialty = user.Specialty,
            Role = primaryRole,
            CreatedAt = user.CreatedAt,
            EmailConfirmed = user.EmailConfirmed
        };
    }

    public async Task ChangePasswordAsync(string userId, ChangePasswordRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            throw new NotFoundException($"User with ID '{userId}' was not found.");

        var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleValidationException($"No se pudo cambiar la contraseña: {errors}");
        }
    }

    public async Task<AuthTokenDispatchResponseDto> ForgotPasswordAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (user == null)
            throw new BusinessRuleValidationException("No encontramos ninguna cuenta registrada con ese correo electrónico.");

        var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
        var htmlBody = BuildEmailTemplate(
            title: "Recuperación de Contraseña en SkillHub",
            greeting: $"Hola, {WebUtility.HtmlEncode(user.FullName)}:",
            message: "Recibimos una solicitud para restablecer la contraseña de tu cuenta en SkillHub. Utiliza el siguiente token de seguridad para definir tu nueva contraseña:",
            token: resetToken,
            footerNote: "Este token es de un solo uso. Si no solicitaste recuperar tu contraseña, tu cuenta sigue segura.");

        var sentViaSmtp = await _emailService.SendEmailAsync(
            user.Email ?? request.Email,
            "SkillHub — Recuperación de Contraseña",
            htmlBody);

        return new AuthTokenDispatchResponseDto
        {
            Email = user.Email ?? request.Email,
            SentViaSmtp = sentViaSmtp,
            DevToken = resetToken,
            Message = sentViaSmtp
                ? $"Se ha enviado un correo a {user.Email} con el token de recuperación."
                : $"Token de recuperación generado para {user.Email}."
        };
    }

    public async Task ResetPasswordAsync(ResetPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (user == null)
            throw new BusinessRuleValidationException("No encontramos ninguna cuenta asociada a ese correo electrónico.");

        var result = await _userManager.ResetPasswordAsync(user, request.Token.Trim(), request.NewPassword);
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleValidationException($"El token es inválido o ha expirado: {errors}");
        }
    }

    public async Task<AuthTokenDispatchResponseDto> ResendEmailConfirmationAsync(ForgotPasswordRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (user == null)
            throw new BusinessRuleValidationException("No encontramos ninguna cuenta asociada a ese correo electrónico.");

        if (user.EmailConfirmed)
            throw new BusinessRuleValidationException("Este correo electrónico ya se encuentra verificado.");

        var confirmToken = await _userManager.GenerateEmailConfirmationTokenAsync(user);
        var htmlBody = BuildEmailTemplate(
            title: "Confirmación de Correo Electrónico en SkillHub",
            greeting: $"Hola, {WebUtility.HtmlEncode(user.FullName)}:",
            message: "Has solicitado un nuevo código para verificar tu correo electrónico en SkillHub. Copia el siguiente token de confirmación:",
            token: confirmToken,
            footerNote: "Ingresa este token en la ventana de verificación de SkillHub.");

        var sentViaSmtp = await _emailService.SendEmailAsync(
            user.Email ?? request.Email,
            "SkillHub — Nuevo Código de Confirmación de Correo",
            htmlBody);

        return new AuthTokenDispatchResponseDto
        {
            Email = user.Email ?? request.Email,
            SentViaSmtp = sentViaSmtp,
            DevToken = confirmToken,
            Message = sentViaSmtp
                ? $"Hemos enviado un correo de verificación a {user.Email}."
                : $"Código de verificación generado para {user.Email}."
        };
    }

    public async Task ConfirmEmailAsync(ConfirmEmailRequestDto request)
    {
        var user = await _userManager.FindByEmailAsync(request.Email.Trim());
        if (user == null)
            throw new BusinessRuleValidationException("No encontramos ninguna cuenta asociada a ese correo electrónico.");

        var result = await _userManager.ConfirmEmailAsync(user, request.Token.Trim());
        if (!result.Succeeded)
        {
            var errors = string.Join("; ", result.Errors.Select(e => e.Description));
            throw new BusinessRuleValidationException($"Código de confirmación inválido o expirado: {errors}");
        }
    }

    private Task<AuthResponseDto> GenerateAuthResponseAsync(ApplicationUser user, string role, bool rememberMe)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["Key"] ?? "SkillHub_Super_Secret_Security_Key_2026_DotNet_Platform_Key!";
        var issuer = jwtSettings["Issuer"] ?? "SkillHubApi";
        var audience = jwtSettings["Audience"] ?? "SkillHubClients";

        // If RememberMe is true -> 7 days (10080 mins); if false -> 2 hours (120 mins)
        var expirationMinutes = rememberMe ? 10080 : 120;

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddMinutes(expirationMinutes);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = creds
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);

        return Task.FromResult(new AuthResponseDto
        {
            Token = tokenHandler.WriteToken(token),
            Email = user.Email ?? string.Empty,
            FullName = user.FullName,
            Role = role,
            ExpiresAt = expiresAt,
            EmailConfirmed = user.EmailConfirmed
        });
    }

    private static string BuildEmailTemplate(
        string title,
        string greeting,
        string message,
        string token,
        string footerNote)
    {
        return $@"
<!DOCTYPE html>
<html lang=""es"">
<head><meta charset=""utf-8""></head>
<body style=""margin:0;padding:24px;background-color:#f8fafc;font-family:'Inter',Segoe UI,Arial,sans-serif;color:#0f172a;"">
  <div style=""max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;box-shadow:0 4px 12px rgba(15,23,42,0.05);"">
    <div style=""background:linear-gradient(135deg,#1e1b4b,#312e81);padding:24px 32px;color:#ffffff;"">
      <div style=""font-size:20px;font-weight:800;letter-spacing:-0.02em;"">SkillHub</div>
      <div style=""font-size:12px;color:#c7d2fe;margin-top:4px;"">Plataforma de Gestión de Talleres e Inscripciones</div>
    </div>
    <div style=""padding:32px;"">
      <h2 style=""margin:0 0 12px 0;font-size:18px;color:#1e293b;"">{title}</h2>
      <p style=""margin:0 0 12px 0;font-size:14px;font-weight:600;color:#334155;"">{greeting}</p>
      <p style=""margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#475569;"">{message}</p>
      <div style=""background:#eef2ff;border:1px dashed #6366f1;border-radius:12px;padding:16px;margin:20px 0;word-break:break-all;font-family:monospace;font-size:13px;font-weight:700;color:#312e81;text-align:center;"">
        {WebUtility.HtmlEncode(token)}
      </div>
      <p style=""margin:20px 0 0 0;font-size:12px;color:#64748b;line-height:1.5;"">{footerNote}</p>
    </div>
  </div>
</body>
</html>";
    }
}
