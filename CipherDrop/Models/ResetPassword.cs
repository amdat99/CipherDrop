
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(Email))]
public class PasswordReset
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 

    [Required]
    [MaxLength(255)]
    public string Email { get; set; } = "";

    [Required]
    [MaxLength(90)]
    public string Token { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
} 

