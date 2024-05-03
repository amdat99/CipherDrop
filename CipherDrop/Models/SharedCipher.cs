using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore;

namespace CipherDrop.Models;

[Index(nameof(CipherId), nameof(TeamId))]

public class SharedCipher
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 

    [Required]
    public string CipherId { get; set; } = "";
    public Cipher Cipher { get; set; } = default!;
    public int TeamId { get; set; } = 0;
    public Team Team { get; set; } = default!;
    public int UserId { get; set; } = 0;
    public User User { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

