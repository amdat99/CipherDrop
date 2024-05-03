
namespace CipherDrop.Models;

public class SetupOptions
{
    public string? Key { get; set; }
    public bool? PublicRegistration { get; set; } = true;
    public bool? InviteOnly { get; set; } = false;
    public bool? Require2FA { get; set; } = false;
    public bool? RequireEmailVerification { get; set; } = false;
    public bool? RequirePasswordChange { get; set; } = false;
    public string? RequirePasswordChangeDays { get; set; }  = "180";
    public bool? RequirePasswordChangeOnFirstLogin { get; set; } = false;
    public bool? AllowPublicSharing { get; set; } = true;
    public bool? DisplayActivity { get; set; } = true;
    public string EncyptionTestText { get; set; } = "";
    public string KeyEnd { get; set; } = "";
}

