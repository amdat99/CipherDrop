
using System.ComponentModel.DataAnnotations;

namespace CipherDrop.Models;
public class AddRootFolder
{
    [Required]
    [MaxLength(60)]
    public string FolderName { get; set; } = "";
}
public class AddItem
{
    [Required]
    [MaxLength(60)]
    public string Reference { get; set; } = "";
    [MaxLength(20000)]
    public string Value { get; set; } = "";
    [Required]
    public int FolderId { get; set; }
    public bool IsFolder { get; set; } = false;
}

public class UpdateItem
{
    [Required]    
    public int Id { get; set; }

    [Required]
    public int? UserId { get; set; } = 0;
    public int? FolderId { get; set; }

    [MaxLength(60)]
    public string? Reference { get; set; }

    [Required]
    [MaxLength(20000)]
    public string Value { get; set; } = "";
    public bool IsFolder { get; set; } = false; 

    [MaxLength(8)]
    public string? Type { get; set; } 
    public DateTime? ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } 
    public DateTime UpdatedAt { get; set; }
    public DateTime? DeletedAt { get; set; }
}



