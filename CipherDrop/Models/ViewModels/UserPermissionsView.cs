    
namespace CipherDrop.Models;

public class UserPermissionsView
{
    public int Id { get; set; } = 0;
    public int? VaultItemId { get; set; } = 0;
    public int UserId { get; set; } = 0;
    public string Role { get; set; } = "";
    public string? UserName { get; set; } = "";
}

