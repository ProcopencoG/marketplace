using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace PiataOnline.API.Controllers;

[ApiController]
[Route("api/admin/[controller]")]
[Authorize(Roles = "Admin")]
public class LogsController : ControllerBase
{
    private readonly IWebHostEnvironment _environment;

    public LogsController(IWebHostEnvironment environment)
    {
        _environment = environment;
    }

    [HttpGet]
    public IActionResult GetLogs([FromQuery] int lines = 100)
    {
        // Try to find the latest log file
        // Serilog typically writes to "logs/log-YYYYMMDD.txt" or similar
        var logDirectory = Path.Combine(Directory.GetCurrentDirectory(), "logs");
        
        if (!Directory.Exists(logDirectory))
        {
            return Ok(new List<string> { "Log directory not found." });
        }

        var logFiles = Directory.GetFiles(logDirectory, "log-*.txt")
                                .OrderByDescending(f => f)
                                .ToList();

        if (!logFiles.Any())
        {
             return Ok(new List<string> { "No active log files found." });
        }

        var latestLog = logFiles.First();
        var logLines = new List<string>();

        try 
        {
            // Read file with shared access to allow reading while being written to
            using (var fileStream = new FileStream(latestLog, FileMode.Open, FileAccess.Read, FileShare.ReadWrite))
            using (var reader = new StreamReader(fileStream))
            {
                string? line;
                var allLines = new List<string>();
                while ((line = reader.ReadLine()) != null)
                {
                    allLines.Add(line);
                }

                logLines = allLines.TakeLast(lines).Reverse().ToList();
            }
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Error reading logs: {ex.Message}" });
        }

        return Ok(logLines);
    }
}
