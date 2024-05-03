
using CipherDrop.Data;
using CipherDrop.Models;
using CipherDrop.Utils;
using CipherDrop.Utils.SessionUtils;

namespace CipherDrop.Middleware
{
    public class SessionMiddleware(RequestDelegate next)
    {
        private readonly RequestDelegate _next = next;

        public async Task Invoke(HttpContext context)
        {
            // Check if the request path matches the desired paths where session middleware should run
            if (context.Request.Path.StartsWithSegments("/Dashboard") ||
                context.Request.Path.StartsWithSegments("/Vault") ||
                context.Request.Path.StartsWithSegments("/Settings") ||
                context.Request.Path.StartsWithSegments("/Loggedapi")||
                context.Request.Path.StartsWithSegments("/Cipher")) 
            {

                using var scope = context.RequestServices.CreateScope();
                
                //check if the session cookie is present and valid
                var token = context.Request.Cookies["session"];
                if(token == null)
                {
                    context.Response.Redirect("/login");
                    return;
                }

                var dbContext = scope.ServiceProvider.GetRequiredService<CipherDropContext>();
                var adminSettingsService = scope.ServiceProvider.GetRequiredService<AdminSettingsService>();
                var session = await SessionUtils.GetSessionAsync(token, dbContext);

                if (session == null)
                {
                    //Remove the session cookie if it is invalid
                    context.Response.Cookies.Delete("session");

                    // Redirect to login page if session is not valid
                    context.Response.Redirect("/login");
                    return;
                }

                // set  admin settings and redirect to setup page if first time setup has not been completed
                var adminSettings = await adminSettingsService.GetAdminSettings(dbContext);
                if (adminSettings == null)
                {
                    if(session.Role == "Admin")
                    {
                        context.Response.Redirect("/setup");
                        return;
                    }
                
                    context.Response.Redirect("/home/NotSetup");
                    return;
                }

                context.Items["Session"] = session ?? new Session();
                context.Items["AdminSettings"] = adminSettings ?? new AdminSettings();
            }
            await _next(context);
        }
    }
}
