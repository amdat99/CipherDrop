using System.Xml;
using CipherDrop.Data;
using CipherDrop.Models;
using CipherDrop.Utils;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Services;
    public class VaultItemService
    {
        public static List<VaultItem?> GetPaginatedVaultItems(CipherDropContext context, int id, string lastId, int userId)
        {
            int lastItemId = int.Parse(lastId);
            // Get the VaultItem where the Id is equal to the id and (IsViewRestricted is false or IsViewRestricted is true and the userId joined with SharedVaultItemView is equal to the userId)
            return [.. context.VaultItem
                        .Where(vf => vf.FolderId == id && vf.Id > lastItemId &&
                                    (!vf.IsViewRestricted ||
                                    (vf.IsViewRestricted &&
                                        context.SharedVaultItem.Any(sv => sv.VaultItemId == vf.Id &&
                                                                        sv.UserId == userId))))
                        .Select(vf => new VaultItem
                        {
                            Id = vf.Id,
                            Reference = vf.Reference,
                            IsFolder = vf.IsFolder,
                            UserId = vf.UserId,
                            UpdatedAt = vf.UpdatedAt
                        })
                        .OrderByDescending(vf => vf.UpdatedAt)
                        .Take(50)];
        }

        public static VaultItem? GetVaultItem(CipherDropContext context, int id, int userId)
        {
            // Get the VaultItem where the Id is equal to the id and (IsViewRestricted is false or IsViewRestricted is true and the userId joined with SharedVaultItemView is equal to the userId)
            var vaultItem = context.VaultItem
                            .Where(vf => vf.Id == id
                                    && (!vf.IsViewRestricted ||
                                        (vf.IsViewRestricted &&
                                            context.SharedVaultItem.Any(sv => sv.VaultItemId == vf.Id &&
                                                                            sv.UserId == userId))))
                            .FirstOrDefault();

            if (vaultItem == null) return null;
            return vaultItem;
        }
 
        //Make sure to run this in a transaction
        public static async Task<int> AddItemTransactionAsync(CipherDropContext context, AddItem jsonData, Session? session)
        {
            var item = new VaultItem
            {
                Reference = jsonData.Reference,
                Value = EncryptionUtils.Encrypt(jsonData.Value),
                FolderId = jsonData.FolderId,
                IsFolder = jsonData.IsFolder,
                UserId = session.UserId
            };

            if(item.IsFolder == true)
            {
                int subFolderId = await VaultFolderService.AddFolderAsync(context,jsonData.Reference, false, session);
                item.RootFolderId = item.FolderId;
                item.FolderId = subFolderId;
            }
            context.VaultItem.Add(item);
            await context.SaveChangesAsync();

            context.SharedVaultItem.Add(new SharedVaultItem
            {
                VaultItemId = item.Id,
                UserId = session.UserId,
                Role = "Manage"
            });            
            await ActivityService.AddActivityAsync("Vault", item.Id, "Create item", jsonData.IsFolder ? "Folder" : "Item", session, context);
            return item.Id;
    }

    public static async Task UpdateItemAsync(CipherDropContext context, VaultItem jsonData, Session? session)
    {
        jsonData.Value = EncryptionUtils.Encrypt(jsonData.Value);
        context.VaultItem.Update(jsonData);   
        await ActivityService.AddActivityAsync("Vault", jsonData.Id, "Update item", jsonData.IsFolder ? "Folder" : "Item", session , context);
    }

    public static async Task UpdateItemReferenceAsync(CipherDropContext context, VaultItem jsonData, Session? session)
    {
        context.VaultItem.FromSql($"UPDATE VaultItem SET Reference = '{jsonData.Reference}' WHERE Id = {jsonData.Id}");
        await ActivityService.AddActivityAsync("Vault", jsonData.Id, "Update item", jsonData.IsFolder ? "Folder" : "Item", session, context);
    }   
    public static async Task DeleteItem(CipherDropContext context, int id, Session? session)
    {
        var item = context.VaultItem.Where(vi => vi.Id == id).FirstOrDefault();
        if(item == null) return;
        context.VaultItem.Remove(item);
        await ActivityService.AddActivityAsync("Vault", item.Id, "Delete item", item.IsFolder ? "Folder" : "Item", session , context);
    }
}
