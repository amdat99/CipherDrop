let dialog;
let modalbackdrop;
let closeModalFunctVar = null;

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

//Display a modal with the given content
const DisplayModal = ({ content, minWidth, buttonText, submitFunction, closeModalFunction = null }) => {
  dialog = document.createElement("dialog");
  modalbackdrop = document.createElement("div");
  modalbackdrop.classList.add("modal-backdrop");
  document.body.appendChild(modalbackdrop);
  dialog.innerHTML = `
  <div class="card p-2" style="width: ${minWidth || "300px"}; max-width: 800px;">
    <form class="card-body" id="modal-form">
        ${content}  
      <div class="d-grid mt-4">
        <button type="submit" id="modalSubmit" class="btn btn-primary btn-block">${buttonText || "Submit"}</button>
      </div>
    </form>
  </div>
  `;

  setModalListeners(submitFunction);
  if (closeModalFunction) closeModalFunctVar = closeModalFunction;
};

const setModalListeners = (submitFunction) => {
  //Set timeout to ensure the form is loaded before adding the event listener
  setTimeout(() => {
    document.getElementById("modal-form").addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("submit");
      submitFunction(e);
    });
    dialog.querySelector("input")?.focus();
  }, 100);

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
  document.getElementById("modalSubmit").removeEventListener("click", () => {});
  dialog.close();
  document.body.removeChild(dialog);
  document.body.removeChild(modalbackdrop);
  modalbackdrop = null;
  dialog = null;
  if (closeModalFunctVar) {
    closeModalFunctVar();
    closeModalFunctVar = null;
  }
};
