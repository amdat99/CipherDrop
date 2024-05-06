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
  if (!window.currentFolderId) return DisplayToast({ message: "Please select a folder to add item to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="fileReference" class="form-label">Item name</label>
        <input type="text" class="form-control" id="fileReference" name="fileReference" required>
      </div>
      `,
    buttonText: "Add Item",
    submitFunction: () => AddItem(window.currentFolderId),
  });
});

//Add add subfolder handler
VaultAddSubFolderBtn.off("click");
VaultAddSubFolderBtn.on("click", function () {
  if (!window.currentFolderId) return DisplayToast({ message: "Please select a folder to add subfolder to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="folderName" class="form-label">Folder Name</label>
        <input type="text" class="form-control" id="subfolderName" name="folderName" required>
      </div>
      `,
    buttonText: "Add Sub Folder",
    submitFunction: () => AddSubfolder(window.currentFolderId),
  });
});

const addRootFolder = async () => {
  const FolderName = $("#folderName").val();
  if (!FolderName) return;
  const request = await RequestHandler({ url: "/vault/addrootfolder", method: "POST", body: { FolderName } });
  if (request.success) {
    CloseModal();

    VaultFolderList.append(` <div id="root-folder-${request.id}" class="vault-root-folder">${FolderName}</div>`);

    //remove event listener for folder click first and then add it again with the new folder
    $(".vault-root-folder").off("click");
    OnRootFolderClick();
    DisplayToast({ message: "Folder added successfully", type: "success" });
  } else {
    DisplayToast({ message: request?.message || "An error occured", type: "danger" });
  }
};
