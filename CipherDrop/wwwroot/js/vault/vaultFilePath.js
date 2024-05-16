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
const SetFilePath = (folderId, text, options) => {
  formatFilePath(folderId, text, options);
  SetFilePathListeners();
};

const SetFilePathListeners = () => {
  $(".file-path-item").off("click");
  $(".file-path-item").on("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    const folderId = this.id.split("-")[1];

    showListViwer();

    //Check if the folder is already selected if not set items for the folder. Pass true to remove old event listener
    if (ItemContent[CurrentTabIndex].CurrentSubFolderId && ItemContent[CurrentTabIndex].CurrentSubFolderId == folderId) return;
    else if (!ItemContent[CurrentTabIndex].CurrentSubFolderId && ItemContent[CurrentTabIndex].CurrentFolderId == folderId) return;

    //If click is from root file tree
    if (this.dataset?.Rootfolder) {
      const folderPath = GetFolderPath(this);
      if (!folderPath || folderPath.length === 0) return;
      //Set the subfolder items
      SetItems(this.dataset?.Subfolder, true);
      //Set the folder path for the item and item parents
      OnSetFileTreeSubItem(folderPath, this.dataset?.Subfolder);
    } else {
      onSetItemAterClick(this.id, folderId, e);
    }
  });
};

const formatFilePath = (folderId, text, options) => {
  let html =
    options?.customHtml ||
    `<a id="vault${
      options?.isSubFolder ? "subfolder" : "folder"
    }-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${text}</a> <span class="position-relative" style="top: 5px;">›</span>`;

  switch (true) {
    case !!options?.append:
      VaultFilePath.append(html);
      ItemContent[CurrentTabIndex].PathArray.push({ folderId, text });
      break;
    case !!options?.removeAfter:
      $(`#vaultsubfolder-${folderId}`).nextAll().remove();
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

//Set the folder path on click of the folder name in the path
const onSetItemAterClick = (id, folderId, e) => {
  if (id.startsWith("vaultfolder")) {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = null;
    SetFilePath(folderId, e.target.innerText.replace("⬇️", ""));
  } else {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = folderId;
    SetFilePath(folderId, e.target.innerText, { removeAfter: true, isSubFolder: true });
  }
  SetItems(folderId, true);
};

//Set the folder path on click of the folder name in the path
const OnSetFileTreeSubItem = (folderPath, subFolderId) => {
  VaultFilePath.html("");
  ItemContent[CurrentTabIndex].PathArray = [];
  if (folderPath.length === 1) {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = null;
    ItemContent[CurrentTabIndex].CurrentFolderId = folderPath[0].folderId;
  } else {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = subFolderId;
  }
  folderPath.forEach((path, index) => {
    SetFilePath(path.folderId, path.reference, { append: true, isSubFolder: index > 0 ? true : false });
  });

  CurrentFolder && (CurrentFolder.style = "");
  const rootFolder = document.getElementById(`root-folder-${folderPath[0].folderId}`);
  rootFolder.style = "background-color: var(--secondary-color); border : 1px solid var(--primary-color);";
  CurrentFolder = rootFolder;
};
