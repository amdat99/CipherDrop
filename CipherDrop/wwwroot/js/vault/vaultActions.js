document.addEventListener("DOMContentLoaded", function () {
  displayAddRootolderModal();
});

const displayAddRootolderModal = () => {
  $("#addRootFolder").on("click", function () {
    DisplayModal(
      `
        <div class="mb-3">
          <label for="folderName" class="form-label">Folder Name</label>
          <input type="text" class="form-control" id="folderName" name="folderName" required>
        </div>
        <div class="d-grid mt-4">
          <button type="button" id="addRootFolderBtn" class="btn btn-primary btn-block">Add Folder</button>
        </div>
    `
    );

    setTimeout(() => {
      addRootFolder();
    }, 0);
  });
};

const addRootFolder = async () => {
  $("#addRootFolderBtn").on("click", async function (e) {
    const FolderName = document.getElementById("folderName").value;
    if (!FolderName) return;
    const request = await RequestHandler({ url: "/vault/addrootfolder", method: "POST", body: { FolderName } });
    if (request.success) {
      CloseModal();

      $(".vault-folder-list").append(` <div id="root-folder-${request.id}" class="vault-root-folder">${FolderName}</div>`);
    } else {
      alert("An error occured");
    }
  });
};
