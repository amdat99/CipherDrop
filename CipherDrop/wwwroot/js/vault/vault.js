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
      ItemContent[CurrentTabIndex].LastId = lastFolder.id.split("-")[2];

      folderLoading = true;
      const folders = await RequestHandler({ url: `/vault/rootfolders?lastId=${ItemContent[CurrentTabIndex].LastId}`, method: "GET" });
      folderLoading = false;
      if (!folders?.data) return;
      else if (folders.data.length === 0) return (noMoreFolders = true);

      let foldersHtml = "";
      folders.data.forEach((folder) => {
        foldersHtml += `<div id="root-folder-${folder.id}" class="vault-root-folder card-offset-hover card-offset">📁 ${folder.reference}</div>`;
      });
      VaultFolderList.append(foldersHtml);

      $(".vault-root-folder").off("click");
      OnRootFolderClick();
    }
  }, 100);
});

const OnRootFolderClick = () => {
  $(".vault-root-folder").on("click", function (e) {
    const folderId = this.id.split("-")[2];
    showListViwer();
    //Check if the folder is already selected if not set items for the folder
    if (ItemContent[CurrentTabIndex].CurrentFolderId === folderId) return VaultCurrentTab.html(CurrentFolder.innerText);
    ItemContent[CurrentTabIndex].CurrentFolderId = folderId;

    //Change style of selected folder
    CurrentFolder && (CurrentFolder.style = "");
    this.style = "background-color: var(--secondary-color); border : 1px solid var(--primary-color);";
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

const setFilePath = (folderId, text) => {
  VaultFilePath.html(
    `<a id="vault-folder-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${text}</a> <span class="mt-5">›</span>`
  );
  VaultCurrentTab.html(text);

  $(".file-path-item").off("click");
  $(".file-path-item").on("click", function (e) {
    e.preventDefault();
    const folderId = this.id.split("-")[2];
    showListViwer();

    //Check if the folder is already selected if not set items for the folder. Pass true to remove old event listener
    if (ItemContent[CurrentTabIndex].CurrentFolderId === folderId) return;
    setItems(folderId, true);
  });
};

const setItems = async (folderId, removeItemEListener = false) => {
  const items = await FetchFolderItems(folderId);
  if (!items) return false;

  if (ItemContent[CurrentTabIndex].LastId === 0) ItemContent[CurrentTabIndex].ListEl.empty();

  let currentitems = "";
  const adminsettings = AdminSettings || (await FetchAdminSettings());
  if (!adminsettings) return false;

  const token = Token || sessionStorage.getItem("Token");

  items.forEach((item) => {
    currentitems += `<div id="vaultitem-${item.id}" class="vault-item card-offset card-offset-hover p-3"><span>${
      item.isFolder ? "📁" : "📄"
    } ${CryptoJS.AES.decrypt(item.reference, token + adminsettings.keyEnd).toString(CryptoJS.enc.Utf8)}</span><span>${new Date(
      item.updatedAt
    ).toLocaleDateString()}</span></div>`;
  });

  ItemContent[CurrentTabIndex].ListEl.append(currentitems);

  ItemContent[CurrentTabIndex].CurrentItem = null;
  ItemContent[CurrentTabIndex].Items = items;

  OnItemClick(removeItemEListener);
  return true;
};

//Check query params and set folder items if query param is present
(async () => {
  const url = new URL(window.location.href);
  const lastParam = url.pathname.split("/").pop();

  if (lastParam === "home") return;
  const folderId = lastParam;
  ItemContent[CurrentTabIndex].CurrentFolderId = folderId;

  if ((await setItems(folderId)) === false) return;

  //Ckeck current folder and set path
  const folder = document.getElementById(`root-folder-${folderId}`);
  if (folder) {
    CurrentFolder && (CurrentFolder.style = "");
    folder.style = "background-color: var(--secondary-color); border : 1px solid var(--primary-color);";
    CurrentFolder = folder;
    setFilePath(folderId, folder.innerText);
  }
})();

const showListViwer = () => {
  VaultFileViewer.hide();
  tinymce.activeEditor.show();
  ItemContent[CurrentTabIndex].ListEl.show();
  if (VaultItemPemrmissions.is(":visible")) {
    VaultItemPemrmissions.hide();
    tinymce.activeEditor.show();
  }
};
