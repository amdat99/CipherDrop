using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.PasswordUtils;
using CipherDrop.Utils.SessionUtils;
using CipherDrop.Utils;

namespace CipherDrop.Controllers;

public class LoginController(CipherDropContext context, AdminSettingsService adminSettingsService ) : Controller
{
    public IActionResult Index()
    {
        return View(new UserLogin());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> Index(UserLogin model)
    {
        if (ModelState.IsValid)
        {
            var user =  context.User.FirstOrDefault(u => u.Email == model.Email);
            if (user == null)
            {
                return LoginError(model);
            }
            //Get admin settings and redirect to setup page if not set
            var adminSettings = await adminSettingsService.GetAdminSettings(context);
            if (adminSettings == null)
            {
                return RedirectToAction("Setup", "Admin");
            }
            if (!PasswordUtils.VerifyPasswordHash(model.Password, user.Password, user.PasswordSalt))
            {
                return LoginError(model);
            }

           await SessionUtils.CreateSessionAsync(user, context, Response);

            TempData["Email"] = model.Email;
            TempData["Name"] = user.Name;
            TempData["Role"] = user.Role;
            return RedirectToAction("Index", "Dashboard");
        }

        return View(model);

        IActionResult LoginError(UserLogin model)
        {
            ModelState.AddModelError("Password", "Invalid credentials");
            TempData["Refresh"] = "true";
            return View(model);
        }
    }

    public IActionResult Logout()
    {
        Response.Cookies.Delete("session");
        TempData["Refresh"] = "true";
        return RedirectToAction("Index", "Login");
    }


    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
