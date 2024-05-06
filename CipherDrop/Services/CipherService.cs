
using CipherDrop.Data;
using CipherDrop.Models;
using CipherDrop.Utils;

namespace CipherDrop.Services;

public class CipherService
{
    public static async Task<string> SendCipherTransactionAsync(CipherDropContext context, SendCipher model, Session? session)
    {
      var cipher = new Cipher
            {
                Id = Guid.NewGuid().ToString() + Guid.NewGuid().ToString(),
                Value = model.Value,
                Type = model.Type,
                Reference = model.Reference,
                ExpiresAt = model.Expiry != "After reading" ? ReturnExpiry(model.Expiry) : null,
                SelfDestruct = model.Expiry == "After reading",
                UserId = session.UserId
            };

            if (model.Password != null)
            {
                PasswordUtils.CreatePasswordHash(model.Password, out byte[] passwordHash, out byte[] passwordSalt);
                cipher.Password = passwordHash;
                cipher.PasswordSalt = passwordSalt;
            }

            context.Cipher.Add(cipher);
            await context.SaveChangesAsync();

            if (model.SaveVault)
            {
                // TODO: Save the cipher to the vault 
            }

            if (model.RecordActivity)
            {
                await ActivityService.AddActivityAsync("Cipher", cipher.Id, "Create", model.Type, session, context);
            }
            return cipher.Id;
    }

   public static void DeleteCipherIfSelfDestruct(CipherDropContext context, Cipher cipher)
        {
            if (cipher.SelfDestruct)
            {
                context.Cipher.Remove(cipher);
                context.SaveChanges();
            }
        }
    
    private static DateTime ReturnExpiry(string expiry)
    {
        DateTime expiryTime = DateTime.Now;
        switch (expiry)
        {
            case "1 hour":
                expiryTime = DateTime.Now.AddHours(1);
                break;
            case "1 day":
                expiryTime = DateTime.Now.AddDays(1);
                break;
            case "1 week":
                expiryTime = DateTime.Now.AddDays(7);
                break;
            case "1 month":
                expiryTime = DateTime.Now.AddMonths(1);
                break;
            case "3 months":
                expiryTime = DateTime.Now.AddMonths(3);
                break;
            case "1 year":
                expiryTime = DateTime.Now.AddYears(1);
                break;
            case "Never":
                expiryTime = DateTime.MaxValue;
                break;
        }

        return expiryTime;
    }
}