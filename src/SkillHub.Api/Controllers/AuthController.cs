using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Application.DTOs;
using SkillHub.Application.Interfaces;

namespace SkillHub.Api.Controllers;

/// <summary>
/// REST Controller handling user registration, JWT authentication, profile management,
/// password recovery, and email address confirmation.
/// </summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Registers a new participant account and dispatches an email verification token.
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterRequestDto request)
    {
        var response = await _authService.RegisterParticipantAsync(request);
        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Authenticates user credentials and issues a JWT token (2h default or 7d with RememberMe).
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginRequestDto request)
    {
        var response = await _authService.LoginAsync(request);
        return Ok(response);
    }

    /// <summary>
    /// Generates and dispatches a password reset token to the user's registered email address.
    /// </summary>
    [HttpPost("forgot-password")]
    public async Task<ActionResult<AuthTokenDispatchResponseDto>> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        var response = await _authService.ForgotPasswordAsync(request);
        return Ok(response);
    }

    /// <summary>
    /// Resets the user's password using a valid cryptographic reset token.
    /// </summary>
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        await _authService.ResetPasswordAsync(request);
        return Ok(new { message = "Contraseña restablecida exitosamente." });
    }

    /// <summary>
    /// Resends the email confirmation token to an unverified user account.
    /// </summary>
    [HttpPost("resend-confirmation")]
    public async Task<ActionResult<AuthTokenDispatchResponseDto>> ResendConfirmation([FromBody] ForgotPasswordRequestDto request)
    {
        var response = await _authService.ResendEmailConfirmationAsync(request);
        return Ok(response);
    }

    /// <summary>
    /// Confirms a user's email address using the verification token issued by Identity.
    /// </summary>
    [HttpPost("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailRequestDto request)
    {
        await _authService.ConfirmEmailAsync(request);
        return Ok(new { message = "Correo electrónico confirmado exitosamente." });
    }

    /// <summary>
    /// Retrieves the profile details of the currently authenticated user.
    /// </summary>
    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> GetProfile()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await _authService.GetProfileAsync(userId);
        return Ok(profile);
    }

    /// <summary>
    /// Updates the full name and/or teaching specialty of the authenticated user.
    /// </summary>
    [HttpPut("profile")]
    [Authorize]
    public async Task<ActionResult<UserProfileDto>> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var profile = await _authService.UpdateProfileAsync(userId, request);
        return Ok(profile);
    }

    /// <summary>
    /// Changes the password of the currently authenticated user.
    /// </summary>
    [HttpPut("change-password")]
    [Authorize]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        await _authService.ChangePasswordAsync(userId, request);
        return Ok(new { message = "Password updated successfully." });
    }
}
