using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;

namespace CipherDrop.Controllers;

public class CipherController(ILogger<LinkController> logger,CipherDropContext context) : Controller
{
    private readonly ILogger<LinkController> _logger = logger;

    public IActionResult Index()
    {
        int userId = (HttpContext.Items["Session"] as Session)?.UserId ?? 0;
        var ciphers = context.Cipher.Where(c => c.UserId == userId).Take(30).ToList();

        return View(ciphers);
    }

    public IActionResult ExpiredOrInvalid() => View();

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
