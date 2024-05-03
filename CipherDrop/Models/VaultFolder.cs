using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CipherDrop.Models;

public class VaultFolder
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]    
    public int Id { get; set; }

    [Required]
    public int? UserId { get; set; } = 0;
    public User User { get; set; } = default!;

    [MaxLength(60)]
    public string? Reference { get; set; }
    public bool IsRoot { get; set; } = false; 

    //Below restricted fields should be updated by setttings set in AdminSettings before creating the item

    public bool IsViewRestricted { get; set; } = false;
    public bool IsEditRestricted { get; set; } = false;
    public bool IsDeleteRestricted { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public DateTime? DeletedAt { get; set; }
}

