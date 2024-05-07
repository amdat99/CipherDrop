let AdminSettings = null;

/**
 * Handles local key verification and setting user values to local storage if data parameter is passed in
 * @param {object} data - The user data to set in local storage
 * @param {string} data.email - The user email
 * @param {string} data.role - The user role
 * @param {string} data.name - The user name
 * @returns {string} - The token
 * @returns {void}
 */
function CheckAuth(data) {
  if (data?.email) {
    localStorage.setItem("email", data.email);
    localStorage.setItem("role", data.role);
    localStorage.setItem("name", data.name);
  }

  // Check if session storage is present
  token = sessionStorage.getItem("Token");

  if (!token) {
    onSetToken();
  }

  return token;
}
//Display modal to set and verify token
const onSetToken = () => {
  DisplayModal({
    content: `
       <div class="mb-3">
          <label for="token" class="form-label">Enter your key</label>
          <input type="password" class="form-control" id="verify-token" name="token" required maxlength="64">
        </div>
        <div style="display:none;" id="decryptError" class="mt-2">
          Key verification failed. Please try again
        </div>
      `,
    buttonText: "Unlock",
    minWidth: "350px",
    backdropClose: false,
    submitFunction: () => verifyToken(),
  });
};

const verifyToken = async () => {
  const token = document.getElementById("verify-token").value;
  const adminsettings = await FetchAdminSettings();

  //Check if the token is valid
  if (token && adminsettings && CryptoJS.AES.decrypt(adminsettings.encyptionTestText, token + adminsettings.keyEnd).toString(CryptoJS.enc.Utf8) === "test") {
    sessionStorage.setItem("Token", token);
    CloseModal();
    return token;
  } else {
    dialog.querySelector("#decryptError").style.display = "block";
  }
};

/**
 * Handles fetching admin settings and setting the value to the AdminSettings variable
 *
 * @returns {object} - The admin settings
 * @example
 * const adminSettings = await FetchAdminSettings();
 */

const FetchAdminSettings = async () => {
  if (AdminSettings) return AdminSettings;

  try {
    const adminSettingReq = await RequestHandler({ url: "/loggedapi/adminsettings", method: "GET" });
    if (adminSettingReq?.encyptionTestText) {
      AdminSettings = adminSettingReq;
      return adminSettingReq;
    }
  } catch (error) {
    console.log(error);
  }
};

const GetCsrftoken = (tokenInput) => {
  return tokenInput.split("value=")[1].split('"')[1];
};
