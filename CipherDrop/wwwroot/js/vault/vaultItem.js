const fileViewerContent = $("#file-viewer-content");
const fileViewerReference = $("#file-viewer-reference");
let currentItem = null;
let adminSettings = null;
let timeout = null;
let referenceTimeout = null;
let loading = false;
let lastString = "";

/**
 *  Handles the change event for the value field
 * @param {*} e - The event object
 * @returns {void}
 */
const OnVauleChange = (e) => {
  let val = e?.level?.content || e?.target?.innerHTML;
  console.log(val);
  if (timeout) clearTimeout(timeout);
  timeout = setTimeout(() => {
    if (val === lastString) return;
    lastString = val;
    updateItem(val);
  }, 1000);
};

const OnItemClick = (removeEventListenerFirst = false) => {
  if (removeEventListenerFirst) $(".vault-item").off("click");
  $(".vault-item").on("click", async function () {
    const item = await fetchItem(this.id.split("-")[1]);
    if (!item) return;
    //decrypt item value and set it
    setItem(item);
  });
};

const setItem = (item) => {
  item.data.value = CryptoJS.AES.decrypt(item.data.value, sessionStorage.getItem("Token") + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);
  currentItem = item.data;
  adminSettings = item.aSettings;
  //set values
  fileViewerReference.val(item.data.reference);
  fileViewerReference.text(item.data.reference);
  fileViewerContent.text(item.data.value);
  fileViewerContent.val(item.data.value);
  tinymce.get("file-viewer-content").setContent(item.data.value);

  VaultFileList.hide();
  VaultFileViewer.show();
};

onChangeReference = () => {
  fileViewerReference.on("input", function () {
    if (referenceTimeout) clearTimeout(referenceTimeout);
    referenceTimeout = setTimeout(() => {
      currentItem.reference = this.value;
      updateItem(currentItem);
    }, 1000);
  });
};

const fetchItem = async (id) => {
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
 * Add item to the vault folder
 * @param {*} folderId
 * @returns
 */
const AddItem = async (folderId) => {
  const fileReference = $("#fileReference").val();
  let value = " ";
  if (!fileReference || !value) return;
  //encrypt value
  const token = sessionStorage.getItem("Token");
  const adminsettings = await FetchAdminSettings();
  if (!token || !adminsettings) return;
  isFolder = false;

  const request = await RequestHandler({ url: "/vault/additem", method: "POST", body: { folderId, reference: fileReference, value, isFolder } });
  if (request.success) {
    CloseModal();
    //Add to top of the list
    VaultFileList.prepend(
      `<div id="item-${request.id}" class="vault-item p-3"><span>📄 ${fileReference}</span><span >${new Date().toLocaleDateString()}</span></div>`
    );
    //Remove event listener for the items before setting again by passing true arg
    OnItemClick(true);
    const item = await fetchItem(request.id);
    if (!item) return;
    setItem(item);
    DisplayToast({ message: "Item added successfully", type: "success" });
  } else {
    DisplayToast({ message: "An error occured", type: "danger" });
  }
};

const AddSubfolder = async (folderId) => {
  const folderName = $("#subFolderName").val();
  if (!folderName) return;
  const request = await RequestHandler({ url: "/vault/addsubfolder", method: "POST", body: { folderId, folderName } });
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

const updateItem = async (value) => {
  if (loading) return;
  const tempItem = { ...currentItem };

  //encrypt value
  tempItem.value = CryptoJS.AES.encrypt(value, sessionStorage.getItem("Token") + adminSettings.keyEnd).toString();

  loading = true;
  const request = await RequestHandler({ url: `/vault/updateitem/${currentItem.id}`, method: "PUT", body: tempItem });
  loading = false;
  if (request.success) {
    currentItem = tempItem;
    currentItem.value = value;
    currentItem.updatedAt = new Date();
  } else {
    DisplayToast({ message: "An error occured", type: "danger" });
  }
};
