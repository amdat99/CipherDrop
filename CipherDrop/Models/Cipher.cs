using System.ComponentModel.DataAnnotations;

namespace CipherDrop.Models;

public class Cipher
{
    [Required]
    public string Id { get; set; } = "";

    [Required]
    public int? UserId { get; set; } = 0;
    public User User { get; set; } = default!;

    [MaxLength(60)]
    public string? Reference { get; set; }

    [Required]
    [MaxLength(5000)]
    public string Value { get; set; } = "";

    [MaxLength(8)]
    public string? Type { get; set; } 
    public DateTime? ExpiresAt { get; set; }
    public bool SelfDestruct { get; set; }  = false;
    public byte[]? Password { get; set; } 
    public byte[]? PasswordSalt { get; set; }    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
    public DateTime? DeletedAt { get; set; }
}

