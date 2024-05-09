

namespace CipherDrop.Models;

public class AddPermission
{
    public int VaultItemId { get; set; } = 0;
    public int UserId { get; set; } = 0;
    public string Role { get; set; } = "";
}
public class UpdateUserPermissions
{
    public int Id { get; set; } = 0;
    public int VaultItemId { get; set; } = 0;
    public int UserId { get; set; } = 0;
    public string Role { get; set; } = "";
    public string? UserName { get; set; } = "";
}

public class UpdateRestrictions
{
    public int Id { get; set; } = 0;
    public int? FolderId { get; set; }
    public int? RootFolderId { get; set; } 
    public bool IsViewRestricted { get; set; } = false;
    public bool IsEditRestricted { get; set; } = false;
}

public class RemoveUserPermissions
{
    public int VaultItemId { get; set; } = 0;
    public int UserId { get; set; } = 0;
}