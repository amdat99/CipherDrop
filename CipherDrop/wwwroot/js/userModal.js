let searchTimeout;
let currentUser;
let userSearchListEl;
let userSelectedEl;
let searchInputEl;

/**
 * Display a toast message
 * @param {string} title - The title of the modal
 * @param {string} text - The text to display on the button
 * @param {string[]} [roles] - The roles to select from
 * @param {Function} submitFunction - The function to run when the submit button is clicked
 */
const UserModal = async ({ title = "", text = "Add user", roles, submitFunction }) => {
  const content = `
 ${title ? `<h5 class="card-title mb-4">${title}</h5>` : ""}
    <div class="form-group">
      <input type="text" class="form-control bg-dark text-white border-0 " id="user-search-input" placeholder="Search for a user" />
      <ul class="list-group mt-3" id="user-search-list" style="max-height: 50vh; overflow-y: auto;"></ul>
      <div class="alert mt-2 card-offset" role="alert" style="display: none" id="user-selected">
    </div>
  `;

  DisplayModal({
    content,
    buttonText: text,
    submitFunction: () => {
      if (!currentUser) return DisplayToast({ message: "Please select a user", type: "danger" });
      else if (roles && currentUser.role && !roles.includes(currentUser.role)) return DisplayToast({ message: "Please select a valid role", type: "danger" });
      submitFunction(currentUser);
    },
    minWidth: "80vw",
    maxWidth: "500px",
    closeModalFunction: () => {
      currentUser = null;
    },
  });

  searchInputEl = document.getElementById("user-search-input");
  userSearchListEl = document.getElementById("user-search-list");
  userSelectedEl = document.getElementById("user-selected");

  searchInputEl.addEventListener("input", async (e) => {
    onChangeUser(e, roles);
  });
};

const getUserSearchList = async (searchTerm) => {
  const request = await RequestHandler({ url: `/loggedapi/usersquery?query=${searchTerm}`, method: "GET" });
  if (!request.success) return DisplayToast({ message: "An error occured", type: "danger" });
  let userHtml = "";
  request.data.forEach((user) => {
    userHtml += `
      <li class="list-group-item d-flex justify-content-between align-items-center user-list-item cursor-pointer card-offset card-offset-hover" id="user-${user.id}">
        ${user.name} <span class="badge bg-primary rounded-pill">${user.email}</span>
      </li>
    `;
  });

  return userHtml;
};

const onChangeUser = (e, roles) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    const users = await getUserSearchList(e.target.value);
    userSearchListEl.innerHTML = users;
    setUserListItemOnClick(roles);
  });
};

const setUserListItemOnClick = (roles = null) => {
  $(".user-list-item").off("click");
  $(".user-list-item").on("click", function (e) {
    const userId = e.target.id.split("-")[1];
    currentUser = { id: userId, name: e.target.innerText.trim() };
    userSearchListEl.style.display = "none";
    searchInputEl.value = "";
    searchInputEl.style.display = "none";
    userSelectedEl.style.display = "block";

    userSelectedEl.innerHTML = `
      <p style="font-size: 1.2rem" class="mb-0 d-flex justify-content-between align-items-center">${e.target.innerHTML}</p>
      ${
        roles
          ? `
          <label for="role-select" class="form-label mt-2">Choose a role</label>
          <select class="form-select form-select-sm text-white bg-dark border-0 mt-2" required id="role-select">
          <option value="">Select a role</option>
          ${roles.map((role) => `<option value="${role}">${role}</option>`).join("")}</select>`
          : ""
      }
      <button type="button" class="btn btn-danger btn-sm mt-4" id="remove-user">Remove</button>
    `;

    document.getElementById("remove-user").addEventListener("click", () => {
      currentUser = null;
      userSelectedEl.style.display = "none";
      userSearchListEl.style.display = "block";
      searchInputEl.style.display = "block";
    });

    if (roles) {
      document.getElementById("role-select").addEventListener("change", (e) => {
        currentUser.role = e.target.value;
      });
    }
  });
};
