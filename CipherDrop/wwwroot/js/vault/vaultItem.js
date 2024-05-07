const fileViewerReference = $("#file-viewer-reference");
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
    const item = await FetchItem(this.id.split("-")[1]);
    if (!item) return;
    //decrypt item value and set it
    setItem(item);
    //Update current tab text
    VaultCurrentTab.html(item?.data?.reference || "Item");
  });
};

const setItem = (item) => {
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
  tinymce.activeEditor.focus();
};

onChangeReference = () => {
  fileViewerReference.on("input", function () {
    if (referenceTimeout) clearTimeout(referenceTimeout);
    referenceTimeout = setTimeout(() => {
      ItemContent[CurrentTabIndex].CurrentItem.reference = this.value;
      updateItem(ItemContent[CurrentTabIndex].CurrentItem);
    }, 1000);
  });
};

const updateItem = async (value) => {
  if (loading) return;
  const tempItem = { ...ItemContent[CurrentTabIndex].CurrentItem };

  //encrypt value and reference
  const token = sessionStorage.getItem("Token");
  tempItem.value = CryptoJS.AES.encrypt(value, token + AdminSettings.keyEnd).toString();
  tempItem.reference = CryptoJS.AES.encrypt(tempItem.reference, token + AdminSettings.keyEnd).toString();

  loading = true;
  const request = await RequestHandler({ url: `/vault/updateitem/${ItemContent[CurrentTabIndex].CurrentItem.id}`, method: "PUT", body: tempItem });
  loading = false;
  if (request.success) {
    ItemContent[CurrentTabIndex].CurrentItem = tempItem;
    ItemContent[CurrentTabIndex].CurrentItem.value = value;
    ItemContent[CurrentTabIndex].CurrentItem.updatedAt = new Date();
  } else {
    if (request.errors) request.errors.forEach((error) => DisplayToast({ message: error, type: "danger" }));
    else DisplayToast({ message: "An error occured", type: "danger" });
  }
};
