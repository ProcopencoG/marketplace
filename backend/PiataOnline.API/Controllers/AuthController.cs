using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PiataOnline.Core.DTOs;
using PiataOnline.Core.Entities;
using PiataOnline.Core.Interfaces;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IAuthService authService, IUnitOfWork unitOfWork, ILogger<AuthController> logger)
    {
        _authService = authService;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    /// <summary>
    /// Authenticate user via OAuth2 provider (Google/Facebook)
    /// </summary>
    /// <remarks>
    /// The client should first authenticate with Google/Facebook and then send the ID token here.
    /// The backend validates the token and returns a JWT for subsequent API calls.
    /// </remarks>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting("AuthPolicy")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest request)
    {
        try
        {
            // Validate OAuth token with provider
            var user = await _authService.ValidateOAuthTokenAsync(request.Provider, request.IdToken);
            
            if (user == null)
            {
                return Unauthorized(new ErrorResponse { Message = "Invalid or expired token" });
            }

            // Generate JWT tokens
            var accessToken = _authService.GenerateAccessToken(user);
            var refreshToken = _authService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddMinutes(60); // 1 hour access token
            var refreshExpiresAt = DateTime.UtcNow.AddDays(7); // 7 days refresh token

            // Save refresh token
            await _authService.SaveRefreshTokenAsync(user.Id, refreshToken, refreshExpiresAt);

            _logger.LogInformation("User {UserId} logged in successfully", user.Id);

            var stall = await _unitOfWork.Stalls.GetByUserIdAsync(user.Id);
            
            return Ok(new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Location = user.Location,
                    IsAdmin = user.IsAdmin,
                    HasStall = stall != null,
                    StallId = stall?.Id,
                    AvatarUrl = user.AvatarUrl
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during login");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred during login" });
        }
    }

    /// <summary>
    /// Refresh access token using refresh token
    /// </summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        try
        {
            var userId = await _authService.ValidateRefreshTokenAsync(request.RefreshToken);
            if (userId == null)
            {
                return Unauthorized(new ErrorResponse { Message = "Invalid or expired refresh token" });
            }

            var user = await _unitOfWork.Users.GetByIdAsync(userId.Value);
            if (user == null)
            {
                return Unauthorized(new ErrorResponse { Message = "User not found" });
            }

            // Generate new tokens
            var accessToken = _authService.GenerateAccessToken(user);
            var refreshToken = _authService.GenerateRefreshToken();
            var expiresAt = DateTime.UtcNow.AddMinutes(60); // 1 hour access token
            var refreshExpiresAt = DateTime.UtcNow.AddDays(7); // 7 days refresh token

            // Revoke old refresh token and save new one
            await _authService.RevokeRefreshTokenAsync(request.RefreshToken);
            await _authService.SaveRefreshTokenAsync(user.Id, refreshToken, refreshExpiresAt);

            var stall = await _unitOfWork.Stalls.GetByUserIdAsync(user.Id);
            
            return Ok(new LoginResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                ExpiresAt = expiresAt,
                User = new UserDto
                {
                    Id = user.Id,
                    Name = user.Name,
                    Email = user.Email,
                    Location = user.Location,
                    IsAdmin = user.IsAdmin,
                    HasStall = stall != null,
                    StallId = stall?.Id,
                    AvatarUrl = user.AvatarUrl
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during token refresh");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred during token refresh" });
        }
    }

    /// <summary>
    /// Logout user (revoke refresh token)
    /// </summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] RefreshTokenRequest request)
    {
        try
        {
            await _authService.RevokeRefreshTokenAsync(request.RefreshToken);
            _logger.LogInformation("User logged out successfully");
            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during logout");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred during logout" });
        }
    }

    /// <summary>
    /// Get current user profile
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        try
        {
            var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out var userId))
            {
                _logger.LogWarning("Invalid Token: No userId claim");
                return Unauthorized(new ErrorResponse { Message = "Invalid token" });
            }

            _logger.LogInformation("Getting current user info for ID: {UserId}", userId);
            
            var user = await _unitOfWork.Users.GetByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User ID {UserId} found in token but NOT in database", userId);
                return NotFound(new ErrorResponse { Message = "User not found" });
            }

            var stall = await _unitOfWork.Stalls.GetByUserIdAsync(user.Id);
            return Ok(new UserDto
            {
                Id = user.Id,
                Name = user.Name,
                Email = user.Email,
                Location = user.Location,
                IsAdmin = user.IsAdmin,
                HasStall = stall != null,
                StallId = stall?.Id,
                AvatarUrl = user.AvatarUrl
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user");
            return StatusCode(500, new ErrorResponse { Message = "An error occurred" });
        }
    }
}
