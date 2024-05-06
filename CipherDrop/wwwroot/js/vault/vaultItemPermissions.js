let permissionsModel = {
  id: 0,
  folderId: 0,
  rootFolderId: 0,
  isViewRestricted: false,
  isEditRestricted: false,
  isDeleteRestricted: true,
  isShareRestricted: true,
};

$("#permissions-btn").on("click", function () {
  if (!CurrentItem) return DisplayToast({ message: "Please select an item to view permissions", type: "danger" });

  permissionsModel = {
    id: CurrentItem.id,
    folderId: CurrentItem.folderId,
    rootFolderId: CurrentItem.rootFolderId,
    isViewRestricted: CurrentItem.isViewRestricted,
    isEditRestricted: CurrentItem.isEditRestricted,
    isDeleteRestricted: CurrentItem.isDeleteRestricted,
    isShareRestricted: CurrentItem.isShareRestricted,
  };

  VaultItemPemrmissions.show();
  VaultFileViewer.hide();
});

$("#close-permissions").on("click", function () {
  VaultItemPemrmissions.hide();
  VaultFileViewer.show();
});

$("#user-permissions-add-user").on("click", () => {
  DisplayModal({
    buttonText: "Add user",
    content: "",
  });
});
