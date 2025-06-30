let history = [];
const qrContainer = document.getElementById("qr-code");
const historyList = document.getElementById("history-log");
const decodedOutput = document.getElementById("decoded-output");
const dropArea = document.getElementById("drop-area");
const qrUpload = document.getElementById("qr-upload");

function getPreset(style) {
  switch(style) {
    case "blue": return { color:"#1e40af", bg:"#dbeafe" };
    case "purple": return { color:"#7c3aed", bg:"#ede9fe" };
    case "green": return { color:"#059669", bg:"#d1fae5" };
    case "pink": return { color:"#db2777", bg:"#fce7f3" };
    case "orange": return { color:"#ea580c", bg:"#fed7aa" };
    case "custom": return {
      color: document.getElementById("qr-color").value,
      bg: document.getElementById("bg-color").value
    };
    default: return { color:"#000000", bg:"#ffffff" };
  }
}

function addToHistory(msg) {
  history.unshift({ msg, time: new Date().toLocaleTimeString() });
  if(history.length > 10) history = history.slice(0,10);
  updateHistory();
}

function updateHistory() {
  historyList.innerHTML = history.length === 0
    ? '<li class="history-item">No recent activity</li>'
    : history.map(h =>
        `<li class="history-item">${h.time} - ${h.msg}</li>`
      ).join("");
}

async function generateQR(text, style="default") {
  if(!text.trim()) {
    qrContainer.innerHTML = '<div class="empty-state">Enter text above to generate QR code</div>';
    return;
  }
  const preset = getPreset(style);
  qrContainer.innerHTML = "";
  const wrapper = document.createElement("div");
  qrContainer.appendChild(wrapper);
  new QRCode(wrapper, {
    text: text,
    width: 200,
    height: 200,
    colorDark: preset.color,
    colorLight: preset.bg,
    correctLevel: QRCode.CorrectLevel.H
  });
  addToHistory(`Generated QR for: ${text.substring(0,30)}${text.length>30?"...":""}`);
}

document.getElementById("text-input").addEventListener("input", async e => {
  const val = e.target.value;
  await generateQR(val, document.getElementById("style-preset").value);
});

document.getElementById("style-preset").addEventListener("change", async e => {
  document.getElementById("custom-colors").style.display = e.target.value === "custom" ? "block" : "none";
  const v=document.getElementById("text-input").value;
  if(v) await generateQR(v, e.target.value);
});

document.getElementById("qr-color").addEventListener("change", () => {
  if(document.getElementById("style-preset").value==="custom") generateQR(document.getElementById("text-input").value, "custom");
});
document.getElementById("bg-color").addEventListener("change", () => {
  if(document.getElementById("style-preset").value==="custom") generateQR(document.getElementById("text-input").value, "custom");
});

function downloadQR() {
  const canvas = qrContainer.querySelector("canvas");
  if(!canvas) return showError("Generate a QR code first");
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = "qr-code.png";
  a.click();
  addToHistory("Downloaded QR code");
}

function clearQR() {
  qrContainer.innerHTML = '<div class="empty-state">Enter text above to generate QR code</div>';
  document.getElementById("text-input").value = "";
}

function switchTab(tab) {
  document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active"));
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active"));
  document.getElementById(tab + "-tab").classList.add("active");
  document.getElementById(tab + "-section").classList.add("active");
}

document.getElementById("generate-tab").addEventListener("click", ()=> switchTab("generate"));
document.getElementById("decode-tab").addEventListener("click", ()=> switchTab("decode"));

document.getElementById("theme-toggle").addEventListener("click", ()=>{
  const curr = document.documentElement.getAttribute("data-theme");
  const theme = curr === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("theme-icon").textContent = theme === "dark" ? "☀️" : "🌙";
});

function showError(msg) {
  const e = document.getElementById("error-message");
  if(!e) return;
  e.textContent = msg;
  e.classList.add("show");
  setTimeout(()=> e.classList.remove("show"),3000);
}

qrUpload.addEventListener("change", handleFile);
dropArea.addEventListener("dragover", e=> {
  e.preventDefault();
  dropArea.style.borderColor="var(--accent-color)";
});
dropArea.addEventListener("dragleave", ()=> dropArea.style.borderColor="var(--border-color)");
dropArea.addEventListener("drop", e=>{
  e.preventDefault();
  dropArea.style.borderColor="var(--border-color)";
  handleFile({ target: { files: e.dataTransfer.files } });
});
dropArea.addEventListener("click", () => qrUpload.click());

function handleFile(e) {
  const f = e.target.files[0];
  if(!f || !f.type.startsWith("image/")) return showError("Please upload a valid image file");
  const r = new FileReader();
  r.onload = () => {
    const img=document.createElement("img");
    img.src = r.result;
    img.onload = () => {
      const c=document.createElement("canvas");
      c.width=img.width; c.height=img.height;
      const ctx=c.getContext("2d");
      ctx.drawImage(img,0,0);
      const code = jsQR(ctx.getImageData(0,0,c.width,c.height).data, c.width, c.height);
      if(code && code.data) {
        decodedOutput.textContent = code.data;
        addToHistory(`Decoded: ${code.data.substring(0,30)}${code.data.length>30?"...":""}`);
      } else {
        decodedOutput.textContent = "No QR code found in the image";
        showError("No QR code found in the image");
      }
    };
  };
  r.readAsDataURL(f);
}

function copyDecodedText() {
  const t = decodedOutput.textContent;
  if(!t || t.includes("appears here")) return showError("No text to copy");
  navigator.clipboard.writeText(t).then(()=>{
    document.getElementById("copy-success").classList.add("show");
    setTimeout(()=> document.getElementById("copy-success").classList.remove("show"),2000);
    addToHistory("Copied decoded text");
  }).catch(()=> showError("Failed to copy text"));
}

function clearDecoded() {
  decodedOutput.textContent = "Decoded text will appear here...";
  qrUpload.value = "";
}

document.addEventListener("DOMContentLoaded", ()=>{
  const t = document.documentElement.getAttribute("data-theme") || "light";
  document.getElementById("theme-icon").textContent = t === "dark" ? "☀️" : "🌙";
});