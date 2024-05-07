using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;

namespace CipherDrop.Controllers;

public class LoggedApiController() : Controller
{
    [HttpGet]
    public IActionResult AdminSettings ()
    {
        try
        {
            return Json(new { success = true, data = HttpContext.Items["AdminSettings"] });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting admin settings" });
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
