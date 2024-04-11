using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using CipherDrop.Data;
using CipherDrop.Models;
using CipherDrop.Utils.SessionUtils;

namespace CipherDrop.Middleware
{
    public class SessionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly CipherDropContext _context;

        public SessionMiddleware(RequestDelegate next, CipherDropContext context)
        {
            _next = next;
            _context = context;
        }

        public async Task Invoke(HttpContext context)
        {
            // Check if the request path matches the desired paths where session middleware should run
            if (context.Request.Path.StartsWithSegments("/Dashboard") ||
                context.Request.Path.StartsWithSegments("/Vault") ||
                context.Request.Path.StartsWithSegments("/Settings") ||
                context.Request.Path.StartsWithSegments("/logged-api"))
            {
                // Retrieve the scoped CipherDropContext from the HttpContext's services
                using var scope = context.RequestServices.CreateScope();
                var dbContext = scope.ServiceProvider.GetRequiredService<CipherDropContext>();

                // Check if the session cookie is present and valid
                var token = context.Request.Cookies["session"];
                var session = await SessionUtils.GetSessionAsync(token, dbContext);

                if (session == null)
                {
                    // Redirect to login page if session is not valid
                    context.Response.Redirect("/login");
                    return;
                }

                // Add the session object to the HttpContext so that it can be accessed by other middlewares/controllers
                context.Items["Session"] = session;
            }

            // Call the next delegate/middleware in the pipeline
            await _next(context);
        }
    }
}
