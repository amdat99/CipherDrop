//Shared elements
const VaultFileViewer = $("#file-viewer");
const VaultFileListContainer = $("#vault-file-list-container");
const VaultFolderList = $(".vault-folder-list");
const VaultFolderActions = $("#vault-folder-actions");
const VaultAddItemBtn = $("#add-default-item");
const VaultAddSubFolderBtn = $("#add-sub-folder");
const VaultFilePath = $("#file-path");
const VaultItemPemrmissions = $("#item-permissions");

let VaultCurrentTab = $("#tab-link-0");

//Shared vars
let ItemContent = [{ id: 0, Items: [], CurrentItem: null, ListEl: $("#vault-file-list-0"), CurrentFolderId: 0, CurrentSubFolderId: 0, LastId: 0 }];
const TabIndexMap = { 0: 0 };
let CurrentTabIndex = 0;
let CurrentLinkId = 0;
let CurrentFolder = null;

//Shared functions
/**
 *
 * @param {*} folderId
 * @param {*} reset
 * @returns
 */
const FetchFolderItems = async (folderId, reset = true) => {
  try {
    if (reset) ItemContent[CurrentTabIndex].LastId = 0;
    const request = await RequestHandler({ url: `/vault/vaultitems/${folderId}?lastId=${ItemContent[CurrentTabIndex].LastId}`, method: "GET" });
    if (request.success) {
      AdminSettings = request.aSettings;
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
  //encrypt the reference
  const token = sessionStorage.getItem("Token");
  const adminsettings = AdminSettings || (await FetchAdminSettings());
  if (!token || !adminsettings) return;
  const encryptedReference = CryptoJS.AES.encrypt(fileReference, token + adminsettings.keyEnd).toString();

  const request = await RequestHandler({ url: "/vault/additem", method: "POST", body: { folderId, reference: encryptedReference, value, isFolder: false } });
  if (request.success) {
    CloseModal();
    //Add to top of the list
    ItemContent[CurrentTabIndex].ListEl.prepend(
      `<div id="item-${
        request.id
      }" class="vault-item card-offset card-offset-hover p-3"><span>📄 ${fileReference}</span><span >${new Date().toLocaleDateString()}</span></div>`
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
 *  Set item to the file viewer
 * @param {*} item
 * @returns
 */
const SetItem = (item) => {
  if (!item) return;
  const token = sessionStorage.getItem("Token");
  item.data.value = CryptoJS.AES.decrypt(item.data.value, token + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);
  item.data.reference = CryptoJS.AES.decrypt(item.data.reference, token + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);

  ItemContent[CurrentTabIndex].CurrentItem = item.data;
  AdminSettings = item.aSettings;
  //set values
  fileViewerReference.val(item.data.reference);
  fileViewerReference.text(item.data.reference);
  tinymce.get("file-viewer-content").setContent(item.data.value);

  ItemContent[CurrentTabIndex].ListEl.hide();
  VaultFileViewer.show();
  if (VaultItemPemrmissions.is(":visible")) {
    VaultItemPemrmissions.hide();
    tinymce.activeEditor.show();
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
    ItemContent[CurrentTabIndex].ListEl.prepend(
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
