const fileViewerReference = $("#file-viewer-reference");
let timeout = null;
let referenceTimeout = null;
let loading = false;
let lastString = "";

fileViewerReference.on("input", function () {
  if (referenceTimeout) clearTimeout(referenceTimeout);
  referenceTimeout = setTimeout(() => {
    updateItemReference(this.value);
  }, 1000);
});

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
    SetItem(item);
    //Update current tab text
    VaultCurrentTab.html(item?.data?.reference || "Item");
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

const updateItemReference = async (reference) => {
  if (loading) return;
  const tempItem = { ...ItemContent[CurrentTabIndex].CurrentItem };
  tempItem.reference = CryptoJS.AES.encrypt(reference, sessionStorage.getItem("Token") + AdminSettings.keyEnd).toString();
  loading = true;
  const request = await RequestHandler({ url: `/vault/UpdateItemReference/`, method: "PUT", body: { ...tempItem, value: "" } });
  loading = false;
  if (request.success) {
    ItemContent[CurrentTabIndex].CurrentItem = tempItem;
    ItemContent[CurrentTabIndex].CurrentItem.reference = reference;
    ItemContent[CurrentTabIndex].CurrentItem.updatedAt = new Date();
    $("#vaultitem-" + ItemContent[CurrentTabIndex].CurrentItem.id)
      .find("span")
      .first()
      .text(`📄 ${reference}`);
  } else {
    if (request.errors) request.errors.forEach((error) => DisplayToast({ message: error, type: "danger" }));
    else DisplayToast({ message: "An error occured", type: "danger" });
  }
};
