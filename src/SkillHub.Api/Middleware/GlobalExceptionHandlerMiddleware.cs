using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using SkillHub.Domain.Exceptions;

namespace SkillHub.Api.Middleware;

public class GlobalExceptionHandlerMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlerMiddleware> _logger;

    public GlobalExceptionHandlerMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlerMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred: {Message}", ex.Message);
            await HandleExceptionAsync(context, ex);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/problem+json";

        var (statusCode, title) = exception switch
        {
            NotFoundException => ((int)HttpStatusCode.NotFound, "Resource Not Found"),
            DuplicateEnrollmentException => ((int)HttpStatusCode.Conflict, "Duplicate Enrollment"),
            ScheduleConflictException => ((int)HttpStatusCode.Conflict, "Schedule Conflict"),
            CapacityExceededException => ((int)HttpStatusCode.Conflict, "Capacity Exceeded"),
            CancellationNotAllowedException => ((int)HttpStatusCode.BadRequest, "Cancellation Rule Violation"),
            BusinessRuleValidationException => ((int)HttpStatusCode.BadRequest, "Business Rule Violation"),
            _ => ((int)HttpStatusCode.InternalServerError, "An unexpected error occurred")
        };

        context.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = exception.Message,
            Instance = context.Request.Path
        };

        var responseJson = JsonSerializer.Serialize(problemDetails);
        return context.Response.WriteAsync(responseJson);
    }
}
