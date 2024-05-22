using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Services;

namespace CipherDrop.Controllers;

public class DashboardController(CipherDropContext context) : Controller
{    
    public IActionResult Index()
    {
        var session = HttpContext.Items["Session"] as Session;
        if(session.Role == "Admin")
        {
            TempData["ActivityTitle"] = "All Activity";
            return View(ActivityService.GetPaginatedActivity(context, 0));
        }
        TempData["ActivityTitle"] = "Your Activity";
        return View(ActivityService.GetPaginatedUserActivity(context, session.UserId, 0));
    }

    public IActionResult GetActivity(int lastId)
    {
        try
        {
            var session = HttpContext.Items["Session"] as Session;
            if(session.Role == "Admin")
            {
                return Json(new { success = true, data = ActivityService.GetPaginatedActivity(context, lastId) });
            }
            return Json(new { success = true, data = ActivityService.GetPaginatedUserActivity(context, session.UserId, lastId) });
        }
        catch (Exception ex)
        {
            Console.WriteLine(ex.Message);
            return StatusCode(500, new { success = false, message = "Error getting activity" });
        }
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
            string cipherId =  await CipherService.SendCipherTransactionAsync(context, model, HttpContext.Items["Session"] as Session);
            TempData["CipherUrl"] = GetLink(cipherId, model.Type);
            TempData["CipherId"] = cipherId;

            await transaction.CommitAsync();
            
            return View(model);
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            Console.WriteLine(ex.Message);
            ModelState.AddModelError("", "An error occurred while saving. Please try again.");
            return View(model);
        }
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

