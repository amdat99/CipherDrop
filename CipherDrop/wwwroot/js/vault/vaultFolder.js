const rootFolderSearchEl = $("#root-folder-search");
let isFolder = true;
let rootFolderScrolllTimeout = null;
let rootFolderSearchTimeout = null;
let noMoreFolders = false;
let folderLoading = false;

VaultFolderList.on("scroll", function () {
  //Check if folders are more than 40 and if the user has scrolled to the bottom
  rootFolderScrolllTimeout && clearTimeout(rootFolderScrolllTimeout);
  rootFolderScrolllTimeout = setTimeout(async () => {
    if (shouldLoadMoreItems(this)) {
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
        foldersHtml += formatFolders(folder);
      });
      VaultFolderList.append(foldersHtml);

      OnRootFolderClick();
    }
  }, 100);

  const shouldLoadMoreItems = (listEl) => {
    return (
      listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 30 &&
      ItemContent[CurrentTabIndex].Items.length > 40 &&
      !ItemContent[CurrentTabIndex].NoMoreItems
    );
  };
});

//Search for folders
rootFolderSearchEl.on("input", (e) => {
  const searchTerm = e.target.value;
  clearTimeout(rootFolderSearchTimeout);
  rootFolderSearchTimeout = setTimeout(async () => {
    const folders = await RequestHandler({ url: `/vault/foldersSearch?query=${searchTerm}&isRoot=true`, method: "GET" });
    if (!folders?.data) return;
    //Set the queried folder and listeners
    let foldersHtml = "";
    folders.data.forEach((folder) => {
      foldersHtml += formatFolders(folder);
    });
    VaultFolderList.html(foldersHtml);
    $(".vault-root-folder").off("click");
    OnRootFolderClick();
  }, 350);
});

const formatFolders = (folder) => {
  return `<div id="root-folder-${folder.id}" class="vault-root-folder card-offset card-offset-hover ">
      📁${folder.reference}
    </div>`;
};

const OnRootFolderClick = () => {
  $(".vault-root-folder")
    .off("click")
    .on("click", function (e) {
      const folderId = this.id.split("-")[2];
      showListViwer();
      //Check if the folder is already selected if not set items for the folder
      if (!ItemContent[CurrentTabIndex].CurrentSubFolderId && ItemContent[CurrentTabIndex].CurrentFolderId === folderId) {
        ItemContent[CurrentTabIndex].TabName = this.innerText;
        return VaultCurrentTab.html(CurrentFolder.innerText);
      }
      ItemContent[CurrentTabIndex].CurrentFolderId = folderId;
      ItemContent[CurrentTabIndex].CurrentSubFolderId = null;
      //Change style of selected folder and set new current folder
      setCurrentFolder(this);
      //Set folder path and and add listener to folder name in path
      SetFilePath(folderId, this.innerHTML.split("<span>")[1].split("</span>")[0]);
      //fetch folder items and render them if any
      SetItems(folderId);
      //Add id to url
      window.history.pushState(null, null, `/vault/home/${folderId}`);
    });
};
//Run the function on load
OnRootFolderClick();

//Check query params and set folder items if query param is present
(async () => {
  const url = new URL(window.location.href);
  const lastParam = url.pathname.split("/").pop();

  if (lastParam === "home") return;
  const folderId = lastParam;
  ItemContent[CurrentTabIndex].CurrentFolderId = folderId;

  if ((await SetItems(folderId)) === false) return;
  //Check current folder and set path
  const folder = document.getElementById(`root-folder-${folderId}`);
  if (folder) {
    setCurrentFolder(folder);
    SetFilePath(folderId, folder.innerText.replace("⬇️", ""));
  }
})();

const setCurrentFolder = (folder) => {
  CurrentFolder && (CurrentFolder.style = "");
  folder.style = "background-color: var(--secondary-color); border : 1px solid var(--primary-color);";
  CurrentFolder = folder;
};

const showListViwer = () => {
  VaultFileViewer.hide();
  tinymce.activeEditor.show();
  ItemContent[CurrentTabIndex].ListEl.show();

  if (VaultItemPemrmissions.is(":visible")) {
    VaultItemPemrmissions.hide();
    tinymce.activeEditor.show();
  }
};
