// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

// Write your JavaScript code.

document.getElementById("Copy_Button").click(function () {
  const target = this.getAttribute("data-clipboard-target");
  const el = document.querySelector(target);
  el.select();
  document.execCommand("copy");
  let newDiv = $("div").css({ position: "absolute", left: "100px", top: "100px" }).text("Copied to clipboard");
  newDiv.fadeOut(5000);
});

function CheckAuth(data) {
  if (data?.token) {
    sessionStorage.setItem("Token", data.token);
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);

    return data.token;
  } else {
    // Check if session storage is present
    token = sessionStorage.getItem("Token");
    if (!token) {
      //Show a html dialog box to enter the token

      const setToken = () => {
        let token = prompt("Please enter your token", "");
        if (token != null) {
          sessionStorage.setItem("Token", token);
          return token;
        }
        setToken();
      };

      setToken();
    }

    return token;
  }
}
