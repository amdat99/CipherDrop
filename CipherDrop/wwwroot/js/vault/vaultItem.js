const fileViewerContent = $("#file-viewer-content");
const fileViewerReference = $("#file-viewer-reference");
let currentItem = null;
let adminSettings = null;
let timeout = null;
let referenceTimeout = null;
let loading = false;

document.addEventListener("DOMContentLoaded", function () {
  onChangeValue();
});

const OnItemClick = () => {
  $(".vault-item").on("click", async function () {
    const item = await fetchItem(this.id.split("-")[1]);
    if (!item) return;
    //decrypt item value
    item.data.value = CryptoJS.AES.decrypt(item.data.value, sessionStorage.getItem("Token") + item.aSettings.keyEnd).toString(CryptoJS.enc.Utf8);
    currentItem = item.data;
    adminSettings = item.aSettings;
    fileViewerReference.val(item.data.reference);
    fileViewerReference.text(item.data.reference);
    fileViewerContent.text(item.data.value);
    fileViewerContent.val(item.data.value);
    VaultFileList.hide();
    VaultFileViewer.show();
  });
};

const onChangeValue = () => {
  fileViewerContent.on("input", function () {
    if (timeout) clearTimeout(timeout);

    timeout = setTimeout(() => {
      updateItem(this.value);
    }, 1000);
  });
};

onChangeReference = () => {
  fileViewerReference.on("input", function () {
    console.log(this.value);
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

const updateItem = async (value) => {
  if (loading) return;
  const tempItem = { ...currentItem };

  console.log(value);

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
    alert("An error occured");
  }
};
