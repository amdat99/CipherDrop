using System.ComponentModel.DataAnnotations;

namespace CipherDrop.Models;

public class SendCipher
{

    [Required(ErrorMessage = "Please enter a value")]
    [StringLength(3000, MinimumLength = 1 , ErrorMessage = "Value should be between 1 and 3000 characters")]
    public string Value { get; set; } = "";

    [Required(ErrorMessage = "Please choose a type")] 
    [StringLength(8, MinimumLength = 1 , ErrorMessage = "Type should be between 1 and 8 characters")]
    public string Type { get; set; } = "";

    [StringLength(60, MinimumLength = 1 , ErrorMessage = "Reference should be between 1 and 60 characters")]
    public string? Reference { get; set; } = "";

    [Required(ErrorMessage = "Please choose an expiration time")]
    public string Expiry { get; set; } = "1hour";

    [StringLength(32, MinimumLength = 8 , ErrorMessage = "Password should be between 8 and 32 characters")]
    public string? Password { get; set; }

    [Compare("Password", ErrorMessage = "Passwords do not match")
    ]
    
    public string? ConfirmPassword { get; set; }

    public bool SaveVault { get; set; } = false;

    public bool RecordActivity { get; set; } = true;


}

