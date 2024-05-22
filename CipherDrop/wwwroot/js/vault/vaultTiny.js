tinymce.init({
  selector: "#file-viewer-content",
  license_key: "gpl",
  height: $(".file-view").height() - 140 + "px",
  content_css: "/css/tiny.css",
  promotion: false,
  branding: false,
  highlight_on_focus: false,
  menubar: "edit view insert format tools table tc",
  skin: "oxide-dark",
  //contextmenu: "undo redo copy | inserttable format | cell row column deletetable | help",
  powerpaste_word_import: "clean",
  powerpaste_html_import: "clean",
  powerpaste_allow_local_images: true,
  plugins:
    "advlist autolink lists link image charmap preview anchor searchreplace visualblocks codesample importcss accordion autolink anchor fullscreen insertdatetime media table help wordcount mention",
  toolbar:
    "undo redo | formatselect | bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media pageembed | removeformat fullscreen",
  mentions: {
    source: function (query, process, delimiter) {
      console.log(query);
      if (delimiter === "@" || delimiter === "#") {
        $.getJSON("https://jsonplaceholder.typicode.com/users", function (data) {
          process(data);
        });
      }
    },
    queryBy: "name",
    delimiter: ["@", "#"],
    mentioned_style: "background-color: #2c2c2c; color: white; border: 1px solid #141414; padding: 2px; border-radius: 6px; cursor: pointer;",
    loading_text: "Loading...",
    loading_class: "spinner-border text-light",
    insert: function (item) {
      return '<span class="test" id="" contenteditable="false" style="' + this.options.mentioned_style + '">' + item.name + "</span>&nbsp;";
    },
  },
  file_browser_callback_types: "file image media",
  file_picker_types: "file image media",
  file_picker_callback: function (cb, value, meta) {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    //event listeners
    input.addEventListener(
      "change",
      (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          //set loading state
          const uploadToast = DisplayToast({
            message: "<div class='spinner-border text-light' role='status'></div> <span>Uploading file...</span>",
            type: "info",
            noTimeout: true,
          });
          const request = RequestHandler({ url: "/vault/uploadfile", method: "POST", data: { file: reader.result.split(",")[1] } });
          setTimeout(() => uploadToast.remove(), 100);
          if (!request?.success) return DisplayToast({ message: request?.message || "An error occured", type: "danger" });

          //handle data processing with a blob
          const id = "blobid" + new Date().getTime();
          const blobCache = tinymce.activeEditor.editorUpload.blobCache;
          const base64 = reader.result.split(",")[1];
          const blobInfo = blobCache.create(id, file, base64);
          blobCache.add(blobInfo);
          console.log(blobInfo);
          cb(blobInfo.blobUri(), { title: file.name, alt: file.name, text: file.name, textToDisplay: file.name });
          DisplayToast({ message: "File uploaded to attachment library", type: "success" });
        });
        reader.readAsDataURL(file);
      },
      false
    );
    input.click();
  },

  images_upload_handler: function (blobInfo, success, failure) {
    console.log(blobInfo, success, failure);
  },

  setup: function (editor) {
    editor.on("change", function (e) {
      OnVauleChange(e);
    });
    editor.on("input", function (e) {
      OnVauleChange(e);
    });
  },
});

setTimeout(() => {
  $(".tox-statusbar__help-text").css("visibility", "hidden");
}, 1000);
