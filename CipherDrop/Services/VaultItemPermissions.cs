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
                .Where(svi => svi.UserId == userId && svi.Role == "Manage")
                .FirstOrDefaultAsync();
                
            if(sharedVaultItem == null)
            {
                return null;
            }
        
            return await context.SharedVaultItem
                .Where(svi => svi.VaultItemId == id && svi.Id > int.Parse(lastId))
                .OrderBy(svi => svi.Id)
                .Take(40)
                .ToListAsync();
        }
}
