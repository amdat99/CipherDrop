tinymce.init({
  selector: "#file-viewer-content",
  license_key: "gpl",
  height: $(".file-view").height() - 173 + "px",
  content_css: "/css/tiny.css",
  promotion: false,
  branding: false,
  highlight_on_focus: false,
  menubar: "edit view insert format tools table tc",
  //contextmenu: "undo redo copy | inserttable format | cell row column deletetable | help",
  powerpaste_word_import: "clean",
  powerpaste_html_import: "clean",
  powerpaste_allow_local_images: true,
  plugins:
    "advlist autolink lists link image charmap preview anchor searchreplace visualblocks code fullscreen insertdatetime media table help wordcount mention emoticons",
  toolbar:
    "undo redo | formatselect | bold italic backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | media pageembed emoticons | removeformat fullscreen",
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
    mentioned_style: "background-color: #212529; color: white; border: 1px solid #141414; padding: 2px; border-radius: 6px;",
    // loading_text: '',
    // loading_class: 'mentions-loader',
    insert: function (item) {
      return '<span class="test" contenteditable="false" style="' + this.options.mentioned_style + '">' + item.name + "</span>&nbsp;";
    },
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
