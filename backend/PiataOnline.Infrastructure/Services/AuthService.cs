using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;
using PiataOnline.Infrastructure.Data;

namespace PiataOnline.Infrastructure.Services;

/// <summary>
/// JWT authentication service implementation
/// </summary>
public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        ApplicationDbContext context, 
        IConfiguration configuration, 
        IHttpClientFactory httpClientFactory,
        ILogger<AuthService> logger)
    {
        _context = context;
        _configuration = configuration;
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
    }

    public async Task<User?> ValidateOAuthTokenAsync(string provider, string idToken)
    {
        // Validate OAuth token with provider (Google/Facebook)
        // For Google: https://oauth2.googleapis.com/tokeninfo?id_token={token} (for ID Token)
        // For Google: https://www.googleapis.com/oauth2/v3/userinfo?access_token={token} (for Access Token)
        // For Facebook: https://graph.facebook.com/me?access_token={token}

        try
        {
            if (provider.ToLower() == "google")
            {
                // Validate Access Token via UserInfo endpoint
                var response = await _httpClient.GetAsync($"https://www.googleapis.com/oauth2/v3/userinfo?access_token={idToken}");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    var userInfo = System.Text.Json.JsonSerializer.Deserialize<GoogleUserInfo>(content);
                    
                    if (userInfo != null)
                    {
                         // Read owner email from config (not hardcoded)
                         var ownerEmail = _configuration.GetValue<string>("JwtSettings:OwnerEmail") ?? "";
                         
                         var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == userInfo.email);
                         if (existingUser != null) 
                         {
                             // Auto-promote owner if configured
                             if (!string.IsNullOrEmpty(ownerEmail) && 
                                 userInfo.email.Equals(ownerEmail, StringComparison.OrdinalIgnoreCase) && 
                                 !existingUser.IsAdmin)
                             {
                                 existingUser.IsAdmin = true;
                                 await _context.SaveChangesAsync();
                             }
                             return existingUser;
                         }

                         var isAdmin = !string.IsNullOrEmpty(ownerEmail) && 
                             userInfo.email.Equals(ownerEmail, StringComparison.OrdinalIgnoreCase);

                         var newUser = new User
                         {
                             Name = userInfo.name,
                             Email = userInfo.email,
                             Provider = "google",
                             Uid = userInfo.sub, // Google ID
                             AvatarUrl = userInfo.picture,
                             IsAdmin = isAdmin,
                             CreatedAt = DateTime.UtcNow,
                             UpdatedAt = DateTime.UtcNow
                         };

                         await _context.Users.AddAsync(newUser);
                         await _context.SaveChangesAsync();
                         return newUser;
                    }
                }
            }
            else if (provider.ToLower() == "facebook")
            {
                var response = await _httpClient.GetAsync($"https://graph.facebook.com/me?fields=id,name,email,picture&access_token={idToken}");
                if (response.IsSuccessStatusCode)
                {
                    // Parse Facebook response
                }
            }
        }
        catch (Exception ex)
        {
            // SECURITY: Log auth failures for monitoring (but don't expose details to client)
            _logger.LogWarning(ex, "OAuth token validation failed for provider {Provider}", provider);
        }

        return null;
    }

    public string GenerateAccessToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var secret = Environment.GetEnvironmentVariable("JWT_SECRET") 
            ?? jwtSettings["Secret"] 
            ?? throw new InvalidOperationException("JWT secret is not configured");
        var issuer = jwtSettings["Issuer"] ?? "PiataOnline.API";
        var audience = jwtSettings["Audience"] ?? "PiataOnline.Client";
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.Name),
            new Claim("provider", user.Provider),
            new Claim(ClaimTypes.Role, user.IsAdmin ? "Admin" : "User")
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public async Task<int?> ValidateRefreshTokenAsync(string refreshToken)
    {
        // In production, store refresh tokens in database with expiration
        // For now, we'll use a simple in-memory check (not production-ready)
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken && 
                                      u.RefreshTokenExpiry > DateTime.UtcNow);
        return user?.Id;
    }

    public async Task SaveRefreshTokenAsync(int userId, string refreshToken, DateTime expiresAt)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user != null)
        {
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = expiresAt;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    public async Task RevokeRefreshTokenAsync(string refreshToken)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            user.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }
    }

    private class GoogleUserInfo
    {
        public string sub { get; set; }
        public string name { get; set; }
        public string given_name { get; set; }
        public string family_name { get; set; }
        public string picture { get; set; }
        public string email { get; set; }
        public bool email_verified { get; set; }
    }
}
