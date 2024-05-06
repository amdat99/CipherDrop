using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Services;

namespace CipherDrop.Controllers;

public class AdminController(CipherDropContext context,AdminSettingsService adminSettingsService ) : Controller
{
    public async Task<IActionResult> Setup()
    {
        if (IsAdmin() == false || await IsAdminSettingsSet() == true)
        {
            return RedirectToAction("Index", "Home");
        }
        return View( new SetupOptions());
    }   

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Setup(SetupOptions model)
    {
        if (IsAdmin() == false || await IsAdminSettingsSet() == true)
        {
            return RedirectToAction("Index", "Home");
        }

        if (model.EncyptionTestText != null && model.EncyptionTestText.Length > 0)
        {
            var adminSettings = new AdminSettings
            {
                EncyptionTestText = model.EncyptionTestText,
                KeyEnd  = model.KeyEnd
            };

            await adminSettingsService.SaveAdminSettingsAsync(context, adminSettings);
            return RedirectToAction("Index", "Dashboard");
        }
        return View(model);
    }

    private bool IsAdmin()
        {
        if (HttpContext.Items["Session"] is not Session session || session.Role != "admin")
        {
            return true;
        }
        return false;
    }

    private async Task<bool> IsAdminSettingsSet()
    {
         //Check if admin settings have already been set
        var adminSettings = await adminSettingsService.GetAdminSettingsAsync(context);
        if (adminSettings != null)
        {
            return true;
        }
        return false;
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

