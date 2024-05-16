const SetFileTreeListeners = () => {
  $(".folder-sliderdown").off("click");
  $(".folder-sliderdown").on("click", async function (e) {
    e.stopPropagation();
    if (this.style.transform === "rotate(180deg)") {
      $(`#folder-expanded-${this.id.split("-")[2]}`).remove();
      return (this.style.transform = "rotate(0deg)");
    }

    const isSubFolder = this.id.startsWith("subfolder");
    const folderId = this.id.split("-")[2];
    const subfolderId = this.dataset?.Subfolder;
    const items = await FetchFolderItems(subfolderId || folderId);
    if (!items) return;

    const rootFolderId = this.dataset?.Rootfolder;
    const folder = isSubFolder ? $("#vault-" + folderId + "-item" + this.id.split("subfolder-slider")[1].split("-")[0]) : $(`#root-folder-${folderId}`);
    folder.append(formatSubItems(items, folderId, rootFolderId));
    this.style.transform = "rotate(180deg)";
    SetFileTreeListeners();
    SetFilePathListeners();
    OnItemClick(true);
  });
};

SetFileTreeListeners();

const formatSubItems = (items, id, rootFolderId = null) => {
  let itemsHtml = `<div class='folder-expanded-items' id='folder-expanded-${id}'>`;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const divId = item.isFolder ? `vaultsubfolder-${item.id}-${id}` : `vaultitem-${item.id}-${id}`;
    itemsHtml += `<div id="${divId}" class="${
      item.isFolder ? "file-path-item" : "vault-item"
    } card-offset-hover vault-expanded-item folder-expandeditem-${id}" data--rootfolder="${rootFolderId || id}" data--subfolder="${item?.subFolderId}">
        <div class="d-flex justify-content-between align-items-center fleex-direction-row">
          <span>${item.isFolder ? "📁" : "📄"} ${item.reference}</span>
          ${
            item.isFolder
              ? `<img class="folder-sliderdown" id="subfolder-slider${id}-${
                  item.id
                }" src="https://www.svgrepo.com/show/80156/down-arrow.svg" style="width: 10px; height: 20px;" data--subfolder="${
                  item.subFolderId
                }" data--rootfolder="${rootFolderId || id}" />`
              : ""
          }
        </div>
        </div>`;
  }
  return itemsHtml + "</div>";
};

const GetFolderPath = (element) => {
  let folderPath = [];
  let currentElement = $(element);

  // Traverse up the DOM tree until reaching the root folder
  while (currentElement.length && !currentElement.hasClass("file-path")) {
    const id = currentElement.attr("id");
    const reference = currentElement.find("span").first().text().trim(); // Get the text of the first span element
    if (id && (id.startsWith("vaultsubfolder") || id.startsWith("root-folder")) && reference) {
      folderPath.unshift({ id, reference, folderId: id.startsWith("root-folder") ? id.split("-")[2] : currentElement.data("Subfolder") });
    }
    currentElement = currentElement.parent();
  }

  return folderPath;
};
