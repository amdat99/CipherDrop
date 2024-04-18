using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using CipherDrop.Data;
using CipherDrop.Middleware;
using CipherDrop.Utils;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<CipherDropContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("CipherDropContext") ?? throw new InvalidOperationException("Connection string 'CipherDropContext' not found.")));

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.Configure<RouteOptions>(options =>
{
   options.LowercaseUrls = true;
});

builder.Services.AddRateLimiter(_ => _
    .AddFixedWindowLimiter(policyName: "fixed", options =>
    {
        options.PermitLimit = 4;
        options.Window = TimeSpan.FromSeconds(12);
        options.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        options.QueueLimit = 2;
    }));

builder.Services.AddSingleton<AdminSettingsService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

//Session Middleware
app.UseMiddleware<SessionMiddleware>();

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
