using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Newtonsoft.Json.Serialization;

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
    public int? SubFolderId { get; set; }

    [MaxLength(300 , ErrorMessage = "Item title is too long")]
    public string Reference { get; set; } = "";

    [Required]
    [MaxLength(1000000 , ErrorMessage = "Item content is too long")]
    public string Value { get; set; } = "";
    public bool IsFolder { get; set; } = false; 

    //Below restricted fields should be updated by setttings set in AdminSettings before creating the item
    public bool IsViewRestricted { get; set; } = false;
    public bool IsEditRestricted { get; set; } = false;
    public bool IsDeleteRestricted { get; set; } = true;
    public bool RefE2  { get; set; } = false;

    [MaxLength(8)]
    public string? Type { get; set; } 
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public DateTime? DeletedAt { get; set; }
}

