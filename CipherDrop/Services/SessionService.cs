
using Microsoft.EntityFrameworkCore;
using CipherDrop.Data;
using CipherDrop.Models;

namespace CipherDrop.Services;
    public static class SessionService
    {
        public static async Task<Session?> GetSessionAsync(string token, CipherDropContext context)
        {
            if (token == null)
            {
                return null; 
            }

            // Retrieve session from the database based on the token
            var session = await context.Session.Where(s => s.Id == token).FirstOrDefaultAsync();

            if (session != null && session.ExpiresAt > DateTime.UtcNow)
            {
                return session; 
            }
            else
            {
                if(session != null)
                {
                    context.Session.Remove(session);
                    await context.SaveChangesAsync();
                }
                
                return null; // Session not found or expired
            }
        }
        
        public static async Task<Session?> CreateSessionAsync(User user, CipherDropContext context, HttpResponse Response)
        {
            // Create a new session for the user
            string sessionId = Guid.NewGuid().ToString() + Guid.NewGuid().ToString();
            var session = new Session
            {
                Id = sessionId,
                UserId = user.Id,
                Email = user.Email,
                Name = user.Name,
                Role = user.Role,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            // Add the session to the database
            context.Session.Add(session);
            await context.SaveChangesAsync();

            Response.Cookies.Append("session", sessionId, new CookieOptions
            {
                HttpOnly = true,
                Secure = false,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.Now.AddHours(24)
            });

            return session;
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
