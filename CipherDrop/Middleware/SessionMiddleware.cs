
using CipherDrop.Data;
using CipherDrop.Models;
using CipherDrop.Services;

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
                var session = await SessionService.GetSessionAsync(token, dbContext);

                if (session == null)
                {
                    //Remove the session cookie if it is invalid
                    context.Response.Cookies.Delete("session");
                    context.Response.StatusCode = 401;

                    //If get request, redirect to login page
                    if (context.Request.Method == "GET")
                    {
                        context.Response.Redirect("/login");
                        return;
                    }
                    return;
                }

                // set  admin settings and redirect to setup page if first time setup has not been completed
                var adminSettings = await adminSettingsService.GetAdminSettingsAsync(dbContext);
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
