
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(Email))]
public class UserInvite
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

    [Required]
    [MaxLength(10)]
    public string Role { get; set; } = "User";

    [MaxLength(60)]
    public string? Org { get; set; } = "";

    [Required]
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
} 

