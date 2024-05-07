using CipherDrop.Data;
using CipherDrop.Models;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Services;
    public class VaultItemPermissionsService
    {  
        public static async Task<List<SharedVaultItem>?> GetPaginatedItemUserPermissions(CipherDropContext context, int id, string lastId, int userId)
        {

            //Check if user has manage access to the item
            var sharedVaultItem = await context.SharedVaultItem
                .Where(sv => sv.UserId == userId && sv.Role == "Manage")
                .FirstOrDefaultAsync();
                
            if(sharedVaultItem == null)
            {
                return null;
            }
        
            return await context.SharedVaultItem
                .Where(sv => sv.VaultItemId == id && sv.Id > int.Parse(lastId))
                .OrderBy(sv => sv.Id)
                .Take(40)
                .ToListAsync();
        }
        
        public static async Task<int> AddFolderAsync(CipherDropContext context, string foldername , bool isRoot , Session? session)
        {
            var folder = new VaultFolder
                {
                    Reference = foldername,
                    IsRoot = isRoot,
                    UserId = session.UserId
                };
            context.VaultFolder.Add(folder);
            await context.SaveChangesAsync(); 
            if(isRoot == true)
            {
                await ActivityService.AddActivityAsync("Vault", folder.Id, "Create folder", "", session , context);
            }
            return folder.Id;
        }
}
