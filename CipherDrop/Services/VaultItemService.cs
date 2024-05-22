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
            // Get the VaultItem where the Id is equal to the id and (IsViewRestricted is false or IsViewRestricted is true and the userId joined with SharedVaultItemView is equal to the userId) and decrypt the reference in all rows
           return [.. context.VaultItem
                        .Where(vf => vf.FolderId == id && vf.Id > lastItemId &&
                                    (!vf.IsViewRestricted ||
                                    (vf.IsViewRestricted &&
                                        context.SharedVaultItem.Any(sv => sv.VaultItemId == vf.Id &&
                                                                        sv.UserId == userId))))
                        .Select(vf => new VaultItem
                        {
                            Id = vf.Id,
                            Reference = EncryptionUtils.Decrypt(vf.Reference,null),
                            IsFolder = vf.IsFolder,
                            UserId = vf.UserId,
                            FolderId = vf.FolderId,
                            SubFolderId = vf.SubFolderId,
                            UpdatedAt = vf.UpdatedAt
                        })
                        .OrderByDescending(vf => vf.UpdatedAt)
                        .Take(50)];
        }

        public static List<VaultItem?> GetFilteredVaultItems(CipherDropContext context, string query, int folderId, int userId)
        {
            // Fetch the items from the database without decrypting
            var vaultItems = context.VaultItem
                                    .Where(vf => vf.FolderId == folderId &&
                                                (!vf.IsViewRestricted || 
                                                (vf.IsViewRestricted && 
                                                context.SharedVaultItem.Any(sv => sv.VaultItemId == vf.Id && sv.UserId == userId))))
                                    .ToList();

            // Decrypt the references and filter in-memory
            var filteredItems = vaultItems
                                .Where(vf => EncryptionUtils.Decrypt(vf.Reference, null).Contains(query, StringComparison.CurrentCultureIgnoreCase))
                                .Select(vf => new VaultItem
                                {
                                    Id = vf.Id,
                                    Reference = EncryptionUtils.Decrypt(vf.Reference, null),
                                    IsFolder = vf.IsFolder,
                                    UserId = vf.UserId,
                                    FolderId = vf.FolderId,
                                    SubFolderId = vf.SubFolderId,
                                    UpdatedAt = vf.UpdatedAt
                                })
                                .OrderByDescending(vf => vf.UpdatedAt)
                                .Take(40)
                                .ToList();

            return filteredItems;
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
        public static async Task<int> AddItemTransactionAsync(CipherDropContext context, AddItem jsonData, Session? session, AdminSettings? adminSettings)
        {
            var item = new VaultItem
            {
                Reference = EncryptionUtils.Encrypt(jsonData.Reference),
                Value = EncryptionUtils.Encrypt(jsonData.Value),
                FolderId = jsonData.FolderId,
                IsFolder = jsonData.IsFolder,
                UserId = session.UserId,
                RefE2 = adminSettings.AllowGlobalSearchAndLinking != true
            };

            if(item.IsFolder == true)
            {
                int subFolderId = await VaultFolderService.AddFolderAsync(context,jsonData.Reference, false, session, adminSettings);
                item.SubFolderId = subFolderId;
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
        await context.Database.ExecuteSqlInterpolatedAsync($@"
        UPDATE VaultItem
        SET Value = {jsonData.Value}, UpdatedAt = DATETIME('now')
        WHERE Id = {jsonData.Id}
            AND (
                IsEditRestricted = 0
                OR (
                    IsEditRestricted = 1
                    AND EXISTS (
                        SELECT UserId
                        FROM SharedVaultItem
                        WHERE VaultItemId = {jsonData.Id}
                            AND ROLE != 'View'
                            AND UserId = {session.UserId}
                        )
                    )
                )");
        await ActivityService.AddActivityAsync("Vault", jsonData.Id, "Update item", jsonData.IsFolder ? "Folder" : "Item", session , context);
    }

    public static async Task UpdateItemReferenceAsync(CipherDropContext context, VaultItem jsonData, Session? session)
    {
        string encryptedReference = EncryptionUtils.Encrypt(jsonData.Reference);
        await context.Database.ExecuteSqlInterpolatedAsync($@"
        UPDATE VaultItem 
        SET Reference = {encryptedReference}, UpdatedAt = DATETIME('now')
        WHERE Id = {jsonData.Id}
            AND (
                IsEditRestricted = 0
                OR (
                    IsEditRestricted = 1
                    AND EXISTS (
                        SELECT UserId
                        FROM SharedVaultItem
                        WHERE VaultItemId = {jsonData.Id}
                            AND ROLE != 'View'
                            AND UserId = {session.UserId}
                        )
                    )
                )");
        await ActivityService.AddActivityAsync("Vault", jsonData.Id, "Update item", jsonData.IsFolder ? "Folder" : "Item", session, context);
    }   
    
    public static async Task DeleteItemAsync(CipherDropContext context, int id, Session? session)
    {
        //Check if user has manage permissions
        var sharedVaultItem = context.SharedVaultItem.Where(svi => svi.VaultItemId == id && svi.UserId == session.UserId && svi.Role == "Manage").FirstOrDefault();
        if(sharedVaultItem == null)  throw new Exception("User does not have permission to delete this item");
       
        var item = context.VaultItem.Where(vi => vi.Id == id).FirstOrDefault();
        if(item == null) throw new Exception("Item not found");
        context.VaultItem.Remove(item);
        await ActivityService.AddActivityAsync("Vault", item.Id, "Delete item", item.IsFolder ? "Folder" : "Item", session , context);
    }
}
