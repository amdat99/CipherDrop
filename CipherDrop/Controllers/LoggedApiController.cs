using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Services;
using CipherDrop.Data;

namespace CipherDrop.Controllers
{
public class LoggedApiController(CipherDropContext context) : Controller
    {
        [HttpGet]
        public IActionResult AdminSettings()
        {
            try
            {
                return Json(HttpContext.Items["AdminSettings"]);
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return StatusCode(500, new { success = false, message = "Error getting admin settings" });
            }
        }

        [HttpGet]
        public IActionResult UsersQuery()
        {
            try
            {
                string query = Request.Query["query"].FirstOrDefault() ?? "";
                var users = UsersService.GetQueriedUsers(context, query);
                if (users == null) 
                    return StatusCode(404, new { success = false, message = "Users not found" });
                return Json(new { success = true, data = users });
            }
            catch (Exception e)
            {
                Console.WriteLine(e.Message);
                return StatusCode(500, new { success = false, message = "Error getting users" });
            }
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
