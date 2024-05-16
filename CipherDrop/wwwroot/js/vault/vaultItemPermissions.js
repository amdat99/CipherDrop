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

//Set permissions button l
PermissionsButtonEl.on("click", async () => {
  const currentTab = ItemContent[CurrentTabIndex];
  if (!currentTab.CurrentItem) {
    DisplayToast({ message: "Please select an item to view permissions", type: "danger" });
    return;
  }

  lastPermissionnsId = 0;
  //assign permissions model for the current item
  permissionsModel = {
    id: currentTab.CurrentItem.id,
    folderId: currentTab.CurrentItem.folderId,
    rootFolderId: currentTab.CurrentItem.rootFolderId,
    isViewRestricted: currentTab.CurrentItem.isViewRestricted,
    isEditRestricted: currentTab.CurrentItem.isEditRestricted,
  };

  //Fetch permissions and also check if the user has permissions to view the permissions
  const permissions = await fetchPermissions();
  if (!permissions) {
    DisplayToast({ message: "Failed to fetch permissions", type: "danger" });
    return;
  }

  userPermissions = permissions;
  togglePermissionsVisibility();

  //Set permissions table and update listeners
  setPermissions(permissions, true);
  updatePermissionInputs(currentTab);
  //Set fitst time initialization options if it is the first time viewing permissions
  handleFirstSetInitialization();
});

const togglePermissionsVisibility = () => {
  if (VaultItemPemrmissions.is(":visible")) {
    tinymce.activeEditor.show();
    VaultItemPemrmissions.hide();
  } else {
    VaultItemPemrmissions.show();
    tinymce.activeEditor.hide();
  }
};

const updatePermissionInputs = (currentTab) => {
  if (!editRestrictionInputEl) editRestrictionInputEl = $("#IsEditRestricted");
  if (!viewRestrictionInputEl) viewRestrictionInputEl = $("#IsViewRestricted");
  if (!usersFilterInputEl) usersFilterInputEl = $("#user-permissions-search-input");

  editRestrictionInputEl.prop("checked", currentTab.CurrentItem.isEditRestricted);
  viewRestrictionInputEl.prop("checked", currentTab.CurrentItem.isViewRestricted);
};

const handleFirstSetInitialization = () => {
  if (!firstSet) return;
  firstSet = false;
  OnFirstInitSet();
};

const setPermissions = (permissions, reset = false) => {
  if (!permissionsTableBodyEl) permissionsTableBodyEl = $("#user-permissions-table-body");

  let permissionsHtml = "";
  permissions.forEach((permission) => {
    permissionsHtml += formatPermissionRow(permission);
  });

  if (reset) permissionsTableBodyEl.html(permissionsHtml);
  else permissionsTableBodyEl.append(permissionsHtml);
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

  //Set listeners for the permissions table
  setRowPermissionListeners();
  userSearchFilter();
};

const setRowPermissionListeners = () => {
  //Set listeners for the permission dropdown
  $(".permission-dropdown-btn")
    .off("click")
    .on("click", function () {
      currentRole = $(this).text().split(":")[1].trim();
      currentButtonEl = $(this);
    });

  //Set listeners for the role buttons
  $(".permission-role-btn")
    .off("click")
    .on("click", function () {
      const userId = $(this).attr("id").split("-")[2];
      const role = $(this).text().split("-")[0].trim();
      if (role === currentRole) return;
      setUserRoles(role, userId);
    });

  //Set listeners for the remove permission button
  $(".remove-user-permission")
    .off("click")
    .on("click", function () {
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
