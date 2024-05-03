using System.ComponentModel.DataAnnotations;

namespace CipherDrop.Models;

public class UserLogin
{
    [Required(ErrorMessage = "Please enter your email address")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address") ]
    [StringLength(255, MinimumLength = 3 , ErrorMessage = "Email address should be between 3 and 255 characters")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Please enter your password")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password should be between 8 and 100 characters")]
    public string Password { get; set; } = "";
    public string? Token { get; set; }
    public string? ReturnUrl { get; set; } 
    public string? QrCode { get; set; }

}

