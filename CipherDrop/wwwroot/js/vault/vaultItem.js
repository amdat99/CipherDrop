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
    const item = await FetchItem(this.id.split("-")[1]);
    if (!item) return;
    //decrypt item value and set it
    setItem(item);
    //Update current tab text
    VaultCurrentTab.html(item?.data?.reference || "Item");
  });
};

const setItem = (item) => {
  item.data.value = CryptoJS.AES.decrypt(item.data.value, sessionStorage.getItem("Token") + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);
  CurrentItem = item.data;
  AdminSettings = item.aSettings;
  //set values
  fileViewerReference.val(item.data.reference);
  fileViewerReference.text(item.data.reference);
  tinymce.get("file-viewer-content").setContent(item.data.value);

  VaultFileList.hide();
  VaultFileViewer.show();
};

onChangeReference = () => {
  fileViewerReference.on("input", function () {
    if (referenceTimeout) clearTimeout(referenceTimeout);
    referenceTimeout = setTimeout(() => {
      CurrentItem.reference = this.value;
      updateItem(CurrentItem);
    }, 1000);
  });
};

const updateItem = async (value) => {
  if (loading) return;
  const tempItem = { ...CurrentItem };

  //encrypt value
  tempItem.value = CryptoJS.AES.encrypt(value, sessionStorage.getItem("Token") + AdminSettings.keyEnd).toString();

  loading = true;
  const request = await RequestHandler({ url: `/vault/updateitem/${CurrentItem.id}`, method: "PUT", body: tempItem });
  loading = false;
  if (request.success) {
    CurrentItem = tempItem;
    CurrentItem.value = value;
    CurrentItem.updatedAt = new Date();
  } else {
    DisplayToast({ message: "An error occured", type: "danger" });
  }
};
