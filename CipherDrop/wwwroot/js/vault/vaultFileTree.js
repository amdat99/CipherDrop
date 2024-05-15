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

    const folder = isSubFolder ? $("#vault-" + folderId + "-item" + this.id.split("subfolder-slider")[1].split("-")[0]) : $(`#root-folder-${folderId}`);
    folder.append(formatSubItems(items, folderId));
    this.style.transform = "rotate(180deg)";
    SetFileTreeListeners();
    OnItemClick(true);
  });
};

SetFileTreeListeners();

const formatSubItems = (items, id) => {
  let itemsHtml = `<div class='folder-expanded-items' id='folder-expanded-${id}'>`;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    itemsHtml += `<div id="vault-${item.id}-item${id}" class="vault-item card-offset-hover vault-expanded-item folder-expandeditem-${id}">
        <div class="d-flex justify-content-between align-items-center fleex-direction-row">
          <span>${item.isFolder ? "📁" : "📄"} ${item.reference}</span>
          ${
            item.isFolder
              ? `<img class="folder-sliderdown" id="subfolder-slider${id}-${item.id}" src="https://www.svgrepo.com/show/80156/down-arrow.svg" style="width: 10px; height: 20px;" data--subfolder="${item.subFolderId}" />`
              : ""
          }
        </div>
        </div>`;
  }
  return itemsHtml + "</div>";
};
