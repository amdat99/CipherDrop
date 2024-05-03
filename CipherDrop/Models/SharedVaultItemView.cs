using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(VaultItemId), nameof(UserId))]

public class SharedVaultItemView
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 

    [Required]
    public int VaultItemId { get; set; } = 0;
    public VaultItem VaultItem { get; set; } = default!;

    public int TeamId { get; set; } = 0;
    public Team Team { get; set; } = default!;
    public int UserId { get; set; } = 0;
    public User User { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

