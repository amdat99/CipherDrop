using CipherDrop.Data;
using CipherDrop.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Mvc.Filters;

namespace CipherDrop.Services;
    public class VaultItemPermissionsService
    {  
        public static async Task<List<UserPermissionsView>?> GetPaginatedItemUserPermissions(CipherDropContext context, int id, string lastId, int userId)
        {
            if (!await HasRolePermission(context, id, userId, "Manage"))
            {
                throw new Exception("Unauthorized");
            }
       
            return await context.SharedVaultItem
                .Join(context.User, svi => svi.UserId, u => u.Id, (svi, u) => new UserPermissionsView
                {
                    Id = svi.Id,
                    VaultItemId = svi.VaultItemId,
                    UserId = svi.UserId,
                    Role = svi.Role,
                    UserName = u.Name
                })
                .Where(svi => svi.VaultItemId == id && svi.Id > int.Parse(lastId))
                .OrderBy(svi => svi.Id)
                .Take(40)
                .ToListAsync();
        }

        public static async Task<UserPermissionsView?> GetUserPermissionAsync(CipherDropContext context, int id, Session? session)
        {
            return await context.SharedVaultItem
                .Where(svi => svi.VaultItemId == id && svi.UserId == session.UserId)
                .Select(svi => new UserPermissionsView
                {
                    Id = svi.Id,
                    VaultItemId = svi.VaultItemId,
                    UserId = svi.UserId,
                    Role = svi.Role
                })
                .FirstOrDefaultAsync();
        }

        public static async Task<int> AddPermissionsAsync(CipherDropContext context, int vaultItemId, int userId, string role, Session? session)
        {
            if (!await HasRolePermission(context, vaultItemId, session.UserId, "Manage"))
            {
                throw new Exception("Unauthorized");
            }

            //Check if the user already has permissions
            if (await context.SharedVaultItem
                .Where(svi => svi.VaultItemId == vaultItemId && svi.UserId == userId)
                .AnyAsync())
            {
                throw new Exception("User exixts");
            }

            var SharedVaultItem = new SharedVaultItem
                {
                    VaultItemId = vaultItemId,
                    UserId = userId,
                    Role = role
                };

            context.SharedVaultItem.Add(SharedVaultItem);
            await context.SaveChangesAsync();
            return SharedVaultItem.Id;
        }

        public static async Task RemovePermissionsAsync(CipherDropContext context, int id, int userId, Session? session)
        {
            if (!await HasRolePermission(context, id, session.UserId, "Manage"))
            {
               throw new Exception("Unauthorized");
            }

            //Check if only one Manage role is left
            await CheckIfLastManagedRole(context, id, userId);

            var SharedVaultItem = await context.SharedVaultItem
                .Where(svi => svi.VaultItemId == id && svi.UserId == userId)
                .FirstOrDefaultAsync() ?? throw new Exception("SharedVaultItem not found");
            
            context.SharedVaultItem.Remove(SharedVaultItem);
            await context.SaveChangesAsync();
        }

        public static async Task UpdatePermissionsAsync(CipherDropContext context, int vaultItemId, int userId, string role, Session? session)
        {
            if (!await HasRolePermission(context, vaultItemId, session.UserId, "Manage"))
            {
                throw new Exception("Unauthorized");
            }

            if(role != "Manage")
            {
                await CheckIfLastManagedRole(context, vaultItemId, userId);
            }
            
            var SharedVaultItem = new SharedVaultItem
                {
                    VaultItemId = vaultItemId,
                    UserId = userId,
                    Role = role
                };

            context.SharedVaultItem.Update(SharedVaultItem);
            await context.SaveChangesAsync();
        }

        public static async Task UpdateRestrictionsAsync( CipherDropContext context , UpdateRestrictions jsonData, Session? session)
        {            
            if (!await HasRolePermission(context, jsonData.Id, session.UserId, "Manage"))
            {
                throw new Exception("Unauthorized");
            }
            await context.Database.ExecuteSqlInterpolatedAsync($@"
            UPDATE VaultItem 
            SET IsViewRestricted = {jsonData.IsViewRestricted}, IsEditRestricted = {jsonData.IsEditRestricted}, UpdatedAt = DATETIME('now') 
            WHERE Id = {jsonData.Id}");
            await context.SaveChangesAsync();
        }

        private static async Task<bool> HasRolePermission(CipherDropContext context, int id, int userId, string role)
        {
            return await context.SharedVaultItem
                .Where(svi => svi.VaultItemId == id && svi.UserId == userId && svi.Role == role)
                .AnyAsync();
        }

        private static async Task CheckIfLastManagedRole(CipherDropContext context, int vaultItemId, int userId)
        {
            // if role doesnt equal to Manage get all the roles that are not Manage
            var manageRole = await context.SharedVaultItem
                .Where(svi => svi.VaultItemId == vaultItemId && svi.Role == "Manage")
                .ToListAsync();
                
            //If the there is only 1 Manage role and it has the same user id as the user id that is being updated, do allow removing the Manage role
            if(manageRole.Count == 1 && manageRole[0].UserId == userId)
            {
                throw new Exception("Last Manage");
            }
        }
}

// public class CustomAsyncFilter : IAsyncActionFilter
// {
//     public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
//     {
//         // Code to execute before the action method is invoked
//         // This method is called asynchronously before the action method is executed
        
//         // You can perform asynchronous operations here
        
//         // Call the next filter or action method in the pipeline
//         await next();

//         // Code to execute after the action method is invoked
//         // This method is called asynchronously after the action method has been executed
//     }
// }