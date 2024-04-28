using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using CipherDrop.Models;
using CipherDrop.Data;
using CipherDrop.Utils.ActivityUtils;
using CipherDrop.Utils;

namespace CipherDrop.Controllers;

public class VaultController(CipherDropContext context) : Controller
{
    public IActionResult Home()
    {
        return View(context.VaultFolder.Where(vf => vf.IsRoot == true).Take(50).ToList());
    }

    public IActionResult VaultItems(int id)
    {
        string lastId = Request.Query["lastId"].FirstOrDefault() ?? "0";
        var vaultItems = context.VaultItem.Where(vf => vf.FolderId == id  && vf.Id > int.Parse(lastId)).Select(vf => new { vf.Id, vf.Reference, vf.IsFolder , vf.UserId, vf.UpdatedAt }).ToList();
        return Json( new { success = true, data = vaultItems });
    }

    public IActionResult VaultItem(int id)
    {
        var vaultItem = context.VaultItem.FirstOrDefault(vf => vf.Id == id);
        
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
            var folder = new VaultFolder
            {
                Reference = jsonData.FolderName,
                IsRoot = true,
                UserId = (HttpContext.Items["Session"] as Session).UserId
            };
            context.VaultFolder.Add(folder);
            await context.SaveChangesAsync(); 
            await ActivityUtils.AddActivityAsync("Vault", folder.Id, "Create folder", "", HttpContext.Items["Session"] as Session , context);

            return Json(new { success = true , id = folder.Id });
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

        try 
        {
            var item = new VaultItem
            {
                Reference = jsonData.Reference,
                Value = EncryptionUtils.Encrypt(jsonData.Value),
                FolderId = jsonData.FolderId,
                IsFolder = jsonData.IsFolder,
                UserId = (HttpContext.Items["Session"] as Session).UserId
            };
            context.VaultItem.Add(item);
            await context.SaveChangesAsync();
            await ActivityUtils.AddActivityAsync("Vault", item.Id, "Create item", jsonData.IsFolder ? "Folder" : "Item", HttpContext.Items["Session"] as Session , context);

            return Json(new { success = true , id = item.Id });
            }
         catch (Exception e)
        {
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
            //return model errors
            return Json(new { success = false, errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage) });
        }

        try 
        {
            jsonData.Value = EncryptionUtils.Encrypt(jsonData.Value);
            context.VaultItem.Update(jsonData);   
            await context.SaveChangesAsync();
            await ActivityUtils.AddActivityAsync("Vault", jsonData.Id, "Update item", jsonData.IsFolder ? "Folder" : "Item", HttpContext.Items["Session"] as Session , context);
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
