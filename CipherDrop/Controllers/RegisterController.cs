
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils;
using CipherDrop.Services;

namespace CipherDrop.Controllers;

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
            if (!ModelState.IsValid)
            {
                return View(model);
            }
            
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
                var adminSettings = await adminSettingsService.GetAdminSettingsAsync(context);
                if(adminSettings == null)
                {
                    user.Role = "Admin";
                    await SaveUser(context, user);
                    await SessionService.CreateSessionAsync(user, context, Response);

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
                //Check if the error is due to the email already existing
                if (ex.Message.Contains("Email already exists"))
                {
                    ModelState.AddModelError("Email", "Email already exists");
                }
                ModelState.AddModelError("Error", "An error occurred while processing your request");
            }
            return View(model);
        }

        static async Task SaveUser(CipherDropContext context, User user)
        {
            context.User.Add(user);
            await context.SaveChangesAsync();
        }
    }

