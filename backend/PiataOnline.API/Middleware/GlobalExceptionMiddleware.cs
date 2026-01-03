using System.Net;
using System.Text.Json;
using FluentValidation;
using PiataOnline.Core.DTOs;

namespace PiataOnline.API.Middleware;

/// <summary>
/// Global exception handling middleware - catches all unhandled exceptions
/// and returns standardized JSON error responses
/// </summary>
public class GlobalExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public GlobalExceptionMiddleware(
        RequestDelegate next, 
        ILogger<GlobalExceptionMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (ValidationException ex)
        {
            await HandleValidationExceptionAsync(context, ex);
        }
        catch (UnauthorizedAccessException ex)
        {
            await HandleUnauthorizedExceptionAsync(context, ex);
        }
        catch (KeyNotFoundException ex)
        {
            await HandleNotFoundExceptionAsync(context, ex);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleValidationExceptionAsync(HttpContext context, ValidationException exception)
    {
        _logger.LogWarning(exception, "Validation error occurred");

        var errors = exception.Errors
            .GroupBy(e => e.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(e => e.ErrorMessage).ToArray()
            );

        context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Message = "Validation failed",
            Code = "VALIDATION_ERROR",
            Errors = errors
        };

        await context.Response.WriteAsJsonAsync(response);
    }

    private async Task HandleUnauthorizedExceptionAsync(HttpContext context, UnauthorizedAccessException exception)
    {
        _logger.LogWarning(exception, "Unauthorized access attempt");

        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Message = "Unauthorized access",
            Code = "UNAUTHORIZED"
        };

        await context.Response.WriteAsJsonAsync(response);
    }

    private async Task HandleNotFoundExceptionAsync(HttpContext context, KeyNotFoundException exception)
    {
        _logger.LogWarning(exception, "Resource not found");

        context.Response.StatusCode = (int)HttpStatusCode.NotFound;
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Message = exception.Message ?? "Resource not found",
            Code = "NOT_FOUND"
        };

        await context.Response.WriteAsJsonAsync(response);
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred");

        context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
        context.Response.ContentType = "application/json";

        var response = new ErrorResponse
        {
            Message = _environment.IsDevelopment() 
                ? exception.Message 
                : "An unexpected error occurred",
            Code = "INTERNAL_ERROR"
        };

        // Include stack trace in development
        if (_environment.IsDevelopment())
        {
            response = response with 
            { 
                Errors = new Dictionary<string, string[]> 
                { 
                    { "stackTrace", new[] { exception.StackTrace ?? "" } }
                }
            };
        }

        await context.Response.WriteAsJsonAsync(response);
    }
}

public static class GlobalExceptionMiddlewareExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        return app.UseMiddleware<GlobalExceptionMiddleware>();
    }
}
