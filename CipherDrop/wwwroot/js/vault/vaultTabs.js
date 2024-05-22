const tabAddItem = $("#tab-add-item");

tabAddItem.on("click", function () {
  const id = Math.random().toString().replace(".", "");
  const newFileList = $(`<div id="vault-file-list-${id}"></div>`);
  ItemContent.push({
    Id: Math.random(),
    ListEl: newFileList,
    CurrentItem: null,
    CurrentFolderId: 0,
    LastId: 0,
    CurrentSubFolderId: 0,
    PathArray: [],
    TabName: "Items",
  });
  //append new tab 1 before the add tab
  tabAddItem.before(`<span class="nav-link vault-tab active " id="tab-link-${id}">Items</span>`);
  VaultFileListContainer.append(newFileList);

  //Reset active styles on current tab
  resetActiveStyles(CurrentLinkId);

  //Set new tab as current tab
  CurrentTabIndex = ItemContent.length - 1;
  TabIndexMap[id] = CurrentTabIndex;
  CurrentLinkId = id;
  VaultCurrentTab = $(`#tab-link-${id}`);

  //Show the item list view and set listeners for the new tab
  showListViwer();
  setTabLinkOnClick();
  UpdateLocalTabState();
});

const resetActiveStyles = (CurrentLinkId) => {
  //Hide the current tab and remove active clas from current tab
  $(`#tab-link-${CurrentLinkId}`).removeClass("active");
  ItemContent[CurrentTabIndex].ListEl.hide();

  //Reset active styles on root folder for current tab and reset file path
  $(`#root-folder-${ItemContent[CurrentTabIndex].CurrentFolderId}`).removeAttr("style");
  VaultFilePath.html("");
};

const setTabLinkOnClick = () => {
  $(".vault-tab")
    .off("click")
    .on("click", async (e) => {
      e.stopPropagation();
      const id = e.target.id.split("-")[2];
      if (CurrentLinkId === id) return;
      onTabClick(id);
    });
};

const onTabClick = async (id) => {
  hideCurrentTab(ItemContent[CurrentTabIndex]);
  updateCurrentTab(id);

  renderPathContent(ItemContent[CurrentTabIndex]);
  handleSelectedItem(ItemContent[CurrentTabIndex]);
  UpdateLocalTabState();
};

const hideCurrentTab = (currentTabContent) => {
  $(`#tab-link-${CurrentLinkId}`).removeClass("active");
  currentTabContent.ListEl.hide();
  $(`#root-folder-${currentTabContent.CurrentFolderId}`).removeAttr("style");
};

const updateCurrentTab = (id) => {
  CurrentTabIndex = TabIndexMap[id];
  CurrentLinkId = id;

  $(`#tab-link-${id}`).addClass("active");
  const $currentFolder = $(`#root-folder-${ItemContent[CurrentTabIndex].CurrentFolderId}`);
  if (!$currentFolder) return;
  $currentFolder.css({
    "background-color": "var(--secondary-color)",
    border: "1px solid var(--primary-color)",
  });
};

const renderPathContent = (currentTabContent) => {
  let pathContent = "";
  currentTabContent.PathArray.forEach((path, index) => {
    pathContent += `<a id="vault-${index == 0 ? "folder" : "subfolder"}-${path.folderId}" class="vault-root-folder file-path-item" href="/vault/home/${
      path.folderId
    }">${path.text}</a> <span class="mt-5">›</span>`;
  });

  SetFilePath(currentTabContent.CurrentSubFolderId || currentTabContent.CurrentFolderId, "", {
    customHtml: pathContent,
    reset: true,
  });
};

const handleSelectedItem = async (currentTabContent) => {
  if (currentTabContent.CurrentItem) {
    const { CurrentItem } = currentTabContent;

    if (CurrentItem.reference) {
      tinymce.get("file-viewer-content").setContent(CurrentItem.value);
      fileViewerReference.text(CurrentItem.reference);
      fileViewerReference.val(CurrentItem.reference);
    } else {
      const item = await FetchItem(CurrentItem.id);

      SetItem(item?.data);
    }

    ToggleItemPermissions(currentTabContent.UserPermission, CurrentItem);
    VaultFileViewer.show();

    if (VaultItemPemrmissions.is(":visible")) {
      VaultItemPemrmissions.hide();
      tinymce.activeEditor.show();
    }
    return;
  }

  if (currentTabContent.InitialLoad) {
    await SetItems(currentTabContent.CurrentSubFolderId || currentTabContent.CurrentFolderId, true);
    currentTabContent.InitialLoad = false;
  }
  currentTabContent.ListEl.show();
  VaultFileViewer.hide();
  $(`#tab-link-${CurrentLinkId}`).html(currentTabContent.TabName);
};

//Udate current tab state based on local storage
const setTabsFromStorage = () => {
  let storedTabs = localStorage.getItem("VaultTabs");
  if (!storedTabs) return;
  storedTabs = JSON.parse(storedTabs);
  storedTabs.forEach((tab, index) => {
    if (!tab) return;
    formatStoredTabs(tab, index);
  });

  //Get the current tab index from storage and set the current tab
  const currentTab = localStorage.getItem("VaultCurrentTab");
  if (currentTab) CurrentTabIndex = currentTab;
  VaultCurrentTab = $(`#tab-link-${ItemContent[CurrentTabIndex].Id}`);
  const curFolderId = ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentFolderId;

  //Set the folder path and items for the current tab
  OnSetFileTreeSubItem(ItemContent[CurrentTabIndex].PathArray, curFolderId);
  setCurrentFolderInit(curFolderId);
  CurrentLinkId = ItemContent[CurrentTabIndex].Id;

  if (CurrentTabIndex !== 0) {
    hideCurrentTab(ItemContent[0]);
    updateCurrentTab(CurrentLinkId);
  }
  setTabLinkOnClick();
};

const formatStoredTabs = (tab, index) => {
  if (index === 0) {
    ItemContent[0] = { ...ItemContent[0], ...tab };
    $(`#tab-link-${tab.Id}`).html(tab.TabName);
  } else {
    const newFileList = $(`<div id="vault-file-list-${tab.Id}"></div>`);
    ItemContent.push({
      Id: tab.Id,
      ListEl: newFileList,
      CurrentItem: null,
      CurrentFolderId: tab.CurrentFolderId,
      LastId: tab.LastId,
      CurrentSubFolderId: tab.CurrentSubFolderId,
      PathArray: tab.PathArray || [],
      TabName: tab.TabName,
      InitialLoad: true,
    });
    //append new tab 1 before the add tab
    tabAddItem.before(`<span class="nav-link vault-tab" id="tab-link-${tab.Id}">${tab.TabName}</span>`);
    VaultFileListContainer.append(newFileList);
    TabIndexMap[tab.Id] = index;
  }
};

const setCurrentFolderInit = async (folderId) => {
  const currentTab = ItemContent[CurrentTabIndex];
  currentTab.CurrentFolderId = folderId;

  if ((await SetItems(folderId)) === false) return;

  const folder = document.getElementById(`root-folder-${folderId}`);
  if (folder) {
    setCurrentFolder(folder);
    SetFilePath(folderId, folder.innerText.replace("⬇️", ""));
  }

  currentTab.ListEl.show();
};
setTabsFromStorage();
