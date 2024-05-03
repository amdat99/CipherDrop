using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;

namespace CipherDrop.Controllers;

public class LoggedApiController() : Controller
{
    [HttpGet]
    public IActionResult AdminSettings ()
    {
        return Json(HttpContext.Items["AdminSettings"]);
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
