using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(VaultItemId), nameof(UserId))]

public class SharedVaultItem
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 
    public int? VaultItemId { get; set; }
    public VaultItem? VaultItem { get; set; }
    public string Role { get; set; } = "View";
    public int? TeamId { get; set; }
    public Team? Team { get; set; }
    public int UserId { get; set; } = 0;
    public User? User { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

