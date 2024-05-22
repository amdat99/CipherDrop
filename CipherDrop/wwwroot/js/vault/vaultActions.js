$("#addRootFolder").on("click", function () {
  DisplayModal({
    content: `
        <div class="mb-3">
          <label for="folderName" class="form-label">Folder Name</label>
          <input type="text" class="form-control" id="folderName" name="folderName" required>
        </div>
    `,
    buttonText: "Add Folder",
    submitFunction: AddRootFolder,
  });
});

// Add add default item handler
VaultAddItemBtn.off("click").on("click", function () {
  if (!ItemContent[CurrentTabIndex].CurrentFolderId) return DisplayToast({ message: "Please select a folder to add item to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="fileReference" class="form-label">Item name</label>
        <input type="text" class="form-control" id="fileReference" name="fileReference" required>
      </div>
      `,
    buttonText: "Add Item",
    submitFunction: () => AddItem(ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentFolderId),
  });
});

//Add add subfolder handler
VaultAddSubFolderBtn.off("click").on("click", function () {
  if (!ItemContent[CurrentTabIndex].CurrentFolderId) return DisplayToast({ message: "Please select a folder to add subfolder to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="folderName" class="form-label">Subfolder Name</label>
        <input type="text" class="form-control" id="fileReference" name="folderName" required>
      </div>
      `,
    buttonText: "Add Sub Folder",
    submitFunction: () => AddItem(ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentFolderId, true),
  });
});

DeleteItemButtonEl.off("click").on("click", async function () {
  if (!ItemContent[CurrentTabIndex].CurrentItem) return DisplayToast({ message: "Please select an item to delete", type: "danger" });
  DisplayModal({
    content: "Are you sure you want to delete this item?",
    buttonText: "Delete",
    buttonStyle: "background-color: var(--danger-color); border-color: var(--danger-color);",
    submitFunction: DeleteItem,
  });
});
