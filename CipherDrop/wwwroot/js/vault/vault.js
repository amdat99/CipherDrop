let currentFolder = null;
let isFolder = true;
let lastId = 0;
let scrolllTimeout = null;
let noMoreFolders = false;
let folderLoading = false;

(() => {
  VaultFolderList.on("scroll", function () {
    console.log("scroll");
    //Check if folders are more than 40 and if the user has scrolled to the bottom
    if (!noMoreFolders && !folderLoading && this.scrollTop + this.clientHeight >= this.scrollHeight - 30 && VaultFolderList.children().length > 40) {
      scrolllTimeout && clearTimeout(scrolllTimeout);
      scrolllTimeout = setTimeout(async () => {
        //get the last folder id
        const lastFolder = $(".vault-root-folder").last()[0];
        if (!lastFolder) return;
        lastId = lastFolder.id.split("-")[2];

        folderLoading = true;
        const folders = await RequestHandler({ url: `/vault/rootfolders?lastId=${lastId}`, method: "GET" });
        folderLoading = false;
        if (!folders?.data) return;
        else if (folders.data.length === 0) return (noMoreFolders = true);

        folders.data.forEach((folder) => {
          VaultFolderList.append(`<div id="root-folder-${folder.id}" class="vault-root-folder">${folder.reference}</div>`);
        });

        $(".vault-root-folder").off("click");
        OnRootFolderClick();
      }, 100);
    }
  });
})();

(() => {
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
  VaultAddSubFolderBtn.off("click");
  VaultAddSubFolderBtn.on("click", function () {
    if (!window.currentFolderId) return DisplayToast({ message: "Please select a folder to add subfolder to", type: "danger" });
    DisplayModal({
      content: `
      <div class="mb-3">
        <label for="folderName" class="form-label">Folder Name</label>
        <input type="text" class="form-control" id="folderName" name="folderName" required>
      </div>
      `,
      buttonText: "Add Sub Folder",
      submitFunction: () => AddSubfolder(window.currentFolderId),
    });
  });
})();

const OnRootFolderClick = () => {
  $(".vault-root-folder").on("click", function (e) {
    const folderId = this.id.split("-")[2];
    showListViwer();
    //Check if the folder is already selected if not set items for the folder
    if (window?.currentFolderId === folderId) return;
    window.currentFolderId = folderId;

    //Change style of selected folder
    currentFolder && (currentFolder.style = "");
    this.style = "background-color: #343a40; border : 1px solid var(--primary-color);";
    currentFolder = e.target;

    //Set folder path and and add listener to folder name in path
    $("#file-path").html(`<a id="vault-folder-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${this.innerText}</a>`);

    $(".file-path-item").off("click");
    $(".file-path-item").on("click", function (e) {
      e.preventDefault();
      const folderId = this.id.split("-")[2];
      showListViwer();

      //Check if the folder is already selected if not set items for the folder. Pass true to remove old event listener
      if (window.currentFolderId === folderId) return;
      setItems(folderId, true);
    });

    //fetch folder items and render them if any
    setItems(folderId);

    //Add id to url
    window.history.pushState(null, null, `/vault/home/${folderId}`);
  });
};
//Run the function on load
OnRootFolderClick();

const setItems = async (folderId, removeItemEListener = false) => {
  const items = await fetchFolderItems(folderId);
  if (!items) return;

  if (lastId === 0) VaultFileList.empty();

  items.forEach((item) => {
    VaultFileList.append(
      `<div id="item-${item.id}" class="vault-item p-3"><span>${item.isFolder ? "📁" : "📄"} ${item.reference}</span><span >${new Date(
        item.updatedAt
      ).toLocaleDateString()}</span></div>`
    );
  });

  OnItemClick(removeItemEListener);
};

const fetchFolderItems = async (folderId, reset = true) => {
  try {
    if (reset) lastId = 0;
    const request = await RequestHandler({ url: `/vault/vaultitems/${folderId}?llastId=${lastId}`, method: "GET" });
    if (request.success) {
      return request?.data || [];
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const checkQueryForFolder = async () => {
  const url = new URL(window.location.href);
  const lastParam = url.pathname.split("/").pop();
  if (lastParam === "home") return;
  const folderId = lastParam;

  const folder = await fetchFolderItems(folderId);
  if (!folder) return;
  isFolder = folder[0].isFolder;

  setItems(folderId);
};

const showListViwer = () => {
  VaultFileViewer.hide();
  VaultFileList.show();
};
