
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using CipherDrop.Data;
using CipherDrop.Models;

namespace CipherDrop.Utils.SessionUtils
{
    public static class SessionUtils
    {
        public static async Task<Session?> GetSessionAsync(string token, CipherDropContext context)
        {
            if (token == null)
            {
                return null; 
            }

            // Retrieve session from the database based on the token
            var session = await context.Session.FirstOrDefaultAsync(s => s.Id == token);

            if (session != null && session.ExpiresAt > DateTime.UtcNow)
            {
                return session; 
            }
            else
            {
                return null; // Session not found or expired
            }
        }

        public static async Task UpdateSessionAsync(Session session, CipherDropContext context)
        {
            // Update the session in the database
            context.Session.Update(session);
            await context.SaveChangesAsync();
        }

        public static async Task DeleteSessionAsync(Session session, CipherDropContext context)
        {
            // Delete the session from the database
            context.Session.Remove(session);
            await context.SaveChangesAsync();
        }

        public static async Task DeleteUserSessionsAsync(string email, CipherDropContext context)
        {
            // Delete all sessions associated with a user
            var sessions = await context.Session.Where(s => s.Email == email).ToListAsync();
            context.Session.RemoveRange(sessions);
            await context.SaveChangesAsync();
        }

        public static async Task<bool> IsSessionActiveAsync(string token, CipherDropContext context)
        {
            // Check if the session is active
            var session = await GetSessionAsync(token, context);
            return session != null && session.Active;
        }

        public static async Task<bool> IsSessionAdminAsync(string token, CipherDropContext context)
        {
            // Check if the session has admin privileges
            var session = await GetSessionAsync(token, context);
            return session != null && session.Role == "Admin";
        }

    
    }
}