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
VaultAddItemBtn.off("click");
VaultAddItemBtn.on("click", function () {
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
VaultAddSubFolderBtn.off("click");
VaultAddSubFolderBtn.on("click", function () {
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

$("#tab-add-item").on("click", function () {
  const id = Math.random().toString().replace(".", "");
  const newFileList = $(`<div id="vault-file-list-${id}"></div>`);
  ItemContent.push({ Id: Math.random(), ListEl: newFileList, CurrentItem: null, CurrentFolderId: 0, LastId: 0, CurrentSubFolderId: 0 });
  //append new tab 1 before the add tab
  $("#tab-add-item").before(`<span class="nav-link vault-tab active " id="tab-link-${id}">Items</span>`);
  VaultFileListContainer.append(newFileList);

  //Hide the current tab and remove active clas from current tab
  $(`#tab-link-${CurrentLinkId}`).removeClass("active");
  ItemContent[CurrentTabIndex].ListEl.hide();

  //Reset active styles on root folder for current tab and reset file path
  $(`#root-folder-${ItemContent[CurrentTabIndex].CurrentFolderId}`).removeAttr("style");
  VaultFilePath.html("");

  CurrentTabIndex = ItemContent.length - 1;
  TabIndexMap[id] = CurrentTabIndex;
  CurrentLinkId = id;

  VaultCurrentTab = $(`#tab-link-${id}`);
  showListViwer();
  setTabLinkOnClick();
});

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
  $(".vault-tab").off("click");
  $(".vault-tab").on("click", async function (e) {
    const id = e.target.id.split("-")[2];
    if (CurrentLinkId === id) return;
    //Hide the current tab and remove active clas from current tab
    $(`#tab-link-${CurrentLinkId}`).removeClass("active");
    ItemContent[CurrentTabIndex].ListEl.hide();
    $(`#root-folder-${ItemContent[CurrentTabIndex].CurrentFolderId}`).removeAttr("style");

    CurrentTabIndex = TabIndexMap[id];
    CurrentLinkId = id;
    const curFolderId = ItemContent[CurrentTabIndex].CurrentFolderId;

    //set active styles and path
    $(`#tab-link-${id}`).addClass("active");
    const currentFolder = $(`#root-folder-${curFolderId}`);
    currentFolder.css("background-color", "var(--secondary-color)").css("border", "1px solid var(--primary-color)");

    VaultFilePath.html("");
    let pathContent = "";
    ItemContent[CurrentTabIndex].PathArray.forEach((path, index) => {
      pathContent += `<a id="vault-${index == 0 ? "folder" : "subfolder"}-${path.folderId}" class="vault-root-folder file-path-item" href="/vault/home/${
        path.folderId
      }">${path.text}</a> <span class="mt-5">›</span>`;
    });

    setFilePath(ItemContent[CurrentTabIndex].CurrentSubFolderId || ItemContent[CurrentTabIndex].CurrentSubFolderId, "", {
      customHtml: pathContent,
      reset: true,
    });

    VaultCurrentTab = $(`#tab-link-${CurrentLinkId}`);
    //Check if a item is selected and show if so
    if (ItemContent[CurrentTabIndex].CurrentItem) {
      const { CurrentItem } = ItemContent[CurrentTabIndex];
      //Set the prefetched item or fetch it again and reformat it
      CurrentItem.reference
        ? (tinymce.get("file-viewer-content").setContent(CurrentItem.value),
          fileViewerReference.text(CurrentItem.reference),
          fileViewerReference.val(CurrentItem.reference))
        : await FetchItem(CurrentItem.id).then((item) => SetItem(item?.data));

      ToggleItemPermissions(ItemContent[CurrentTabIndex]?.UserPermission, CurrentItem);
      VaultFileViewer.show();

      if (VaultItemPemrmissions.is(":visible")) {
        VaultItemPemrmissions.hide();
        tinymce.activeEditor.show();
      }
    } else {
      ItemContent[CurrentTabIndex].ListEl.show();
      VaultFileViewer.hide();
      VaultCurrentTab.html(ItemContent[CurrentTabIndex].TabName);
    }
  });
};
