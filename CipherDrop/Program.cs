using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using CipherDrop.Data;
using System.Drawing.Printing;


var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<CipherDropContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("CipherDropContext") ?? throw new InvalidOperationException("Connection string 'CipherDropContext' not found.")));

// Add services to the container.
builder.Services.AddControllersWithViews();

builder.Services.Configure<RouteOptions>(options =>
{
   options.LowercaseUrls = true;
});


var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();


app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
