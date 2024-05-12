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
        foldersHtml += formatFolders(folder);
      });
      VaultFolderList.append(foldersHtml);

      $(".vault-root-folder").off("click");
      OnRootFolderClick();
    }
  }, 100);
});

rootFolderSearchEl.on("input", (e) => {
  const searchTerm = e.target.value;
  clearTimeout(rootFolderSearchTimeout);
  rootFolderSearchTimeout = setTimeout(async () => {
    const folders = await RequestHandler({ url: `/vault/foldersSearch?query=${searchTerm}&isRoot=true`, method: "GET" });
    if (!folders?.data) return;
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
  $(".vault-root-folder").on("click", function (e) {
    const folderId = this.id.split("-")[2];
    showListViwer();
    //Check if the folder is already selected if not set items for the folder
    if (!ItemContent[CurrentTabIndex].CurrentSubFolderId && ItemContent[CurrentTabIndex].CurrentFolderId === folderId) {
      ItemContent[CurrentTabIndex].TabName = this.innerText;
      return VaultCurrentTab.html(CurrentFolder.innerText);
    }
    ItemContent[CurrentTabIndex].CurrentFolderId = folderId;
    ItemContent[CurrentTabIndex].CurrentSubFolderId = null;
    //Change style of selected folder
    CurrentFolder && (CurrentFolder.style = "");
    this.style = "background-color: var(--secondary-color); border : 1px solid var(--primary-color);";
    CurrentFolder = e.target;
    //Set folder path and and add listener to folder name in path
    setFilePath(folderId, this.innerText);
    //fetch folder items and render them if any
    SetItems(folderId);
    //Add id to url
    window.history.pushState(null, null, `/vault/home/${folderId}`);
  });
};
//Run the function on load
OnRootFolderClick();

/**
 *
 * @param {number} folderId
 * @param {string} text
 * @param {object} options
 * [options] - [append] : boolean
 * [options] - [removeAfter] : boolean
 * [options] - [isSubFolder] : boolean
 * [options] - [customHtml] : string
 * [options] - [reset] : boolean
 *
 * @returns
 */
const setFilePath = (folderId, text, options) => {
  formatFilePath(folderId, text, options);
  $(".file-path-item").off("click");
  $(".file-path-item").on("click", function (e) {
    e.preventDefault();
    const folderId = this.id.split("-")[2];
    showListViwer();

    //Check if the folder is already selected if not set items for the folder. Pass true to remove old event listener
    if (ItemContent[CurrentTabIndex].CurrentSubFolderId && ItemContent[CurrentTabIndex].CurrentSubFolderId == folderId) return;
    else if (!ItemContent[CurrentTabIndex].CurrentSubFolderId && ItemContent[CurrentTabIndex].CurrentFolderId == folderId) return;

    onSetItemAterClick(this.id, folderId, e);
  });
};

const formatFilePath = (folderId, text, options) => {
  let html =
    options?.customHtml ||
    `<a id="vault-${
      options?.isSubFolder ? "subfolder" : "folder"
    }-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${text}</a> <span class="mt-5">›</span>`;

  switch (true) {
    case !!options?.append:
      VaultFilePath.append(html);
      ItemContent[CurrentTabIndex].PathArray.push({ folderId, text });
      break;
    case !!options?.removeAfter:
      $(`#vault-subfolder-${folderId}`).nextAll().remove();
      const index = ItemContent[CurrentTabIndex].PathArray.findIndex((x) => x.folderId === folderId);
      ItemContent[CurrentTabIndex].PathArray = ItemContent[CurrentTabIndex].PathArray.slice(0, index + 1);
      break;
    case !!options?.reset:
      VaultFilePath.html(html);
      break;
    default:
      VaultFilePath.html(html);
      ItemContent[CurrentTabIndex].PathArray = [{ folderId, text }];
      break;
  }

  if (text) {
    VaultCurrentTab.html(text);
    ItemContent[CurrentTabIndex].TabName = text;
  }
};

const onSetItemAterClick = (id, folderId, e) => {
  if (id.startsWith("vault-folder")) {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = null;
    setFilePath(folderId, e.target.innerText);
  } else {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = folderId;
    setFilePath(folderId, e.target.innerText, { removeAfter: true, isSubFolder: true });
  }
  SetItems(folderId, true);
};

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
