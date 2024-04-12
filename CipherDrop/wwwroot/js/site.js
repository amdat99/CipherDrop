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
