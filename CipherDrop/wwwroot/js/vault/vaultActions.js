$("#addRootFolder").on("click", function () {
  DisplayModal({
    content: `
        <div class="mb-3">
          <label for="folderName" class="form-label">Folder Name</label>
          <input type="text" class="form-control" id="folderName" name="folderName" required>
        </div>
    `,
    buttonText: "Add Folder",
    submitFunction: addRootFolder,
  });
});

// Add add default item handler
VaultAddItemBtn.off("click").on("click", function () {
  if (!ItemContent[CurrentTabIndex].CurrentFolderId) return DisplayToast({ message: "Please select a folder to add item to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="fileReference" class="form-label">Item name</label>
        <input type="text" class="form-control" id="fileReference" name="fileReference" required>
      </div>
      `,
    buttonText: "Add Item",
    submitFunction: () => AddItem(ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentFolderId),
  });
});

//Add add subfolder handler
VaultAddSubFolderBtn.off("click").on("click", function () {
  if (!ItemContent[CurrentTabIndex].CurrentFolderId) return DisplayToast({ message: "Please select a folder to add subfolder to", type: "danger" });
  DisplayModal({
    content: `
      <div class="mb-3">
        <label for="folderName" class="form-label">Subfolder Name</label>
        <input type="text" class="form-control" id="fileReference" name="folderName" required>
      </div>
      `,
    buttonText: "Add Sub Folder",
    submitFunction: () => AddItem(ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentFolderId, true),
  });
});

DeleteItemButtonEl.off("click").on("click", async function () {
  if (!ItemContent[CurrentTabIndex].CurrentItem) return DisplayToast({ message: "Please select an item to delete", type: "danger" });
  DisplayModal({
    content: "Are you sure you want to delete this item?",
    buttonText: "Delete",
    buttonStyle: "background-color: var(--danger-color); border-color: var(--danger-color);",
    submitFunction: DeleteItem,
  });
});

$("#tab-add-item").on("click", function () {
  const id = Math.random().toString().replace(".", "");
  const newFileList = $(`<div id="vault-file-list-${id}"></div>`);
  ItemContent.push({ Id: Math.random(), ListEl: newFileList, CurrentItem: null, CurrentFolderId: 0, LastId: 0, CurrentSubFolderId: 0 });
  //append new tab 1 before the add tab
  $("#tab-add-item").before(`<span class="nav-link vault-tab active " id="tab-link-${id}">Items</span>`);
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
});

const resetActiveStyles = (CurrentLinkId) => {
  //Hide the current tab and remove active clas from current tab
  $(`#tab-link-${CurrentLinkId}`).removeClass("active");
  ItemContent[CurrentTabIndex].ListEl.hide();

  //Reset active styles on root folder for current tab and reset file path
  $(`#root-folder-${ItemContent[CurrentTabIndex].CurrentFolderId}`).removeAttr("style");
  VaultFilePath.html("");
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

const setTabLinkOnClick = () => {
  $(".vault-tab")
    .off("click")
    .on("click", async (e) => {
      e.stopPropagation();
      const id = this.attr("id").split("-")[2];
      if (CurrentLinkId === id) return;

      const currentTabIndex = TabIndexMap[id];
      const currentTabContent = ItemContent[currentTabIndex];

      hideCurrentTab(currentTabContent);
      updateCurrentTab(id);

      renderPathContent(currentTabContent);
      handleSelectedItem(currentTabContent);
    });
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

  setFilePath(currentTabContent.CurrentSubFolderId || currentTabContent.CurrentSubFolderId, "", {
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
  } else {
    currentTabContent.ListEl.show();
    VaultFileViewer.hide();
    $(`#tab-link-${CurrentLinkId}`).html(currentTabContent.TabName);
  }
};
