const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const revealItems = document.querySelectorAll(".reveal");
const reportForms = document.querySelectorAll("[data-report-form]");
const donationOpenButtons = document.querySelectorAll("[data-donation-open]");
const donationModal = document.querySelector("[data-donation-modal]");
const donationCloseButtons = document.querySelectorAll("[data-donation-close]");
const reportOpenButtons = document.querySelectorAll("[data-report-open]");
const reportModal = document.querySelector("[data-report-modal]");
const reportCloseButtons = document.querySelectorAll("[data-report-close]");
const reportTypeButtons = document.querySelectorAll("[data-report-type]");
const dropdownToggle = document.querySelector("[data-dropdown-toggle]");
const dropdown = dropdownToggle?.closest(".nav-dropdown");
const identityInputs = document.querySelectorAll("[data-identity-input]");
const cpfFields = document.querySelectorAll("[data-cpf-field]");
const cpfInputs = document.querySelectorAll("[data-cpf]");
const identityWarnings = document.querySelectorAll("[data-identity-warning]");
let lastFocusedElement = null;

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 18);
}

function closeDropdown() {
  dropdown?.classList.remove("is-open");
  dropdownToggle?.setAttribute("aria-expanded", "false");
}

function closeMenu() {
  menu?.classList.remove("is-open");
  menuToggle?.classList.remove("is-open");
  menuToggle?.setAttribute("aria-expanded", "false");
  menuToggle?.setAttribute("aria-label", "Abrir menu");
  closeDropdown();
}

menuToggle?.addEventListener("click", () => {
  const isOpen = !menu?.classList.contains("is-open");
  menu?.classList.toggle("is-open", isOpen);
  menuToggle.classList.toggle("is-open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
});

dropdownToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = !dropdown?.classList.contains("is-open");
  dropdown?.classList.toggle("is-open", isOpen);
  dropdownToggle.setAttribute("aria-expanded", String(isOpen));
});

menu?.addEventListener("click", (event) => {
  if (event.target.matches("a")) closeMenu();
});

document.addEventListener("click", (event) => {
  if (!dropdown?.contains(event.target)) closeDropdown();
});

function openModal(modal, event) {
  event?.preventDefault();
  if (!modal) return;
  lastFocusedElement = document.activeElement;
  modal.hidden = false;
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close")?.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.hidden = true;
  if ([donationModal, reportModal].every((item) => !item || item.hidden)) {
    document.body.classList.remove("modal-open");
  }
  lastFocusedElement?.focus();
}

donationOpenButtons.forEach((button) => button.addEventListener("click", (event) => openModal(donationModal, event)));
donationCloseButtons.forEach((button) => button.addEventListener("click", () => closeModal(donationModal)));
reportOpenButtons.forEach((button) => button.addEventListener("click", (event) => openModal(reportModal, event)));
reportCloseButtons.forEach((button) => button.addEventListener("click", () => closeModal(reportModal)));

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  closeDropdown();
  if (donationModal && !donationModal.hidden) closeModal(donationModal);
  if (reportModal && !reportModal.hidden) closeModal(reportModal);
});

function setReportType(type) {
  const isIdentified = type === "identified";
  reportTypeButtons.forEach((button) => {
    const isActive = button.dataset.reportType === type;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  identityInputs.forEach((input) => {
    input.required = isIdentified;
    if (!isIdentified) input.value = "";
  });
  cpfFields.forEach((field) => {
    field.hidden = !isIdentified;
  });
  cpfInputs.forEach((input) => {
    input.required = isIdentified;
    if (!isIdentified) input.value = "";
  });
  identityWarnings.forEach((warning) => {
    warning.hidden = !isIdentified;
  });
}

reportTypeButtons.forEach((button) => {
  button.addEventListener("click", () => setReportType(button.dataset.reportType));
});
setReportType("anonymous");

window.addEventListener("scroll", updateHeader);
updateHeader();

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.14 }
  );
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

cpfInputs.forEach((cpfInput) => {
  cpfInput.addEventListener("input", () => {
    const digits = cpfInput.value.replace(/\D/g, "").slice(0, 11);
    const parts = [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 9), digits.slice(9, 11)].filter(Boolean);
    cpfInput.value = parts.length > 3 ? `${parts[0]}.${parts[1]}.${parts[2]}-${parts[3]}` : parts.join(".");
  });
});

document.querySelectorAll("[data-file-input]").forEach((fileInput) => {
  fileInput.addEventListener("change", () => {
    const fileLabel = fileInput.closest(".file-field")?.querySelector("[data-file-label]");
    const total = fileInput.files.length;
    if (!fileLabel) return;
    fileLabel.textContent = !total
      ? "Nenhum arquivo selecionado"
      : total === 1
        ? fileInput.files[0].name
        : `${total} arquivos selecionados`;
  });
});

reportForms.forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.querySelector("[data-report-message]");
    const fileLabel = form.querySelector("[data-file-label]");
    if (message) {
      message.textContent = "Denúncia registrada para demonstração. Em um site real, estes dados seriam enviados com sigilo.";
    }
    form.reset();
    setReportType("anonymous");
    if (fileLabel) fileLabel.textContent = "Nenhum arquivo selecionado";
  });
});
