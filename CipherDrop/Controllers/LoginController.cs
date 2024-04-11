using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.PasswordUtils;

namespace CipherDrop.Controllers;

public class LoginController(ILogger<LoginController> logger,CipherDropContext context) : Controller
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
                ModelState.AddModelError("Token", "Invalid credentials"); 
                return View(model);
            }

            if (!PasswordUtils.VerifyPasswordHash(model.Password, user.Password, user.PasswordSalt))
            {
                ModelState.AddModelError("Token" , "Invalid Credentials");
                return View(model);
            }

            // Create a session and add cookie
            string sessionId = Guid.NewGuid().ToString() + Guid.NewGuid().ToString();
            var Session = new Session
            {
                Id = sessionId,
                UserId = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                ExpiresAt = DateTime.Now.AddHours(24)
            };
        
            context.Session.Add(Session);
            await context.SaveChangesAsync();

            Response.Cookies.Append("session", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.Now.AddHours(24)
            });


            TempData["Token"] = model.Token;
            TempData["Email"] = model.Email;
            TempData["Name"] = user.Name;
            TempData["Role"] = user.Role;
            return RedirectToAction("Index", "Dashboard");
        }

        return View(model);
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
