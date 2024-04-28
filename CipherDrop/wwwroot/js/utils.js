var dialog;
const RequestHandler = async ({ method, url, body }) => {
  const params = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      RequestVerificationToken: document.getElementById("RequestVerificationToken").value,
    },
    useCredentials: true,
  };

  if (body) {
    params.body = JSON.stringify(body);
  }

  try {
    const request = await fetch(url, params);
    const data = await request.json();
    return data;
  } catch (error) {
    return { success: false, error: error };
  }
};

const DisplayModal = (content, minWidth) => {
  dialog = document.createElement("dialog");
  const modalbackdrop = document.createElement("div");
  modalbackdrop.classList.add("modal-backdrop");
  document.body.appendChild(modalbackdrop);
  dialog.innerHTML = `
  <div class="card p-2" style="width: ${minWidth || "300px"}; max-width: 800px;">
    <div class="card-body" >
        ${content}
    </div>
  </div>
  `;

  dialog.addEventListener("click", function (e) {
    //check if the click was outside the card
    if (e.target !== dialog) return;
    dialog.close();
    document.body.removeChild(dialog);
    document.body.removeChild(modalbackdrop);
  });
  document.body.appendChild(dialog);
  dialog.showModal();
};

const CloseModal = () => {
  dialog.close();
  document.body.removeChild(dialog);
  document.body.removeChild(document.querySelector(".modal-backdrop"));
};
