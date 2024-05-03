(() => {
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
})();

const addRootFolder = async () => {
  const FolderName = $("#folderName").val();
  if (!FolderName) return;
  const request = await RequestHandler({ url: "/vault/addrootfolder", method: "POST", body: { FolderName } });
  if (request.success) {
    CloseModal();

    $(".vault-folder-list").append(` <div id="root-folder-${request.id}" class="vault-root-folder">${FolderName}</div>`);

    //remove event listener for folder click first and then add it again with the new folder
    $(".vault-root-folder").off("click");
    OnRootFolderClick();
  } else {
    alert("An error occured");
  }
};
