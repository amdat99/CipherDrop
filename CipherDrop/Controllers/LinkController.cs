using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.PasswordUtils;

namespace CipherDrop.Controllers;

public class LinkController(ILogger<LinkController> logger,CipherDropContext context) : Controller
{
    private readonly ILogger<LinkController> _logger = logger;

public IActionResult Public(string id)
{
    if (string.IsNullOrEmpty(id))
    {
        return RedirectToAction("Index", "Home");
    }

    var cipher = context.Cipher.FirstOrDefault(c => c.Id == id && c.Type == "public");

    if (cipher == null || cipher.ExpiresAt < DateTime.Now)
    {
        return RedirectToAction("ExpiredOrInvalid");
    }
    
    if(cipher.SelfDestruct)
    {
        context.Cipher.Remove(cipher);
        context.SaveChangesAsync();
    }
    // Pass the cipher to the view
    return View(cipher);
}

public IActionResult Private(string id)
{
    if (string.IsNullOrEmpty(id))
    {
        return RedirectToAction("Index", "Home");
    }

    return View(new Cipher());
}
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Private(PrivateLink model, string id)
{   
    if(!ModelState.IsValid)
    {
        return View(model);
    }

    if (string.IsNullOrEmpty(id))
    {
        return RedirectToAction("Index", "Home");
    }

    //Check if the cipher exists and is private
    var cipher = context.Cipher.FirstOrDefault(c => c.Id == id && c.Type == "private");     
    if (cipher == null || cipher.ExpiresAt < DateTime.Now || cipher.Password == null || cipher.PasswordSalt == null)
    {
        return RedirectToAction("ExpiredOrInvalid");
    }
    

    if (!PasswordUtils.VerifyPasswordHash(model.Password, cipher.Password, cipher.PasswordSalt))
        {
            ModelState.AddModelError("Password" , "Invalid Password");
            return View(model);
        }
    
    if(cipher.SelfDestruct)
    {
        context.Cipher.Remove(cipher);
        context.SaveChangesAsync();
    }

    TempData["Password"] = model.Password;
    return View(cipher);
    
}

public IActionResult ExpiredOrInvalid() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
