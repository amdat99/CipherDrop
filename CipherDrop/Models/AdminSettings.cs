
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CipherDrop.Models;

public class AdminSettings
{
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    [Required]
    public int Id { get; set; } 

    public bool PublicRegistration { get; set; } = true;

    public bool InviteOnly { get; set; } = false;

    public bool Require2FA { get; set; } = false;

    public bool RequireEmailVerification { get; set; } = false;

    public bool RequirePasswordChange { get; set; } = false;

    public string RequirePasswordChangeDays { get; set; }  = "180";

    public bool RequirePasswordChangeOnFirstLogin { get; set; } = false;

    public bool AllowPublicSharing { get; set; } = true;

    public bool DisplayActivity { get; set; } = true;

    public string Timezone { get; set; } = "UTC";

    

} 

