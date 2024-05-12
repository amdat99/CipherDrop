let permissionsTableBodyEl;
let currentButtonEl;
let editRestrictionInputEl;
let viewRestrictionInputEl;
let usersFilterInputEl;

let currentRole = "View";
let firstSet = true;
let permissionsLoading = false;
let lastPermissionnsId = 0;
let permissionsModel = {};
let userPermissions = [];

PermissionsButtonEl.on("click", async function () {
  if (!ItemContent[CurrentTabIndex].CurrentItem) return DisplayToast({ message: "Please select an item to view permissions", type: "danger" });
  lastPermissionnsId = 0;

  permissionsModel = {
    id: ItemContent[CurrentTabIndex].CurrentItem.id,
    folderId: ItemContent[CurrentTabIndex].CurrentItem.folderId,
    rootFolderId: ItemContent[CurrentTabIndex].CurrentItem.rootFolderId,
    isViewRestricted: ItemContent[CurrentTabIndex].CurrentItem.isViewRestricted,
    isEditRestricted: ItemContent[CurrentTabIndex].CurrentItem.isEditRestricted,
  };

  const permissions = await fetchPermissions();
  if (!permissions) return DisplayToast({ message: "Failed to fetch permissions", type: "danger" });
  userPermissions = permissions;

  if (VaultItemPemrmissions.is(":visible")) {
    tinymce.activeEditor.show();
    VaultItemPemrmissions.hide();
  } else {
    VaultItemPemrmissions.show();
    tinymce.activeEditor.hide();
  }

  setPermissions(permissions, true);

  if (!editRestrictionInputEl) editRestrictionInputEl = $("#IsEditRestricted");
  if (!viewRestrictionInputEl) viewRestrictionInputEl = $("#IsViewRestricted");
  if (!usersFilterInputEl) usersFilterInputEl = $("#user-permissions-search-input");

  editRestrictionInputEl.prop("checked", ItemContent[CurrentTabIndex].CurrentItem.isEditRestricted);
  viewRestrictionInputEl.prop("checked", ItemContent[CurrentTabIndex].CurrentItem.isViewRestricted);

  if (!firstSet) return;
  firstSet = false;
  OnFirstInitSet();
});

const setPermissions = (permissions, reset = false) => {
  if (!permissionsTableBodyEl) permissionsTableBodyEl = $("#user-permissions-table-body");

  let permissionsHtml = "";
  permissions.forEach((permission) => {
    permissionsHtml += formatPermissionRow(permission);
  });

  if (reset) permissionsTableBodyEl.html(permissionsHtml);
  else permissionsTableBodyEl.append(permissionsHtml);
};

const formatPermissionRow = (permission) => {
  return `<tr id="user-permission-row-${permission.userId}">
    <td><input type="checkbox" class="form-check" id="user-permission-${permission.id}" name="user-permission-${permission.id}" /></td>
      <td class="text-white">${permission.userName}</td>
    <td>
        <div class="dropdown">
            <button class="btn btn-primary btn-sm bg-dark text-white dropdown-toggle permission-dropdown-btn " style="min-width:120px" type="button" id="dropdownMenuButton-${
              permission.id
            }" data-bs-toggle="dropdown" aria-expanded="false">
                Role : ${permission.role}
            </button>
            <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton-${permission.id}">
                <li><div class="dropdown-item permission-role-btn" id="view-btn-${permission.userId}">View
                        <p class="text-muted 
                        ${permissionsModel.isViewRestricted ? "text-danger" : ""}">- Users will only have read access to this item.</p>
                    </div>
                </li>
                <li><div class="dropdown-item permission-role-btn" id="edit-btn-${permission.userId}">Edit
                        <p class="text-muted w-50
                        ${permissionsModel.isEditRestricted ? "text-danger" : ""}">- Users wil be able to edit this item and add attachments to it.</p>
                    </div>
                </li>
                <li><div class="dropdown-item permission-role-btn" id="delete-btn-${permission.userId}">Manage
                        <p 
                        style="max-width: 500px; word-wrap: break-word; word-break: break-all; white-space: normal;"
                        class="text-muted
                        ${
                          permissionsModel.isDeleteRestricted ? "text-danger" : ""
                        }">- Users will have full control over this item. This incldes the ability to delete it and manage its permissions.</p>
                    </div>
                </li>
            </ul>
            <button id="remove-permission-${
              permission.userId
            }" class="btn btn-primary btn-sm bg-dark text-white remove-user-permission" style="margin-left:20px;" data-bs-toggle="tooltip" data-bs-placement="top" title="Remove User">Remove</button>
        </div>
    </td>
</tr>`;
};

const OnFirstInitSet = () => {
  //Set Click listeners gor default restrictions
  editRestrictionInputEl.on("change", async function () {
    const currentChecked = $(this).is(":checked");
    const updateRestictionsReq = await updateRestrictions(null, currentChecked);
    if (!updateRestictionsReq.success) return (this.checked = !currentChecked);
  });

  $("#IsViewRestricted").on("change", async function () {
    let currentChecked = $(this).is(":checked");
    const updateRestictionsReq = await updateRestrictions(currentChecked, null);
    if (!updateRestictionsReq.success) return (this.checked = !currentChecked);
  });

  //Close btn
  $("#close-permissions").on("click", function () {
    VaultItemPemrmissions.hide();
    tinymce.activeEditor.show();
  });

  //Add user to permissions
  $("#user-permissions-add-user").on("click", () => {
    UserModal({
      title: "Add User to Permissions",
      submitText: "Add User",
      roles: ["View", "Edit", "Manage"],
      submitFunction: (user) => {
        if (user.role) {
          //Add user to permissions
          addUserPermission();
        }
      },
    });
  });

  setRowPermissionListeners();
  userSearchFilter();
};

const setRowPermissionListeners = () => {
  $(".permission-dropdown-btn").off("click");
  $(".permission-dropdown-btn").on("click", function () {
    currentRole = $(this).text().split(":")[1].trim();
    currentButtonEl = $(this);
  });

  $(".permission-role-btn").off("click");
  $(".permission-role-btn").on("click", function () {
    const userId = $(this).attr("id").split("-")[2];
    const role = $(this).text().split("-")[0].trim();
    if (role === currentRole) return;
    setUserRoles(role, userId);
  });

  $(".remove-user-permission").off("click");
  $(".remove-user-permission").on("click", function () {
    const userId = $(this).attr("id").split("-")[2];
    DisplayModal({
      title: "Remove User Permission",
      content:
        "<div>Are you sure you want to remove this user from the permissions list? Based on the role the user has and the default restrictions, they may lose view and/or edit access to this item.</div>",
      buttonText: "Remove",
      buttonStyle: "background-color: var(--danger-color); border-color: var(--danger-color);",
      submitFunction: () => {
        removeUserPermission(userId);
      },
    });
  });
};

const userSearchFilter = () => {
  usersFilterInputEl.on("keyup", function () {
    const filter = $(this).val().toLowerCase();
    userPermissions.forEach((user) => {
      const row = $(`#user-permission-row-${user.userId}`);
      const name = user.userName.toLowerCase();
      if (name.includes(filter)) row.show();
      else row.hide();
    });
  });
};

const fetchPermissions = async () => {
  const response = await RequestHandler({ method: "GET", url: `/vaultPermissions/userpermissions/${permissionsModel.id}?lastId=${lastPermissionnsId}` });
  return response?.data;
};

const updateRestrictions = async (viewRestriction, editRestriction) => {
  if (permissionsLoading) return setTimeout(() => updateRestrictions(viewRestriction, editRestriction), 1000);
  const curPermissions = { ...permissionsModel };
  viewRestriction ? (curPermissions.isViewRestricted = viewRestriction) : (curPermissions.isEditRestricted = editRestriction);

  permissionsLoading = true;
  const response = await RequestHandler({
    method: "PUT",
    url: "/vaultPermissions/UpdateRestrictions",
    body: curPermissions,
  });
  permissionsLoading = false;
  if (!response.success) {
    DisplayToast({ message: "Failed to update Restrictions", type: "danger" });
  } else {
    permissionsModel = curPermissions;
  }
  return response;
};

const setUserRoles = async (role, userId) => {
  if (permissionsLoading) return setTimeout(() => setUserRoles(role, userId), 1000);
  const response = await RequestHandler({
    method: "PUT",
    url: "/vaultPermissions/UpdateUserPermissions",
    body: { role, userId: parseInt(userId), vaultItemId: permissionsModel.id },
  });
  if (!response.success) return DisplayToast({ message: response?.message || "Failed to update user role", type: "danger" });
  currentButtonEl.text(`Role : ${role}`);
};

const addUserPermission = async () => {
  const response = await RequestHandler({
    method: "POST",
    url: "/vaultPermissions/AddPermission",
    body: { vaultItemId: permissionsModel.id, userId: currentUser.id, role: currentUser.role },
  });
  if (!response.success) return DisplayToast({ message: response?.message || "Failed to add user permission", type: "danger" });
  const permissionRow = formatPermissionRow({ userId: currentUser.id, userName: currentUser.name, role: currentUser.role, id: response.id });
  permissionsTableBodyEl.append(permissionRow);
  userPermissions.push(permissionRow);
  setRowPermissionListeners();
  CloseModal();
  DisplayToast({ message: "User permission added", type: "success" });
};

const removeUserPermission = async (userId) => {
  const response = await RequestHandler({
    method: "DELETE",
    url: `/vaultPermissions/RemovePermission`,
    body: { vaultItemId: permissionsModel.id, userId },
  });
  if (!response.success) return DisplayToast({ message: response?.message || "Failed to remove user permission", type: "danger" });
  $(`#user-permission-row-${userId}`).remove();
  CloseModal();
  DisplayToast({ message: "User permission removed", type: "success" });
};
