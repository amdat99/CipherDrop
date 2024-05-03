let currentFolder = null;
let isFolder = true;
let lastId = 0;

const OnRootFolderClick = () => {
  $(".vault-root-folder").on("click", async function (e) {
    const folderId = this.id.split("-")[2];
    showListViwer();
    //Check if the folder is already selected if not set items for the folder
    if (window?.currentFolderId === folderId) return;
    window.currentFolderId = folderId;

    //Change style of selected folder
    currentFolder && (currentFolder.style = "");
    this.style = "background-color: #343a40; border : 1px solid var(--primary-color);";
    currentFolder = e.target;

    //Set fiolder path and and add listener to folder name in path
    $("#file-path").html(`<a id="vault-folder-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${this.innerText}</a>`);

    $(".file-path-item").off("click");
    $(".file-path-item").on("click", function (e) {
      e.preventDefault();
      const folderId = this.id.split("-")[2];
      showListViwer();

      //Check if the folder is already selected if not set items for the folder. Pass true to remove old event listener
      if (window.currentFolderId === folderId) return;
      setItems(folderId, true);
    });

    //Detch folder items and render them if any
    setItems(folderId);

    //Add event listener to add item button and show the button
    DisplayAddItemBtnWithModal(folderId);

    //Add id to url
    window.history.pushState(null, null, `/vault/home/${folderId}`);
  });
};

//Run the function on load
OnRootFolderClick();

const setItems = async (folderId, removeItemEListener = false) => {
  const items = await fetchFolderItems(folderId);
  if (!items) return;

  if (lastId === 0) VaultFileList.empty();

  items.forEach((item) => {
    VaultFileList.append(
      `<div id="item-${item.id}" class="vault-item p-3"><span>${item.reference}</span><span >${new Date(item.updatedAt).toLocaleDateString()}</span></div>`
    );
  });

  OnItemClick(removeItemEListener);
};

const DisplayAddItemBtnWithModal = (folderId) => {
  const addItemBtn = $("#vault-add-file");
  addItemBtn.show();
  addItemBtn.off("click");
  addItemBtn.on("click", function () {
    DisplayModal({
      content: `
      <div class="mb-3">
        <label for="fileReference" class="form-label">Reference</label>
        <input type="text" class="form-control" id="fileReference" name="fileReference" required>
      </div>
      <div class="mb-3">
        <label for="value" class="form-label">Value</label>
        <textarea class="form-control" id="value" name="value" required></textarea>
      </div>
      `,
      buttonText: "Add Item",
      submitFunction: () => AddItem(folderId),
      minWidth: "90vw",
    });
  });
};

const fetchFolderItems = async (folderId, reset = true) => {
  try {
    if (reset) lastId = 0;
    const request = await RequestHandler({ url: `/vault/vaultitems/${folderId}?llastId=${lastId}`, method: "GET" });
    if (request.success) {
      return request?.data || [];
    }
    return null;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const checkQueryForFolder = async () => {
  const url = new URL(window.location.href);
  const lastParam = url.pathname.split("/").pop();
  if (lastParam === "home") return;
  const folderId = lastParam;

  const folder = await fetchFolderItems(folderId);
  if (!folder) return;
  isFolder = folder[0].isFolder;

  setItems(folderId);
};

const showListViwer = () => {
  VaultFileViewer.hide();
  VaultFileList.show();
};
