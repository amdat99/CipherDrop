using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CipherDrop.Models;

public class UserActivity
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 

    [Required]
    [MaxLength(15)]
    public string Area { get; set; } = "";

    public int? AreaId { get; set; } 

    [MaxLength(90)]
    public string? StringAreaId { get; set; }

    public int UserId { get; set; } = 0;
    public User User { get; set; } = default!;


    [Required]
    public string Action { get; set; } = "";

    [Required]
    public string Type { get; set; } = ""; //
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;
}

