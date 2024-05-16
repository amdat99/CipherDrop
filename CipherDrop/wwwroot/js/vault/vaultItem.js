const fileViewerReference = $("#file-viewer-reference");
const vaultItemSearch = $("#vault-item-search");
let timeout = null;
let referenceTimeout = null;
let itemSearchTimeout = null;
let itemScrollTimeout = null;
let loading = false;
let lastString = "";

fileViewerReference.on("input", function () {
  if (referenceTimeout) clearTimeout(referenceTimeout);
  referenceTimeout = setTimeout(() => {
    updateItemReference(this.value);
  }, 1000);
});

vaultItemSearch.on("input", function () {
  if (itemSearchTimeout) clearTimeout(itemSearchTimeout);
  itemSearchTimeout = setTimeout(async () => {
    const items = await filterItems(this.value);
    if (!items?.data || !items.data.length) return DisplayToast({ message: "No items found", type: "info" });

    ItemContent[CurrentTabIndex].ListEl.empty();
    ItemContent[CurrentTabIndex].ListEl.append(await FormatItems(items.data));
    ItemContent[CurrentTabIndex].CurrentItem = null;
    ItemContent[CurrentTabIndex].Items = items.data;
    OnItemClick(removeItemEListener);
  }, 350);
});

/**
 *  Handles the change event for the value field
 * @param {Event} e - The event object
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

const OnItemClick = () => {
  $(".vault-item")
    .off("click")
    .on("click", async function (e) {
      e.stopPropagation();
      const item = await FetchItem(this.id.split("-")[1]);
      if (!item) return;
      //decrypt item value and set it
      SetItem(item, item.data?.isFolder ? true : false);
      //Update current tab text
      ItemContent[CurrentTabIndex].TabName = item.data?.reference || "Item";
      VaultCurrentTab.html(item?.data?.reference || "Item");

      //If clicked from file tree on rootfolders set the folder path for the item and item parents
      if (this.dataset?.Rootfolder) {
        const folderPath = GetFolderPath(this);
        if (!folderPath || folderPath.length === 0) return;
        OnSetFileTreeSubItem(folderPath, folderPath[folderPath.length - 1].folderId);
      }
    });
  setCurrentItemListScrollListener();
};

const setCurrentItemListScrollListener = () => {
  if (itemScrollTimeout) clearTimeout(itemScrollTimeout);

  itemScrollTimeout = setTimeout(async () => {
    if (shouldLoadMoreItems(this, ItemContent[CurrentTabIndex])) {
      const items = await fetchMoreItems(ItemContent[CurrentTabIndex]);
      if (!items || items.length === 0) return (ItemContent[CurrentTabIndex].NoMoreItems = true);

      //append items to the list and set the click listener if items
      appendAndFormatItems(currentTab, items);
      OnItemClick(true);
    }
  }, 100);

  const shouldLoadMoreItems = (listEl, currentTab) => {
    return listEl.scrollTop + listEl.clientHeight >= listEl.scrollHeight - 30 && currentTab.Items.length > 40 && !currentTab.NoMoreItems;
  };
};

const fetchMoreItems = async (currentTab) => {
  const lastItem = $(".vault-item").last()[0];
  if (!lastItem) return;

  currentTab.LastId = lastItem.id.split("-")[1];
  return await FetchFolderItems(currentTab.CurrentSubFolderId || currentTab.CurrentFolderId);
};

const appendAndFormatItems = async (currentTab, items) => {
  currentTab.ListEl.append(await FormatItems(items));
  currentTab.Items = [...currentTab.Items, ...items];
};

const updateItem = async (value) => {
  if (loading) return;
  const tempItem = { ...ItemContent[CurrentTabIndex].CurrentItem };

  //encrypt value and reference
  const token = Token || sessionStorage.getItem("Token");
  tempItem.value = CryptoJS.AES.encrypt(value, token + AdminSettings.keyEnd).toString();
  tempItem.reference = "t";

  loading = true;
  const request = await RequestHandler({ url: `/vault/updateitem/${ItemContent[CurrentTabIndex].CurrentItem.id}`, method: "PUT", body: tempItem });
  loading = false;
  if (request.success) {
    setItemAfterSuccess(tempItem, value);
  } else {
    if (request.errors) request.errors.forEach((error) => DisplayToast({ message: error, type: "danger" }));
    else DisplayToast({ message: "An error occured", type: "danger" });
  }
};

const updateItemReference = async (reference) => {
  if (loading) return;
  const tempItem = { ...ItemContent[CurrentTabIndex].CurrentItem };
  tempItem.reference = AdminSettings.allowGlobalSearchAndLinking
    ? reference
    : CryptoJS.AES.encrypt(reference, Token || sessionStorage.getItem("Token") + AdminSettings.keyEnd).toString();
  loading = true;
  const request = await RequestHandler({ url: `/vault/UpdateItemReference/`, method: "PUT", body: { ...tempItem, value: "" } });
  loading = false;
  if (request.success) {
    setItemAfterSuccess(tempItem, reference, "reference");
  } else {
    if (request.errors) request.errors.forEach((error) => DisplayToast({ message: error, type: "danger" }));
    else DisplayToast({ message: "An error occured", type: "danger" });
  }
};

const setItemAfterSuccess = (tempItem, text, type = "value") => {
  ItemContent[CurrentTabIndex].CurrentItem = tempItem;
  ItemContent[CurrentTabIndex].CurrentItem.reference = reference;
  ItemContent[CurrentTabIndex].CurrentItem.updatedAt = new Date();

  if (type === "value") {
    ItemContent[CurrentTabIndex].CurrentItem.value = text;
  } else {
    ItemContent[CurrentTabIndex].CurrentItem.reference = text;

    $("#vaultitem-" + ItemContent[CurrentTabIndex].CurrentItem.id)
      .find("span")
      .first()
      .text(`📄 ${reference}`);
  }

  VaultCurrentTab.html(text);
  ItemContent[CurrentTabIndex].TabName = text;
};

const filterItems = async (searchTerm) => {
  const items = await RequestHandler({
    url: `/vault/VaultItemsSearch?query=${searchTerm}&folderId=${
      ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentFolderId
    }`,
    method: "GET",
  });
  if (!items?.data) return DisplayToast({ message: "An error occured", type: "danger" });
  return items;
};
