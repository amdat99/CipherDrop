using System.ComponentModel.DataAnnotations;

namespace CipherDrop.Models;

public class PrivateLink
{

    [Required(ErrorMessage = "Please enter the password")]
    [StringLength(32, MinimumLength = 8 , ErrorMessage = "Password should be between 8 and 32 characters")]

    public string Password { get; set; } = "";

    public string Id { get; set; } = "";

}

