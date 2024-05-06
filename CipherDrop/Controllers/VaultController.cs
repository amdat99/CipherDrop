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
        string lastId = Request.Query["lastId"].FirstOrDefault() ?? "0";
        var folders = VaultFolderService.GetPaginatedVaultRootFolders(context, lastId);
        return Json(new { success = true, data = folders });
    }

    public IActionResult VaultItems(int id)
    {
        string lastId = Request.Query["lastId"].FirstOrDefault() ?? "0";
        // Get the VaultItem where the Id is equal to the id and (IsViewRestricted is false or IsViewRestricted is true and the userId joined with SharedVaultItemView is equal to the userId)
        var vaultItems = VaultItemService.GetPaginatedVaultItems(context, id, lastId, (HttpContext.Items["Session"] as Session).UserId);
        return Json( new { success = true, data = vaultItems });
    }

    public IActionResult VaultItem(int id)
    {
        // Get the VaultItem where the Id is equal to the id and (IsViewRestricted is false or IsViewRestricted is true and the userId joined with SharedVaultItemView is equal to the userId)
         var vaultItem = VaultItemService.GetVaultItem(context, id, (HttpContext.Items["Session"] as Session).UserId);
        if (vaultItem == null) return Json(new { success = false, message = "VaultItem not found" });
        // Decrypt the Value
        vaultItem.Value = EncryptionUtils.Decrypt(vaultItem.Value);
        return Json(new { success = true, data = vaultItem, aSettings = HttpContext.Items["AdminSettings"] as AdminSettings });
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddRootFolder([FromBody] AddRootFolder jsonData)
    {
        if (!ModelState.IsValid)
        {
            return Json(new { success = false, message = "Invalid input" });
        }
        try 
        {
            int folderId = await VaultFolderService.AddFolderAsync(context,jsonData.FolderName, true, HttpContext.Items["Session"] as Session); 
            return Json(new { success = true , id = folderId });
        }
        catch (Exception e)
        {
            return Json(new { success = false, message = e.Message });
        }
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> AddItem([FromBody] AddItem jsonData)
    {
        if (!ModelState.IsValid)
        {
            return Json(new { success = false, message = "Invalid input" });
        }
        
        using var transaction = await context.Database.BeginTransactionAsync();
        try 
        {
            int itemId = await VaultItemService.AddItemTransactionAsync(context, jsonData, HttpContext.Items["Session"] as Session);
            await transaction.CommitAsync();
            return Json(new { success = true , id = itemId });
        }
        catch (Exception e)
        {
            await transaction.RollbackAsync();
            Console.WriteLine(e.Message);
            return Json(new { success = false, message = "Error adding item" });
        }
    }

    [HttpPut]
    [ValidateAntiForgeryToken]
    public async Task<IActionResult> UpdateItem( [FromBody] VaultItem jsonData)
    {
        if (!ModelState.IsValid)
        {
            return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
        }

        try 
        {
            await VaultItemService.UpdateItemAsync(context, jsonData, HttpContext.Items["Session"] as Session);
            return Json(new { success = true });
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            return Json(new { success = false, message = "Error updating item" });
        }
    }

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
            return Json(new { success = false, message = "Error updating item" });
        }
    }
    
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

