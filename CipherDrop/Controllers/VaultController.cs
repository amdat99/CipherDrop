using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils;
using CipherDrop.Services;

namespace CipherDrop.Controllers;

public class VaultController(CipherDropContext context) : Controller
{
    public IActionResult Home()
    {
        return View(context.VaultFolder.Where(vf => vf.IsRoot == true).Take(40).OrderBy(vf => vf.Id).ToList());
    }

    [HttpGet]
    public IActionResult RootFolders()
    {
        try 
        {
            string lastId = Request.Query["lastId"].FirstOrDefault() ?? "0";
            var folders = VaultFolderService.GetPaginatedVaultRootFolders(context, lastId);
            return Json(new { success = true, data = folders });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting folders" });
        }
    }

    public IActionResult FoldersSearch()
    {
        try 
        {
            string query = Request.Query["query"].FirstOrDefault() ?? "";
            string isRoot = Request.Query["isRoot"].FirstOrDefault() ?? "true";
            var folders = VaultFolderService.GetFilteredFolders(context, query , isRoot == "true");
            return Json(new { success = true, data = folders });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting folders" });
        }
    }

    public IActionResult VaultItems(int id)
    {
        try
        {
            string lastId = Request.Query["lastId"].FirstOrDefault() ?? "0";
            var vaultItems = VaultItemService.GetPaginatedVaultItems(context, id, lastId, (HttpContext.Items["Session"] as Session).UserId);
            return Json( new { success = true, data = vaultItems , aSettings = HttpContext.Items["AdminSettings"] as AdminSettings });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting items" });
        }
    }

    public IActionResult VaultItemsSearch()
    {
        try 
        {
            string query = Request.Query["query"].FirstOrDefault() ?? "";
            string folderId = Request.Query["folderId"].FirstOrDefault() ?? throw new Exception("FolderId is required");
            var items = VaultItemService.GetFilteredVaultItems(context, query, int.Parse(folderId), (HttpContext.Items["Session"] as Session).UserId);
            return Json(new { success = true, data = items });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting folders" });
        }
    }


    public async Task<IActionResult> VaultItem(int id)
    {
        try 
        {
            var vaultItem = VaultItemService.GetVaultItem(context, id, (HttpContext.Items["Session"] as Session).UserId);
            if (vaultItem == null) return StatusCode(404, new { success = false, message = "Item not found" });
            // Decrypt the Value and Reference
            vaultItem.Value = EncryptionUtils.Decrypt(vaultItem.Value);
            vaultItem.Reference = EncryptionUtils.Decrypt(vaultItem.Reference);
            //Get the user permission for the item if it exists
            var userPermission = await VaultItemPermissionsService.GetUserPermissionAsync(context, id, HttpContext.Items["Session"] as Session);

            return Json(new { success = true, data = vaultItem, aSettings = HttpContext.Items["AdminSettings"] as AdminSettings , userPermission });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error getting item" });
        }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddRootFolder([FromBody] AddRootFolder jsonData)
    {
        if (!ModelState.IsValid)
        {
            return StatusCode(400, new { success = false, message = "Invalid input" });
        }
        try 
        {
            int folderId = await VaultFolderService.AddFolderAsync(context,jsonData.FolderName, true, HttpContext.Items["Session"] as Session, HttpContext.Items["AdminSettings"] as AdminSettings);
            return Json(new { success = true , id = folderId });
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return StatusCode(500, new { success = false, message = "Error adding folder" });
        }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddItem([FromBody] AddItem jsonData)
    {
        if (!ModelState.IsValid)
        {
            return StatusCode(400, new { success = false, message = "Invalid input" });
        }
        using var transaction = await context.Database.BeginTransactionAsync();
        try 
        {
            int itemId = await VaultItemService.AddItemTransactionAsync(context, jsonData, HttpContext.Items["Session"] as Session, HttpContext.Items["AdminSettings"] as AdminSettings );
            await transaction.CommitAsync();
            return Json(new { success = true , id = itemId });
        }
        catch (Exception e)
        {
            await transaction.RollbackAsync();
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error adding item" });
        }
    }

    [HttpPut]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateItem( [FromBody] VaultItem jsonData)
    {
        if (!ModelState.IsValid)
        {
            return StatusCode(400, new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
        }
        try 
        {
            await VaultItemService.UpdateItemAsync(context, jsonData, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error updating item" });
        }
    }
    
    [HttpPut]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateItemReference( [FromBody] VaultItem jsonData)
    {
        try 
        {
            await VaultItemService.UpdateItemReferenceAsync(context, jsonData, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error updating item" });
        }
    }

    [HttpDelete]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> DeleteItem(int id)
    {
        try 
        {
            await VaultItemService.DeleteItemAsync(context, id, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return StatusCode(500, new { success = false, message = "Error deleting item" });
        }
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

