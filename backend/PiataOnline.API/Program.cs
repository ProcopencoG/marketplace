using System.Text;
using System.Threading.RateLimiting;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PiataOnline.API.Middleware;
using PiataOnline.Core.Interfaces;
using PiataOnline.Core.Validators;
using PiataOnline.Infrastructure.Data;
using PiataOnline.Infrastructure.Mapping;
using PiataOnline.Infrastructure.Repositories;
using PiataOnline.Infrastructure.Services;
using Serilog;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/log-.txt", rollingInterval: RollingInterval.Day) // Added File Sink
    .CreateLogger();

builder.Host.UseSerilog();

// Configure Mapster
MappingConfig.Configure();

// Add services to the container
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// FluentValidation
builder.Services.AddValidatorsFromAssemblyContaining<CreateStallValidator>();
builder.Services.AddFluentValidationAutoValidation();

// OpenAPI / Scalar
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Info.Title = "Piața Digitală API";
        document.Info.Version = "v1";
        document.Info.Description = "Backend API pentru platforma Piața Digitală - marketplace pentru producători locali";
        document.Info.Contact = new()
        {
            Name = "Piața Digitală Support",
            Email = "support@piataonline.bio"
        };
        return Task.CompletedTask;
    });
});

// Configure PostgreSQL with EF Core
var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL") 
    ?? builder.Configuration.GetConnectionString("DefaultConnection");
    
if (string.IsNullOrEmpty(connectionString))
    throw new InvalidOperationException("Database connection string is not configured. Set DATABASE_URL environment variable.");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// HttpClient for OAuth validation
builder.Services.AddHttpClient();

// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secret = Environment.GetEnvironmentVariable("JWT_SECRET") 
    ?? jwtSettings["Secret"];
    
if (string.IsNullOrEmpty(secret) || secret.Length < 32)
    throw new InvalidOperationException("JWT_SECRET environment variable is not configured or is too short (minimum 32 characters).");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"] ?? "PiataOnline.API",
        ValidAudience = jwtSettings["Audience"] ?? "PiataOnline.Client",
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Register Unit of Work and repositories
builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
builder.Services.AddScoped(typeof(IRepository<>), typeof(GenericRepository<>));
builder.Services.AddScoped<IStallRepository, StallRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
builder.Services.AddScoped<IMessageRepository, MessageRepository>();
builder.Services.AddScoped<ICartRepository, CartRepository>();
builder.Services.AddScoped<ICartItemRepository, CartItemRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// Register Auth Service
builder.Services.AddScoped<IAuthService, AuthService>();

// Rate Limiting
builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: partition => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = builder.Environment.IsDevelopment() ? 1000 : 100,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
    
    // SECURITY: Stricter rate limiting for auth endpoints
    options.AddPolicy("AuthPolicy", context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                AutoReplenishment = true,
                PermitLimit = builder.Environment.IsDevelopment() ? 100 : 10,
                QueueLimit = 0,
                Window = TimeSpan.FromMinutes(1)
            }));
    
    options.OnRejected = async (context, token) =>
    {
        context.HttpContext.Response.StatusCode = 429;
        await context.HttpContext.Response.WriteAsJsonAsync(new 
        { 
            Message = "Too many requests. Please try again later.",
            Code = "RATE_LIMIT_EXCEEDED"
        }, token);
    };
});

// Health Checks
builder.Services.AddHealthChecks()
    .AddNpgSql(connectionString);

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000", 
                "http://localhost:3036", 
                "http://localhost:5173",
                "https://piataonline.bio",
                "http://piataonline.bio")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Global Exception Handler (must be first in pipeline)
// Custom Exception Middleware (must be first)
app.UseMiddleware<ExceptionMiddleware>();
// app.UseGlobalExceptionHandler(); // Removed in favor of custom middleware

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference(); // Scalar API docs only in Development
}

// SECURITY: Add Serilog request logging for audit trail
app.UseSerilogRequestLogging();

app.UseHttpsRedirection();

// SECURITY: Add security headers
app.Use(async (context, next) =>
{
    context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
    context.Response.Headers.Append("X-Frame-Options", "DENY");
    context.Response.Headers.Append("X-XSS-Protection", "1; mode=block");
    context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
    context.Response.Headers.Append("Cross-Origin-Opener-Policy", "unsafe-none");
    context.Response.Headers.Append("Cross-Origin-Embedder-Policy", "unsafe-none");
    await next();
});
app.UseCors("AllowFrontend");
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

// Health Checks endpoint
app.MapHealthChecks("/health");

app.UseStaticFiles(); // Serve React static files

app.MapControllers();

// Fallback for SPA routing
app.MapFallbackToFile("index.html");

// Apply migrations automatically on startup (development only)
if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    await dbContext.Database.MigrateAsync();
}

app.Run();
