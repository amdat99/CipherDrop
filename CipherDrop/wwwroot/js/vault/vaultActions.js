$("#addRootFolder").on("click", function () {
  DisplayModal({
    content: `
        <div class="mb-3">
          <label for="folderName" class="form-label">Folder Name</label>
          <input type="text" class="form-control" id="folderName" name="folderName" required>
        </div>
    `,
    buttonText: "Add Folder",
    submitFunction: addRootFolder,
  });
});

// Add add default item handler
VaultAddItemBtn.off("click");
VaultAddItemBtn.on("click", function () {
  if (!ItemContent[CurrentTabIndex].CurrentFolderId) return DisplayToast({ message: "Please select a folder to add item to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="fileReference" class="form-label">Item name</label>
        <input type="text" class="form-control" id="fileReference" name="fileReference" required>
      </div>
      `,
    buttonText: "Add Item",
    submitFunction: () => AddItem(ItemContent[CurrentTabIndex].CurrentFolderId),
  });
});

//Add add subfolder handler
VaultAddSubFolderBtn.off("click");
VaultAddSubFolderBtn.on("click", function () {
  if (!ItemContent[CurrentTabIndex].CurrentFolderId) return DisplayToast({ message: "Please select a folder to add subfolder to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="folderName" class="form-label">Folder Name</label>
        <input type="text" class="form-control" id="subfolderName" name="folderName" required>
      </div>
      `,
    buttonText: "Add Sub Folder",
    submitFunction: () => AddSubfolder(ItemContent[CurrentTabIndex].CurrentFolderId),
  });
});

$("#tab-add-item").on("click", function () {
  const id = Math.random();
  const newFileList = $(`<div id="vault-file-list-${id}"></div>`);
  ItemContent.push({ Id: Math.random(), ListEl: newFileList, CurrentItem: null, CurrentFolderId: 0, LastId: 0, CurrentSubFolderId: 0 });
  VaultFileList.append(newFileList);

  CurrentTabIndex = ItemContent.length - 1;
});

const addRootFolder = async () => {
  const FolderName = $("#folderName").val();
  if (!FolderName) return;
  const request = await RequestHandler({ url: "/vault/addrootfolder", method: "POST", body: { FolderName } });
  if (request.success) {
    CloseModal();

    VaultFolderList.append(` <div id="root-folder-${request.id}" class="vault-root-folder card-offset-hover card-offset">📁 ${FolderName}</div>`);

    //remove event listener for folder click first and then add it again with the new folder
    $(".vault-root-folder").off("click");
    OnRootFolderClick();
    DisplayToast({ message: "Folder added successfully", type: "success" });
  } else {
    DisplayToast({ message: request?.message || "An error occured", type: "danger" });
  }
};
