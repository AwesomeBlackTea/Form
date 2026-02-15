const dataForm = document.getElementById("dataForm");
const position = document.getElementById("position");
const rank = document.getElementById("rank");
const surname = document.getElementById("surname");
const toggle4 = document.getElementById("toggle4");
const toggle5 = document.getElementById("toggle5");
const toggle6 = document.getElementById("toggle6");
const section4 = document.getElementById("section4");
const section5 = document.getElementById("section5");
const section6 = document.getElementById("section6");
const cloudSlider = document.getElementById("cloudSlider");
const cloudValue = document.getElementById("cloudValue");
const attachmentList = document.getElementById("attachmentList");
const attachmentInput = document.getElementById("attachmentInput");
const attachmentBtn = document.getElementById("attachmentBtn");
const resultBtn = document.getElementById("resultBtn");
const shareBtn = document.getElementById("shareBtn");
const copyBtn = document.getElementById("copyBtn");
const previewModal = document.getElementById("previewModal");
const previewModalContent = document.getElementById("previewModalContent");
const previewModalImages = document.getElementById("previewModalImages");
const previewModalClose = document.getElementById("previewModalClose");

toggle4.onchange = () => section4.classList.toggle("is-visible", toggle4.checked);
toggle5.onchange = () => section5.classList.toggle("is-visible", toggle5.checked);
toggle6.onchange = () => section6.classList.toggle("is-visible", toggle6.checked);
section4.classList.toggle("is-visible", toggle4.checked);
section5.classList.toggle("is-visible", toggle5.checked);
section6.classList.toggle("is-visible", toggle6.checked);

function updateCloudSliderFill() {
  const min = 1;
  const max = 10;
  const pct = ((cloudSlider.value - min) / (max - min)) * 100;
  cloudSlider.style.setProperty("--range-pct", pct + "%");
  cloudValue.textContent = cloudSlider.value;
}
cloudSlider.oninput = updateCloudSliderFill;
updateCloudSliderFill();

let selectedFiles = [];

function renderAttachmentList() {
  attachmentList.textContent = "";
  selectedFiles.forEach((f, i) => {
    const item = document.createElement("div");
    item.className = "attachment-item";
    const nameSpan = document.createElement("span");
    nameSpan.className = "attachment-filename";
    nameSpan.textContent = f.name;
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "attachment-remove";
    removeBtn.innerHTML = "&times;";
    removeBtn.title = "Видалити";
    removeBtn.onclick = () => {
      selectedFiles.splice(i, 1);
      renderAttachmentList();
    };
    item.appendChild(nameSpan);
    item.appendChild(removeBtn);
    attachmentList.appendChild(item);
  });
}

attachmentBtn.onclick = () => attachmentInput.click();
attachmentInput.onchange = () => {
  selectedFiles = selectedFiles.concat(Array.from(attachmentInput.files));
  renderAttachmentList();
  attachmentInput.value = "";
};

const saved = JSON.parse(localStorage.getItem("reportData") || "{}");

position.value = saved.position || "";
rank.value = saved.rank || "";
surname.value = saved.surname || "";

function saveCore() {
  localStorage.setItem("reportData", JSON.stringify({
    position: position.value,
    rank: rank.value,
    surname: surname.value
  }));
}

position.oninput = saveCore;
rank.oninput = saveCore;
surname.oninput = saveCore;

function buildReport() {
  const formData = new FormData(dataForm);
  const data = Object.fromEntries(formData.entries());

  let report = "";

  if (data.position) report += `${data.position}\n`;
  if (data.rank) report += `${data.rank}\n`;
  if (data.surname) report += `${data.surname}\n`;

  if (toggle4.checked) report += `${data.message || ""}\n`;
  if (toggle5.checked && data.status) report += `${data.status}\n`;

  if (toggle6.checked) {
    report += `Хмарнiсть: ${data.cloudiness}\n`;
    if (data.height) report += `Висота: ${data.height}\n`;
    if (data.visibility) report += `Видимість: ${data.visibility}\n`;
  }

  return report.trim();
}

let previewObjectUrls = [];

resultBtn.onclick = () => {
  const text = buildReport();
  previewModalContent.textContent = text || "(порожньо)";
  previewModalImages.innerHTML = "";
  previewObjectUrls.forEach((u) => URL.revokeObjectURL(u));
  previewObjectUrls = [];
  for (const file of selectedFiles) {
    if (!file.type.startsWith("image/")) continue;
    const url = URL.createObjectURL(file);
    previewObjectUrls.push(url);
    const img = document.createElement("img");
    img.src = url;
    img.alt = file.name;
    previewModalImages.appendChild(img);
  }
  previewModal.classList.add("is-open");
  previewModal.setAttribute("aria-hidden", "false");
};

previewModalClose.onclick = () => {
  previewModal.classList.remove("is-open");
  previewModal.setAttribute("aria-hidden", "true");
  previewObjectUrls.forEach((u) => URL.revokeObjectURL(u));
  previewObjectUrls = [];
};

previewModal.onclick = (e) => {
  if (e.target === previewModal) {
    previewModal.classList.remove("is-open");
    previewModal.setAttribute("aria-hidden", "true");
    previewObjectUrls.forEach((u) => URL.revokeObjectURL(u));
    previewObjectUrls = [];
  }
};

copyBtn.onclick = async () => {
  const text = buildReport();
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      throw new Error("no clipboard");
    }
  } catch (e) {
    const ta = document.createElement("textarea");
    ta.className = "clipboard-helper";
    ta.value = text;
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
  alert("Скопiйовано 👍");
};

shareBtn.onclick = async () => {
  if (!navigator.share) return;
  const text = buildReport();
  const files = selectedFiles.slice();
  const payload = files.length ? { text, files } : { text };
  try {
    await navigator.share(payload);
  } catch (err) {
    if (err.name !== "AbortError") throw err;
  }
};
