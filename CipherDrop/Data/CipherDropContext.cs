
using Microsoft.EntityFrameworkCore;
using CipherDrop.Models;

namespace CipherDrop.Data 
{
    public class CipherDropContext(DbContextOptions<CipherDropContext> options) : DbContext(options)
    {
        public DbSet<User> User { get; set; } = default!;
        public DbSet<Session> Session { get; set; } = default!;

        public DbSet<Team> Team { get; set; } = default!;
        public DbSet<TeamUser> TeamUser { get; set; } = default!;

        public DbSet<Cipher> Cipher { get; set; } = default!;

        public DbSet<SharedCipher> SharedCipher { get; set; } = default!;

        public DbSet<UserInvite> UserInvite { get; set; } = default!;

        public DbSet<PasswordReset> PasswordReset { get; set; } = default!;

        public DbSet<AdminSettings> AdminSettings { get; set; } = default!;

        public DbSet<UserActivity> UserActivity { get; set; } = default!;

        public DbSet<VaultFolder> VaultFolder { get; set; } = default!;

        public DbSet<VaultItem> VaultItem { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
            {
                modelBuilder.Entity<SharedCipher>()
                    .HasOne(sc => sc.Cipher)
                    .WithMany()
                    .HasForeignKey(sc => sc.CipherId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                modelBuilder.Entity<Cipher>()
                    .HasOne(c => c.User)
                    .WithMany()
                    .HasForeignKey(c => c.UserId)
                    .OnDelete(DeleteBehavior.Cascade);

                modelBuilder.Entity<TeamUser>()
                    .HasOne(tu => tu.Team)
                    .WithMany()
                    .HasForeignKey(tu => tu.TeamId)
                    .OnDelete(DeleteBehavior.Cascade);
                
                modelBuilder.Entity<VaultItem>()
                    .HasOne(vi => vi.Folder)
                    .WithMany()
                    .HasForeignKey(vi => vi.FolderId)
                    .OnDelete(DeleteBehavior.Cascade);
            }
            
    }
}
