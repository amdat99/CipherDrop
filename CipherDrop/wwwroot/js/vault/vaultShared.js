//Shared elements
const VaultFileList = $("#vault-file-list");
const VaultFileViewer = $("#file-viewer");
const VaultFolderList = $(".vault-folder-list");
const VaultFolderActions = $("#vault-folder-actions");
const VaultAddItemBtn = $("#add-default-item");
const VaultAddSubFolderBtn = $("#add-sub-folder");
const VaultFilePath = $("#file-path");
const VaultItemPemrmissions = $("#item-permissions");

let VaultCurrentTab = $("#tab-link-0");

//Shared vars
let CurrentTabIndex = 0;
let CurrentFolder = null;
let CurrentItem = null;
let LastId = 0;

//Shared functions

/**
 *
 * @param {*} folderId
 * @param {*} reset
 * @returns
 */
const FetchFolderItems = async (folderId, reset = true) => {
  try {
    if (reset) LastId = 0;
    const request = await RequestHandler({ url: `/vault/vaultitems/${folderId}?llastId=${LastId}`, method: "GET" });
    if (request.success) {
      return request?.data || [];
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 *
 * @param {*} id
 * @returns
 */
const FetchItem = async (id) => {
  try {
    const request = await RequestHandler({ url: `/vault/vaultitem/${id}`, method: "GET" });
    if (request.success) {
      return { data: request.data, aSettings: request.aSettings };
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 *
 * @param {*} folderId
 * @returns
 */
const AddItem = async (folderId) => {
  const fileReference = $("#fileReference").val();
  let value = " ";
  if (!fileReference || !value) return;
  //encrypt value
  const token = sessionStorage.getItem("Token");
  const adminsettings = AdminSettings || (await FetchAdminSettings());
  if (!token || !adminsettings) return;

  const request = await RequestHandler({ url: "/vault/additem", method: "POST", body: { folderId, reference: fileReference, value, isFolder: false } });
  if (request.success) {
    CloseModal();
    //Add to top of the list
    VaultFileList.prepend(
      `<div id="item-${request.id}" class="vault-item p-3"><span>📄 ${fileReference}</span><span >${new Date().toLocaleDateString()}</span></div>`
    );
    //Remove event listener for the items before setting again by passing true arg
    OnItemClick(true);
    const item = await FetchItem(request.id);
    if (!item) return;
    setItem(item);
    DisplayToast({ message: "Item added successfully", type: "success" });
  } else {
    DisplayToast({ message: "An error occured", type: "danger" });
  }
};

/**
 * Add subfolder to the vault folder
 * @param {*} folderId
 * @returns
 */
const AddSubfolder = async (folderId) => {
  const folderName = $("#subfolderName").val();
  if (!folderName) return DisplayToast({ message: "An error occured", type: "danger" });
  const request = await RequestHandler({ url: "/vault/additem", method: "POST", body: { folderId, reference: folderName, value: " ", isFolder: true } });
  if (request.success) {
    CloseModal();
    //Add to top of the list
    VaultFileList.prepend(
      `<div id="folder-${request.id}" class="vault-item p-3"><span>📁 ${folderName}</span><span >${new Date().toLocaleDateString()}</span></div>
      `
    );
    //Remove event listener for the items before setting again by passing true arg
    OnItemClick(true);
    DisplayToast({ message: "Subfolder added successfully", type: "success" });
  } else {
    DisplayToast({ message: "An error occured", type: "danger" });
  }
};
