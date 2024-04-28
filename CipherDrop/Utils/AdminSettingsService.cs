
using Microsoft.EntityFrameworkCore;
using CipherDrop.Data;
using CipherDrop.Models;

namespace CipherDrop.Utils
{
    public class AdminSettingsService
    {

       private static AdminSettings _adminSettings = new();
        public async Task<AdminSettings?> GetAdminSettings(CipherDropContext context)
        {
            //Check if the admin settings have been set
            if (_adminSettings.EncyptionTestText == null)
            {
               var adminSettingsQuery = await context.AdminSettings.FirstOrDefaultAsync();
               if (adminSettingsQuery == null)
               {
                   return null;
               }
               _adminSettings = adminSettingsQuery;
            }

            return _adminSettings;
        }

        public static async Task UpdateAdminSettings(AdminSettings adminSettings, CipherDropContext context)
        {
            context.AdminSettings.Update(adminSettings);
            await context.SaveChangesAsync();
            _adminSettings = adminSettings;
        }
    }
}