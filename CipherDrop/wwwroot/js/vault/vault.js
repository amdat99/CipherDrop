let currentFolder = null;
let isFolder = true;
let lastId = 0;

document.addEventListener("DOMContentLoaded", function () {
  onRootFolderClick();
  // checkQueryForFolder();
});

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

const addItem = async (folderId) => {
  $("#addItemBtn").on("click", async function (e) {
    const fileReference = document.getElementById("fileReference").value;
    let value = document.getElementById("value").value;
    if (!fileReference || !value) return;
    //encrypt value
    const token = sessionStorage.getItem("Token");
    const adminsettings = await FetchAdminSettings();
    if (!token || !adminsettings) return;
    value = CryptoJS.AES.encrypt(value, token + adminsettings.keyEnd).toString();
    isFolder = false;

    const request = await RequestHandler({ url: "/vault/additem", method: "POST", body: { folderId, reference: fileReference, value, isFolder } });
    if (request.success) {
      CloseModal();
      VaultFileList.append(
        `<div id="root-file-${request.id}" class="vault-item p-3"><span>${fileReference}</span><span >${new Date().toLocaleDateString()}</span></div>`
      );
    } else {
      alert("An error occured");
    }
  });
};

const onRootFolderClick = () => {
  $(".vault-root-folder").on("click", async function (e) {
    const folderId = this.id.split("-")[2];
    showListViwer();
    if (window?.currentFolderId === folderId) return;
    window.currentFolderId = folderId;

    //Change style of selected folder
    currentFolder && (currentFolder.style = "");
    this.style = "background-color: #343a40; border : 1px solid var(--primary-color);";
    currentFolder = e.target;

    $("#file-path").html(`<a id="vault-folder-${folderId}" class="vault-root-folder file-path-item" "href="/vault/home/${folderId}">${this.innerText}</a>`);

    $(".file-path-item").on("click", function (e) {
      e.preventDefault();
      const folderId = this.id.split("-")[2];
      showListViwer();
      if (window.currentFolderId === folderId) return;
      setItems(folderId);
    });

    //Set items
    setItems(folderId);

    //Add event listener to add item button and show it
    DisplayAddItemBtnWithModal(folderId);

    //Add id to url
    window.history.pushState(null, null, `/vault/home/${folderId}`);
  });
};

const showListViwer = () => {
  VaultFileViewer.hide();
  VaultFileList.show();
};

const setItems = async (folderId) => {
  const items = await fetchFolderItems(folderId);
  if (!items) return;

  if (lastId === 0) VaultFileList.empty();

  items.forEach((item) => {
    VaultFileList.append(
      `<div id="item-${item.id}" class="vault-item p-3"><span>${item.reference}</span><span >${new Date(item.updatedAt).toLocaleDateString()}</span></div>`
    );
  });

  OnItemClick();
};

const DisplayAddItemBtnWithModal = (folderId) => {
  const addItemBtn = $("#vault-add-file");
  addItemBtn.show();
  addItemBtn.off("click");
  addItemBtn.on("click", function () {
    DisplayModal(
      `
      <div class="mb-3">
        <label for="fileReference" class="form-label">Reference</label>
        <input type="text" class="form-control" id="fileReference" name="fileReference" required>
      </div>
      <div class="mb-3">
        <label for="value" class="form-label">Value</label>
        <textarea class="form-control" id="value" name="value" required></textarea>
      </div>
      <div class="d-grid mt-4">
        <button type="button" id="addItemBtn" class="btn btn-primary btn-block">Add Item</button>
      </div>
      `,
      "90vw"
    );
    setTimeout(() => {
      addItem(folderId);
    }, 0);
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
