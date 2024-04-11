using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(Email), IsUnique = true)]

public class User
{

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; } = 0;

    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = "";

    [Required]
    [StringLength(255, MinimumLength = 3)]
    public string Email { get; set; }   = "";

    [Required]
    public byte[] Password { get; set; } = new byte[32];

    [Required]
    public byte[] PasswordSalt { get; set; } = new byte[32];    
    
    [Required]
    [MaxLength(10)]
    public string Role { get; set; } = "User";

    public string Status { get; set; } = "Active";

    public string? Avatar { get; set; } = "";

    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [MaxLength(64)]
    public string? VerificationToken { get; set; }
    public DateTime? VerificationTokenExpiresAt { get; set;}
    public string? VerifiedAt { get; set; }
}

