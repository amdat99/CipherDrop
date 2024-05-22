//Shared elements
const VaultFileViewer = $("#file-viewer");
const VaultFileListContainer = $("#vault-file-list-container");
const VaultFolderList = $(".vault-folder-list");
const VaultFolderActions = $("#vault-folder-actions");
const VaultAddItemBtn = $("#add-default-item");
const VaultAddSubFolderBtn = $("#add-sub-folder");
const VaultFilePath = $("#file-path");
const VaultItemPemrmissions = $("#item-permissions");
const PermissionsButtonEl = $("#permissions-btn");
const DeleteItemButtonEl = $("#delete-item");

let VaultCurrentTab = $("#tab-link-0");

//Shared vars
let ItemContent = [
  {
    id: 0,
    Items: [],
    CurrentItem: null,
    ListEl: $("#vault-file-list-0"),
    CurrentFolderId: 0,
    CurrentSubFolderId: null,
    LastId: 0,
    TabName: "Items",
    InitialLoad: true,
  },
];

const TabIndexMap = { 0: 0 };
let CurrentTabIndex = 0;
let CurrentLinkId = 0;
let CurrentFolder = null;
let VaultLoading = false;

//Shared functions
/**
 *
 * @param {number} folderId
 * @param {boolean} reset
 * @returns
 */
const FetchFolderItems = async (folderId, reset = true) => {
  try {
    if (VaultLoading) return;
    if (reset) ItemContent[CurrentTabIndex].LastId = 0;
    ToggleLoading();
    const request = await RequestHandler({ url: `/vault/vaultitems/${folderId}?lastId=${ItemContent[CurrentTabIndex].LastId}`, method: "GET" });
    ToggleLoading();
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
 * @param {int} id
 * @returns
 */
const FetchItem = async (id) => {
  try {
    if (VaultLoading) return;
    ToggleLoading();
    const request = await RequestHandler({ url: `/vault/vaultitem/${id}`, method: "GET" });
    ToggleLoading();
    if (request.success) {
      return request;
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

/**
 *
 * @param {number} folderId
 * @param {boolean} isFolder
 * @returns
 */
const AddItem = async (folderId, isFolder = false) => {
  const fileReference = $("#fileReference").val();
  const token = Token || sessionStorage.getItem("Token");
  const adminsettings = AdminSettings || (await FetchAdminSettings());
  if (!fileReference || !token || !adminsettings) return;

  //encrypt the reference
  const curReference = AdminSettings.allowGlobalSearchAndLinking ? fileReference : CryptoJS.AES.encrypt(fileReference, token + adminsettings.keyEnd).toString();
  const request = await RequestHandler({ url: "/vault/additem", method: "POST", body: { folderId, reference: curReference, value: " ", isFolder } });
  if (!request?.success) return DisplayToast({ message: "An error occured", type: "danger" });
  //Add to top of the list
  ItemContent[CurrentTabIndex].ListEl.prepend(
    `<div id="item-${request.id}" class="vault-item card-offset card-offset-hover p-3"><span>${
      isFolder ? "📁" : "📄"
    } ${fileReference}</span><span >${new Date().toLocaleDateString()}</span></div>`
  );
  //Remove event listener for the items before setting again by passing true arg
  OnItemClick(true);

  if (isFolder) {
    VaultFileViewer.hide();
    ItemContent[CurrentTabIndex].ListEl.show();
  } else {
    const item = await FetchItem(request.id);
    if (!item) return;
    SetItem(item);
  }

  DisplayToast({ message: isFolder ? "Folder added successfully" : "Item added successfully", type: "success" });
  CloseModal();
};

const addRootFolder = async () => {
  const FolderName = $("#folderName").val();
  if (!FolderName) return;
  const request = await RequestHandler({ url: "/vault/addrootfolder", method: "POST", body: { FolderName } });
  if (request.success) {
    CloseModal();

    VaultFolderList.append(
      ` <div id="root-folder-${request.id}" class="vault-root-folder card-offset-hover card-offset"> <div class="d-flex justify-content-between align-items-center"> <span>📁${FolderName}</span> <img class="folder-sliderdown" id="root-slider-${request.id}" 
        src="https://www.svgrepo.com/show/80156/down-arrow.svg" style="width: 10px; height: 20px;" /> </div> </div>`
    );

    //remove event listener for folder click first and then add it again with the new folder
    $(".vault-root-folder").off("click");
    OnRootFolderClick();
    SetFileTreeListeners();
    DisplayToast({ message: "Folder added successfully", type: "success" });
  } else {
    DisplayToast({ message: request?.message || "An error occured", type: "danger" });
  }
};

const DeleteItem = async () => {
  if (!ItemContent[CurrentTabIndex].CurrentItem) return DisplayToast({ message: "Please select an item to delete", type: "danger" });
  const request = await RequestHandler({ url: `/vault/deleteitem/${ItemContent[CurrentTabIndex].CurrentItem.id}`, method: "DELETE" });
  if (request.success) {
    $(`#vaultitem-${ItemContent[CurrentTabIndex].CurrentItem.id}`).remove();
    ItemContent[CurrentTabIndex].CurrentItem = null;
    ItemContent[CurrentTabIndex].ListEl.show();
    VaultFileViewer.hide();
    CloseModal();
    DisplayToast({ message: "Item deleted successfully", type: "success" });
  } else {
    DisplayToast({ message: "An error occured", type: "danger" });
  }
};

/**
 *  Set item to the file viewer
 * @param {*} item
 * @returns
 */
const SetItem = async (item, isSubfolder = false) => {
  if (!item) return;
  const token = Token || sessionStorage.getItem("Token");
  AdminSettings = item.aSettings;

  item.data.value = CryptoJS.AES.decrypt(item.data.value, token + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);
  if (item.data?.refE2) item.data.reference = CryptoJS.AES.decrypt(item.data.reference, token + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);

  ItemContent[CurrentTabIndex].CurrentItem = item.data;
  ItemContent[CurrentTabIndex].UserPermission = item?.userPermission;

  //set values and show file viewe if not sub folder
  if (!isSubfolder) {
    fileViewerReference.val(item.data.reference);
    fileViewerReference.text(item.data.reference);
    tinymce.get("file-viewer-content").setContent(item.data.value);
    ItemContent[CurrentTabIndex].ListEl.hide();
    showItem();
  } else {
    ItemContent[CurrentTabIndex].CurrentSubFolderId = item.data.subFolderId;
    if (await SetItems(item.data.subFolderId, true)) SetFilePath(item.data.subFolderId, item.data.reference, { append: true, isSubFolder: true });
  }

  //show or hide permissions button and set readonly mode based on user permission and default restrictions
  ToggleItemPermissions(item?.userPermission, item.data);
};

const SetItems = async (folderId, removeItemEListener = false) => {
  const items = await FetchFolderItems(folderId);
  if (!items) return false;

  ItemContent[CurrentTabIndex].ListEl.empty();
  ItemContent[CurrentTabIndex].ListEl.append(await FormatItems(items));

  ItemContent[CurrentTabIndex].NoMoreItems = false;
  ItemContent[CurrentTabIndex].CurrentItem = null;
  ItemContent[CurrentTabIndex].Items = items;

  OnItemClick(removeItemEListener);
  return true;
};

const FormatItems = async (items) => {
  let currentitems = "";
  const adminsettings = AdminSettings || (await FetchAdminSettings());
  if (!adminsettings) return false;

  const token = Token || sessionStorage.getItem("Token");

  items.forEach((item) => {
    currentitems += `<div id="vaultitem-${item.id}" class="vault-item card-offset card-offset-hover p-3"><span>${item.isFolder ? "📁" : "📄"} ${
      item.data?.refE2 ? CryptoJS.AES.decrypt(item.reference, token + adminsettings.keyEnd).toString(CryptoJS.enc.Utf8) : item.reference
    }</span><span>${new Date(item.updatedAt).toLocaleDateString()}</span></div>`;
  });

  return currentitems;
};

const ToggleItemPermissions = (userPermission, item) => {
  if (userPermission?.role === "Manage") PermissionsButtonEl.show();
  else PermissionsButtonEl.hide();

  if (item.isEditRestricted && (!userPermission?.role || userPermission?.role === "View")) tinymce.activeEditor.mode.set("readonly");
  else tinymce.activeEditor.mode.set("design");
};

const ToggleLoading = () => {
  VaultLoading = !VaultLoading;
  VaultLoading ? ToggleSiteLoader() : ToggleSiteLoader(false);
};

const UpdateLocalTabState = () => {
  let storedTabs = localStorage.getItem("VaultTabs");
  storedTabs ? (storedTabs = JSON.parse(storedTabs)) : (storedTabs = []);
  storedTabs[CurrentTabIndex] = {
    Id: CurrentTabIndex,
    CurrentFolderId: ItemContent[CurrentTabIndex].CurrentFolderId,
    CurrentSubFolderId: ItemContent[CurrentTabIndex].CurrentSubFolderId,
    LastId: ItemContent[CurrentTabIndex].LastId,
    TabName: ItemContent[CurrentTabIndex].TabName,
    PathArray: ItemContent[CurrentTabIndex].PathArray,
  };
  localStorage.setItem("VaultTabs", JSON.stringify(storedTabs));
  localStorage.setItem("VaultCurrentTab", CurrentTabIndex);
};

const showItem = () => {
  VaultFileViewer.show();
  if (VaultItemPemrmissions.is(":visible")) {
    VaultItemPemrmissions.hide();
    tinymce.activeEditor.show();
  }
};
