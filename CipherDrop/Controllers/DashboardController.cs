using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.ActivityUtils;
using CipherDrop.Utils.PasswordUtils;

namespace CipherDrop.Controllers;

public class DashboardController(ILogger<DashboardController> logger,CipherDropContext context) : Controller
{
    private readonly ILogger<DashboardController> _logger = logger;
    
    public IActionResult Index()
    {
    return View(context.UserActivity.OrderByDescending(a => a.CreatedAt)
                    .Join(context.User, a => a.UserId, u => u.Id, (a, u) => new { a, u })
                    .Select(au => new UserActivityViewModel{ Area = au.a.Area, Action = au.a.Action, Type = au.a.Type,
                                CreatedAt = au.a.CreatedAt, UserName = au.u.Name })  
                    .Take(30)
                    .OrderByDescending(a => a.CreatedAt)                   
                    .ToList());
    }

    public IActionResult Send()
    {
        return View(new SendCipher());
    }


    [HttpPost]
    [ValidateAntiForgeryToken]
   public async Task<IActionResult> Send(SendCipher model)
    {
        if (!ModelState.IsValid)
        {
            return View(model);
        }

        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var cipher = new Cipher
            {
                Id = Guid.NewGuid().ToString() + Guid.NewGuid().ToString(),
                Value = model.Value,
                Type = model.Type,
                Reference = model.Reference,
                ExpiresAt = model.Expiry != "After reading" ? ReturnExpiry(model.Expiry) : null,
                SelfDestruct = model.Expiry == "After reading",
                UserId = (HttpContext.Items["Session"] as Session).UserId
            };

            if (model.Password != null)
            {
                PasswordUtils.CreatePasswordHash(model.Password, out byte[] passwordHash, out byte[] passwordSalt);
                cipher.Password = passwordHash;
                cipher.PasswordSalt = passwordSalt;
            }

            context.Cipher.Add(cipher);
            await context.SaveChangesAsync();

            if (model.SaveVault)
            {
                // Save the cipher to the vault
            }

            if (model.RecordActivity)
            {
                await ActivityUtils.AddActivityAsync("Cipher", cipher.Id, "Create", model.Type, HttpContext.Items["Session"] as Session , context);
            }

            TempData["CipherUrl"] = GetLink(cipher.Id, model.Type);
            TempData["CipherId"] = cipher.Id;

            await transaction.CommitAsync();

            return View(model);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            // Log the exception for troubleshooting
            Console.WriteLine($"An error occurred while saving: {ex.Message}");
            // Throw a meaningful error message to the user
            ModelState.AddModelError("", "An error occurred while saving. Please try again.");
            return View(model);
        }
    }

    private static DateTime ReturnExpiry(string expiry)
    {

        DateTime expiryTime = DateTime.Now;
        switch (expiry)
        {
            case "1 hour":
                expiryTime = DateTime.Now.AddHours(1);
                break;
            case "1 day":
                expiryTime = DateTime.Now.AddDays(1);
                break;
            case "1 week":
                expiryTime = DateTime.Now.AddDays(7);
                break;
            case "1 month":
                expiryTime = DateTime.Now.AddMonths(1);
                break;
            case "3 months":
                expiryTime = DateTime.Now.AddMonths(3);
                break;
            case "1 year":
                expiryTime = DateTime.Now.AddYears(1);
                break;
            case "Never":
                expiryTime = DateTime.MaxValue;
                break;
        }

        return expiryTime;
    }
    
    private string GetLink(string cipherId, string cipherType)
    {
        if(cipherType == "public")
            return $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}/link/public/{cipherId}";
        else if(cipherType == "private")
            return $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}/link/private/{cipherId}";
        else if(cipherType == "internal")
            return $"{HttpContext.Request.Scheme}://{HttpContext.Request.Host}/cipher/view/{cipherId}";
        else
            return "";
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

