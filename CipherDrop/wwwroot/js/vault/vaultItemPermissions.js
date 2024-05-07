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
  if (!ItemContent[CurrentTabIndex].CurrentItem) return DisplayToast({ message: "Please select an item to view permissions", type: "danger" });

  permissionsModel = {
    id: ItemContent[CurrentTabIndex].CurrentItem.id,
    folderId: ItemContent[CurrentTabIndex].CurrentItem.folderId,
    rootFolderId: ItemContent[CurrentTabIndex].CurrentItem.rootFolderId,
    isViewRestricted: ItemContent[CurrentTabIndex].CurrentItem.isViewRestricted,
    isEditRestricted: ItemContent[CurrentTabIndex].CurrentItem.isEditRestricted,
    isDeleteRestricted: ItemContent[CurrentTabIndex].CurrentItem.isDeleteRestricted,
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
