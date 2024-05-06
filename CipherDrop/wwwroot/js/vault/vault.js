let isFolder = true;
let scrolllTimeout = null;
let noMoreFolders = false;
let folderLoading = false;

VaultFolderList.on("scroll", function () {
  //Check if folders are more than 40 and if the user has scrolled to the bottom
  scrolllTimeout && clearTimeout(scrolllTimeout);
  scrolllTimeout = setTimeout(async () => {
    if (!noMoreFolders && !folderLoading && this.scrollTop + this.clientHeight >= this.scrollHeight - 30 && VaultFolderList.children().length > 40) {
      //get the last folder id
      const lastFolder = $(".vault-root-folder").last()[0];
      if (!lastFolder) return;
      LastId = lastFolder.id.split("-")[2];

      folderLoading = true;
      const folders = await RequestHandler({ url: `/vault/rootfolders?lastId=${LastId}`, method: "GET" });
      folderLoading = false;
      if (!folders?.data) return;
      else if (folders.data.length === 0) return (noMoreFolders = true);

      folders.data.forEach((folder) => {
        VaultFolderList.append(`<div id="root-folder-${folder.id}" class="vault-root-folder">${folder.reference}</div>`);
      });

      $(".vault-root-folder").off("click");
      OnRootFolderClick();
    }
  }, 100);
});

const setFilePath = (folderId, text) => {
  VaultFilePath.html(`<a id="vault-folder-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${text}</a>`);
  VaultCurrentTab.html(text);

  $(".file-path-item").off("click");
  $(".file-path-item").on("click", function (e) {
    e.preventDefault();
    const folderId = this.id.split("-")[2];
    showListViwer();

    //Check if the folder is already selected if not set items for the folder. Pass true to remove old event listener
    if (window.currentFolderId === folderId) return;
    setItems(folderId, true);
  });
};

const OnRootFolderClick = () => {
  $(".vault-root-folder").on("click", function (e) {
    const folderId = this.id.split("-")[2];
    showListViwer();
    //Check if the folder is already selected if not set items for the folder
    if (window?.currentFolderId === folderId) return VaultCurrentTab.html(CurrentFolder.innerText);
    window.currentFolderId = folderId;

    //Change style of selected folder
    CurrentFolder && (CurrentFolder.style = "");
    this.style = "background-color: #343a40; border : 1px solid var(--primary-color);";
    CurrentFolder = e.target;

    //Set folder path and and add listener to folder name in path
    setFilePath(folderId, this.innerText);

    //fetch folder items and render them if any
    setItems(folderId);

    //Add id to url
    window.history.pushState(null, null, `/vault/home/${folderId}`);
  });
};
//Run the function on load
OnRootFolderClick();

const setItems = async (folderId, removeItemEListener = false) => {
  const items = await FetchFolderItems(folderId);
  if (!items) return false;

  if (LastId === 0) VaultFileList.empty();

  items.forEach((item) => {
    VaultFileList.append(
      `<div id="item-${item.id}" class="vault-item p-3"><span>${item.isFolder ? "📁" : "📄"} ${item.reference}</span><span >${new Date(
        item.updatedAt
      ).toLocaleDateString()}</span></div>`
    );
  });

  OnItemClick(removeItemEListener);
  return true;
};

//Check query params and set folder items if query param is present
(async () => {
  const url = new URL(window.location.href);
  const lastParam = url.pathname.split("/").pop();

  if (lastParam === "home") return;
  const folderId = lastParam;
  window.currentFolderId = folderId;

  if ((await setItems(folderId)) === false) return;

  //Ckeck current folder and set path
  const folder = document.getElementById(`root-folder-${folderId}`);
  if (folder) {
    CurrentFolder && (CurrentFolder.style = "");
    folder.style = "background-color: #343a40; border : 1px solid var(--primary-color);";
    CurrentFolder = folder;
    setFilePath(folderId, folder.innerText);
  }
})();

const showListViwer = () => {
  VaultFileViewer.hide();
  VaultItemPemrmissions.hide();
  VaultFileList.show();
};
