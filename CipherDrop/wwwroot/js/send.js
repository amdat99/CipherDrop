document.addEventListener("DOMContentLoaded", function () {
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    const type = document.getElementById("Input_Type").value;
    if (type === "public") return this.submit();

    const value = document.getElementById("Input_Value").value;
    var encrypted = CryptoJS.AES.encrypt(value, type === "private" ? document.getElementById("Input_Password").value : key).toString();
    document.getElementById("Input_Value").value = encrypted;
    this.submit();
  });

  const passwordContainer = document.getElementById("Input_Password_Container");
  const confirmPasswordContainer = document.getElementById("Input_ConfirmPassword_Container");
  const passwordInput = document.getElementById("Input_Password");
  const confirmPasswordInput = document.getElementById("Input_ConfirmPassword");

  document.querySelector("#Input_Type").addEventListener("change", function () {
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
});
