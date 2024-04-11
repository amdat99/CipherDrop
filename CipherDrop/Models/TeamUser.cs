using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(TeamId), nameof(UserId))]
public class TeamUser
{

    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 
    public int TeamId { get; set; }
    public Team Team { get; set; } = default!;
    public int UserId { get; set; }
    public User User { get; set; } = default!;
    public string? Role { get; set; } = "User";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

}

