using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils;
using CipherDrop.Services;

namespace CipherDrop.Controllers;

public class LinkController(CipherDropContext context) : Controller
{
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
        
        // Delete the cipher if it is set to self-destruct
        CipherService.DeleteCipherIfSelfDestruct(context, cipher);

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
            TempData["Error"] = "Invalid Password";
            return View( new Cipher());
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
                TempData["Error"] = "Invalid Password";
                return View(new Cipher());
            }
        
        CipherService.DeleteCipherIfSelfDestruct(context, cipher);

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
