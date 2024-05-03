using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CipherDrop.Models;

public class VaultItem
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]    
    public int Id { get; set; }

    [Required]
    public int? UserId { get; set; } = 0;
    public User? User { get; set; } = default!;
    public int? FolderId { get; set; }
    public VaultFolder? Folder { get; set; } 

    [MaxLength(60)]
    public string? Reference { get; set; }

    [Required]
    [MaxLength(20000)]
    public string Value { get; set; } = "";
    public bool IsFolder { get; set; } = false; 

    //Below restricted fields should be updated by setttings set in AdminSettings before creating the item
    public bool IsViewRestricted { get; set; } = false;
    public bool IsEditRestricted { get; set; } = false;
    public bool IsDeleteRestricted { get; set; } = true;

    [MaxLength(8)]
    public string? Type { get; set; } 
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public DateTime? DeletedAt { get; set; }
}

