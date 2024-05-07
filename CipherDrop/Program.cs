using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;
using CipherDrop.Data;
using CipherDrop.Middleware;
using CipherDrop.Utils;
using CipherDrop.Services;

DotNetEnv.Env.Load();

Console.WriteLine("Starting CipherDrop");
Console.WriteLine("Environment: " + Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"));

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
    // Ensure the encryption key is set manually in production
    Console.WriteLine("Enter the encryption key for the application: ");
    var encryptionKey = Console.ReadLine();
    if (string.IsNullOrEmpty(encryptionKey))
    {
        Console.WriteLine("Encryption key cannot be empty. Exiting...");
        return;
    }
    // Set the encryption key in the application
    EncryptionUtils.SetEncryptionKey(encryptionKey);

    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseForwardedHeaders(new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
});

//Session Middleware
app.UseMiddleware<SessionMiddleware>();

app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
