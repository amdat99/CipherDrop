
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.PasswordUtils;

namespace CipherDrop.Controllers
{
    public class RegisterController(ILogger<RegisterController> logger, CipherDropContext context) : Controller
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
                        Role = "User"
                    };

                    context.User.Add(user);
                    await context.SaveChangesAsync();

                    return RedirectToAction("Index", "Login");
                }
                catch (Exception ex)
                {
                    ModelState.AddModelError("Error", ex.Message);
                }
            }

            return View(model);
        }
    }
}
