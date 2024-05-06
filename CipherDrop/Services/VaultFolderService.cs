using CipherDrop.Data;
using CipherDrop.Models;

namespace CipherDrop.Services;
    public class VaultFolderService
    {  
        public static List<VaultFolder?> GetPaginatedVaultRootFolders(CipherDropContext context, string lastId)
        {
          return [.. context.VaultFolder
                      .Where(vf => vf.Id > int.Parse(lastId) && vf.IsRoot == true)
                      .OrderBy(vf => vf.Id)
                      .Take(40)];
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
