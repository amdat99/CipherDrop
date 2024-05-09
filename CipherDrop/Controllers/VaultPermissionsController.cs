using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Services;

namespace CipherDrop.Controllers;

public class VaultPermissionsController(CipherDropContext context) : Controller
{
    public async Task<IActionResult> UserPermissions(int id)
    {
        try 
        {
            string lastId = Request.Query["lastId"].FirstOrDefault() ?? "0";
            var permissions = await VaultItemPermissionsService.GetPaginatedItemUserPermissions(context, id, lastId, (HttpContext.Items["Session"] as Session).UserId);
            if(permissions == null)
            {
                return StatusCode(403, new { success = false, message = "Unauthorized" });
            }
            return Json(new { success = true , data = permissions });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting permissions" });
        }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddPermission([FromBody] AddPermission jsonData)
    {
        try 
        {
           int permissionId = await VaultItemPermissionsService.AddPermissionsAsync(context, jsonData.VaultItemId, jsonData.UserId, jsonData.Role, HttpContext.Items["Session"] as Session);
           return Json(new { success = true , id = permissionId });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = e.Message == "User exixts" ? "User already has permissions" : "Error adding permissions" });
        }
    }

    [HttpPut]
    [ValidateAntiForgeryToken]
    public  async Task<IActionResult> UpdateRestrictions( [FromBody] UpdateRestrictions jsonData)
    {
        try 
        {
            await VaultItemPermissionsService.UpdateRestrictionsAsync(context, jsonData, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine("error "+e.Message);
            return StatusCode(500, new { success = false, message = "Error updating restrictions" });
        }
    }
    
    [HttpPut]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateUserPermissions( [FromBody] UpdateUserPermissions jsonData)
    {
        try 
        {
            await VaultItemPermissionsService.UpdatePermissionsAsync(context, jsonData.VaultItemId, jsonData.UserId, jsonData.Role, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = e.Message == "Last Manage" ? "Cannot remove last Manage role" : "Error updating permissions" });
        }
    }

    [HttpDelete]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> RemovePermission([FromBody] RemoveUserPermissions jsonData)
    {
        try 
        {
            await VaultItemPermissionsService.RemovePermissionsAsync(context, jsonData.VaultItemId, jsonData.UserId, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error removing permissions" });
        }
    }
    
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

