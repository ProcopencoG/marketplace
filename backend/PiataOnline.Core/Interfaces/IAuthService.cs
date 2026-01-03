using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;

namespace PiataOnline.Core.Interfaces;

/// <summary>
/// Service for JWT token generation and validation
/// </summary>
public interface IAuthService
{
    /// <summary>
    /// Validates OAuth2 token from provider (Google/Facebook) and returns user info
    /// </summary>
    Task<User?> ValidateOAuthTokenAsync(string provider, string idToken);
    
    /// <summary>
    /// Generates JWT access token for authenticated user
    /// </summary>
    string GenerateAccessToken(User user);
    
    /// <summary>
    /// Generates refresh token for authenticated user
    /// </summary>
    string GenerateRefreshToken();
    
    /// <summary>
    /// Validates refresh token and returns user ID if valid
    /// </summary>
    Task<int?> ValidateRefreshTokenAsync(string refreshToken);
    
    /// <summary>
    /// Saves refresh token for user
    /// </summary>
    Task SaveRefreshTokenAsync(int userId, string refreshToken, DateTime expiresAt);
    
    /// <summary>
    /// Revokes refresh token
    /// </summary>
    Task RevokeRefreshTokenAsync(string refreshToken);
}
