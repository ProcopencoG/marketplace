using System.Net;
using System.Text.Json;
using PiataOnline.Core.DTOs;

namespace PiataOnline.API.Middleware;

public class ExceptionMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionMiddleware> _logger;
    private readonly IHostEnvironment _env;

    public ExceptionMiddleware(RequestDelegate next, ILogger<ExceptionMiddleware> logger, IHostEnvironment env)
    {
        _next = next;
        _logger = logger;
        _env = env;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unhandled exception occurred.");
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception ex)
    {
        context.Response.ContentType = "application/json";
        
        string message = "Internal Server Error";
        int statusCode = (int)HttpStatusCode.InternalServerError;

        switch (ex)
        {
            case KeyNotFoundException:
                statusCode = (int)HttpStatusCode.NotFound;
                message = ex.Message;
                break;
            case UnauthorizedAccessException:
                statusCode = (int)HttpStatusCode.Unauthorized;
                message = "Unauthorized";
                break;
            case ArgumentException:
            case InvalidOperationException: 
                statusCode = (int)HttpStatusCode.BadRequest;
                message = ex.Message;
                break;
            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                message = _env.IsDevelopment() ? ex.Message : "An unexpected error occurred.";
                break;
        }

        context.Response.StatusCode = statusCode;

        var response = new ErrorResponse
        {
            Message = message
        };

        // In development, include stack trace in a separate property or extended response if needed.
        // For now, keeping it simple with the ErrorResponse DTO which likely just has Message.
        // If we want details, we might need to extend ErrorResponse or use an anonymous object.
        
        var jsonOptions = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
        
        // If dev, we can append details
        object finalResponse = response;
        if (_env.IsDevelopment() && context.Response.StatusCode == 500) 
        {
             finalResponse = new { 
                response.Message, 
                Details = ex.StackTrace 
             };
        }

        var json = JsonSerializer.Serialize(finalResponse, jsonOptions);
        await context.Response.WriteAsync(json);
    }
}
