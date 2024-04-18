
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.PasswordUtils;
using CipherDrop.Utils;
using CipherDrop.Utils.SessionUtils;

namespace CipherDrop.Controllers

{
    public class RegisterController(CipherDropContext context,AdminSettingsService adminSettingsService) : Controller
    {
        public IActionResult Index()
        {
            return View(new UserRegister());
        }

        [HttpPost]
        [ValidateAntiForgeryToken] 
        public async Task<IActionResult> Index(UserRegister model)
        {
            if (ModelState.IsValid)
            {
                try
                {
                    if (context.User.Any(u => u.Email == model.Email))
                    {
                        ModelState.AddModelError("Email", "Email already exists");
                        return View(model);
                    }

                    PasswordUtils.CreatePasswordHash(model.Password, out byte[] passwordHash, out byte[] passwordSalt);
                    var user = new User
                    {
                        Name = model.Name,
                        Email = model.Email,
                        Password = passwordHash,
                        PasswordSalt = passwordSalt,
                    };
                    //Check if first time setup has been completed. If not, set the user as an admin,login user and redirect to setup page
                    var adminSettings = await adminSettingsService.GetAdminSettings(context);
                    
                    if(adminSettings == null)
                    {
                        user.Role = "Admin";
                        await SaveUser(context, user);
                        await SessionUtils.CreateSessionAsync(user, context, Response);

                        TempData["Email"] = model.Email;
                        TempData["Name"] = user.Name;
                        TempData["Role"] = user.Role;

                        return RedirectToAction("Setup", "Admin");
                    } 
                    else
                    {                
                        user.Role = "User";
                        await SaveUser(context, user);
                        return RedirectToAction("Index", "Login");
                    }
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("Error", ex.Message);
                }
            }

            return View(model);

            static async Task SaveUser(CipherDropContext context, User user)
            {
                context.User.Add(user);
                await context.SaveChangesAsync();
            }
        }
    }
}
