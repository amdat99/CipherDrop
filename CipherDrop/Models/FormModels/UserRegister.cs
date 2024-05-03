using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CipherDrop.Models;

public class UserRegister
{
    [Required(ErrorMessage = "Please enter your name") ]
    [StringLength(60, MinimumLength = 3, ErrorMessage = "Name should be between 3 and 60 characters")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Please enter your email address")]
    [EmailAddress(ErrorMessage = "Please enter a valid email address") ]
    [StringLength(255, MinimumLength = 3 , ErrorMessage = "Email address should be between 3 and 255 characters")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Please enter your password")]
    [StringLength(100, MinimumLength = 8, ErrorMessage = "Password should be between 8 and 100 characters")]
    public string Password { get; set; } = "";

    [Required(ErrorMessage = "Please confirm your password")]
    [NotMapped]
    [Compare("Password", ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = "";

}

