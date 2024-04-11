using System.ComponentModel.DataAnnotations;

namespace CipherDrop.Models;

public class UserActivityViewModel
{

    public int Id { get; set; } = 0;
    public string Area { get; set; } = "";
    public int? AreaId { get; set; } = 0;
    public string? StringAreaId { get; set; } = "";
    public int UserId { get; set; } = 0;
    public string UserName { get; set; } = "";
    public string Action { get; set; } = "";
    public string Type { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    public DateTime UpdatedAt { get; set; } = DateTime.Now;


}

