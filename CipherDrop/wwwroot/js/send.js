document.addEventListener("DOMContentLoaded", function () {
  togglePasswordFields();
  encyptValue();
});

const togglePasswordFields = () => {
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
};

let valueField = null;

const encyptValue = () => {
  const typeField = document.getElementById("Input_Type");
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault();
    if (typeField.value === "public") return this.submit();

    if (!valueField) valueField = document.getElementById("Input_Value");
    const encrypted = CryptoJS.AES.encrypt(valueField.value, type === "private" ? document.getElementById("Input_Password").value : key).toString();
    valueField.value = encrypted;
    this.submit();
  });
};
