
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CipherDrop.Models;

public class Session
{
    [Required]
    [MaxLength(90)]
    public string Id { get; set; } = "";

    [Required]
    [MaxLength(60)]
    public string Name { get; set; } = "";
       
    [ForeignKey("User")]
    [Required]

    public int UserId { get; set; } = 0;

    [MaxLength(255)]
    [Required]
    public string Email { get; set; } = "";

    [MaxLength(255)]
    public string IP { get; set; } = "";

    [MaxLength(60)]
    public string? Org { get; set; } = "";

    [MaxLength(10)]
    public string Role { get; set; } = "User";
    public bool Active { get; set; } = true;
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}

