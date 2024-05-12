let dialog;
let modalbackdrop;
let closeModalFunctVar = null;
let toastContainer;
let tooltipList = [];

/**
 * Handles Api requests, automatically adds the RequestVerificationToken to the headers
 * @param {object} param0 - The request parameters
 * @param {string} param0.method - The request method
 * @param {string} param0.url - The request url
 * @param {object} [param0.body] - The request body
 * @returns {Promise<object>} - The response data
 */
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
    if (request.status === 401) {
      window.location.href = "/login";
    }
    const data = await request.json();
    return data;
  } catch (error) {
    return { success: false, error: error };
  }
};

/**
 * Display a modal
 * @param {string} content - The content to display in the modal
 * @param {string} [minWidth] - The minimum width of the modal
 * @param {string} [maxWidth] - The maximum width of the modal
 * @param {string} [buttonText] - The text to display on the submit button
 * @param {function} submitFunction - The function to run when the form is submitted
 * @param {function} [closeModalFunction] - The function to run when the modal is closed
 * @param {boolean} [backdropClose] - Whether to close the modal when the backdrop is clicked
 * @param {string} [buttonStyle] - The style of the button
 * @returns {void}
 */
const DisplayModal = ({
  content,
  minWidth = "300px",
  maxWidth = "800px",
  buttonText,
  submitFunction,
  closeModalFunction = null,
  backdropClose = true,
  buttonStyle = "",
}) => {
  dialog = document.createElement("dialog");
  modalbackdrop = document.createElement("div");
  modalbackdrop.classList.add("modal-backdrop");
  document.body.appendChild(modalbackdrop);
  dialog.innerHTML = `
  <div class="card p-2" style="width: ${minWidth}; max-width: ${maxWidth}">
    <form class="card-body" id="modal-form">
        ${content}  
      <div class="d-grid mt-4">
        <button type="submit" id="modalSubmit" class="btn btn-primary btn-block" style="${buttonStyle}">${buttonText || "Submit"}</button>
      </div>
    </form>
  </div>
  `;

  setModalListeners(submitFunction, backdropClose);
  if (closeModalFunction) closeModalFunctVar = closeModalFunction;
};

const setModalListeners = (submitFunction, backdropClose) => {
  //Set timeout to ensure the form is loaded before adding the event listener
  setTimeout(() => {
    document.getElementById("modal-form").addEventListener("submit", function (e) {
      e.preventDefault();
      console.log("submit");
      submitFunction(e);
    });
    dialog.querySelector("input")?.focus();
  }, 100);

  if (backdropClose) {
    dialog.addEventListener("click", function (e) {
      //check if the click was outside the card
      if (e.target !== dialog) return;
      CloseModal();
    });
  }
  document.body.appendChild(dialog);
  dialog.showModal();
};

const CloseModal = () => {
  document.getElementById("modalSubmit").removeEventListener("click", () => {});
  dialog.close();
  document.body.removeChild(dialog);
  document.body.removeChild(modalbackdrop);
  modalbackdrop = null;
  currentUser = null;
  dialog = null;
  if (closeModalFunctVar) {
    closeModalFunctVar();
    closeModalFunctVar = null;
  }
};

/**
 * Display a toast message
 * @param {string} message - The message to display
 * @param {'success' | 'danger' | 'warning' | 'info'} type - The type of toast to display
 */
const DisplayToast = ({ message, type }) => {
  if (!toastContainer) toastContainer = document.querySelector(".toast-container");
  const toast = document.createElement("div");
  toast.classList.add("toast", `bg-${type}`, "text-white");
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body font-weight-bold text-white" style="max-width: 350px; font-size: 1.05rem;">
        ${message}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;
  //append to toast container
  toastContainer.appendChild(toast);
  new bootstrap.Toast(toast).show();
  setTimeout(
    () => {
      toast.remove();
    },
    type === "danger" ? 5000 : 3000
  );
};

const InitialiseTooltips = () => {
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
};

const ToggleSiteLoader = (show = true) => {
  const loader = document.getElementById("site-loader");
  if (show) {
    loader.style.display = "block";
  } else {
    loader.style.display = "none";
  }
};
