let inputType = document.getElementById("Input_Type");

document.addEventListener("DOMContentLoaded", () => {
  togglePassword();
  encryptValue();
});

//Toggle password fields
const togglePassword = () => {
  const passwordContainer = document.getElementById("Input_Password_Container");
  const confirmPasswordContainer = document.getElementById("Input_ConfirmPassword_Container");
  const passwordInput = document.getElementById("Input_Password");
  const confirmPasswordInput = document.getElementById("Input_ConfirmPassword");

  inputType.addEventListener("change", function () {
    if (this.value == "private") {
      passwordContainer.style.display = "block";
      confirmPasswordContainer.style.display = "block";
      passwordInput.required = true;
      confirmPasswordInput.required = true;
    } else {
      passwordContainer.style.display = "none";
      passwordInput.value = "";
      confirmPasswordContainer.style.display = "none";
      confirmPasswordInput.value = "";
      passwordInput.required = false;
      confirmPasswordInput.required = false;
    }
  });
};

let valueField = null;

//Encrypt value before sending if not public type
const encryptValue = () => {
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (inputType.value === "public") return this.submit();

    if (!valueField) valueField = document.getElementById("Input_Value");
    const encrypted = CryptoJS.AES.encrypt(
      valueField.value,
      inputType.value === "private" ? document.getElementById("Input_Password").value : sessionStorage.getItem("Key")
    ).toString();
    valueField.value = encrypted;
    this.submit();
  });
};
