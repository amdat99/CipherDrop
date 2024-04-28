function CheckAuth(data) {
  if (data?.email) {
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
  }

  // Check if session storage is present
  token = sessionStorage.getItem("Token");

  if (!token) {
    setToken();
  }

  return token;
}

const setToken = () => {
  const dialog = document.createElement("dialog");
  const modalbackdrop = document.createElement("div");
  modalbackdrop.classList.add("modal-backdrop");
  document.body.appendChild(modalbackdrop);
  dialog.innerHTML = ` 
  <div class="card">
    <div class="card-body p-3">
      <form action="dialog" style="min-width: 300px;">
        <div class="mb-3">
          <label for="token" class="form-label">Enter your token</label>
          <input type="text" class="form-control" id="token" name="token" required maxlength="64">
        </div>
        <div class="d-grid mt-4">
          <button type="submit" class="btn btn-primary btn-block">Unlock</button>
        </div>
        <div style="display:none;" id="decryptError" class="mt-2">
          Token verification failed. Please try again
        </div>
      </form>
    </div>
  </div>`;
  document.body.appendChild(dialog);
  dialog.showModal();

  dialog.querySelector("form").addEventListener("submit", async function (e) {
    e.preventDefault();

    const token = dialog.querySelector("input").value;
    const adminsettings = await FetchAdminSettings();

    //Check if the token is valid
    if (token && adminsettings && CryptoJS.AES.decrypt(adminsettings.encyptionTestText, token + adminsettings.keyEnd).toString(CryptoJS.enc.Utf8) === "test") {
      sessionStorage.setItem("Token", token);
      document.body.removeChild(modalbackdrop);
      dialog.close();
      return token;
    } else {
      dialog.querySelector("#decryptError").style.display = "block";
    }
  });
};

let AdminSettings = null;

const FetchAdminSettings = async () => {
  if (AdminSettings) return AdminSettings;

  try {
    const response = await fetch("/loggedapi/adminsettings", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    if (data?.encyptionTestText) {
      AdminSettings = data;
      return data;
    }
  } catch (error) {
    console.log(error);
  }
};

const GetCsrftoken = (tokenInput) => {
  return tokenInput.split("value=")[1].split('"')[1];
};
