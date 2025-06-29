let qr;
const qrContainer = document.getElementById("qr-code");

// GENERATE
function generateQR(text) {
  const size = parseInt(document.getElementById("qr-size").value);
  const color = document.getElementById("qr-color").value;
  const bg = document.getElementById("bg-color").value;

  qrContainer.innerHTML = "";

  qr = new QRCode(qrContainer, {
    text: text,
    width: size,
    height: size,
    colorDark: color,
    colorLight: bg,
    correctLevel: QRCode.CorrectLevel.H
  });
}

document.getElementById("text-input").addEventListener("input", (e) => {
  const value = e.target.value.trim();
  if (value) generateQR(value);
  else qrContainer.innerHTML = "";
});

["qr-size", "qr-color", "bg-color"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    const val = document.getElementById("text-input").value.trim();
    if (val) generateQR(val);
  });
});

function downloadQR() {
  const img = qrContainer.querySelector("img") || qrContainer.querySelector("canvas");
  if (!img) return alert("Generate QR first.");
  const link = document.createElement("a");
  link.href = img.src || img.toDataURL("image/png");
  link.download = "qr-code.png";
  link.click();
}

// TOGGLE
const genTab = document.getElementById("gen-tab");
const decTab = document.getElementById("dec-tab");
const genSec = document.getElementById("generate-section");
const decSec = document.getElementById("decode-section");

genTab.onclick = () => {
  genSec.classList.remove("hidden");
  decSec.classList.add("hidden");
  genTab.classList.add("active");
  decTab.classList.remove("active");
};

decTab.onclick = () => {
  decSec.classList.remove("hidden");
  genSec.classList.add("hidden");
  decTab.classList.add("active");
  genTab.classList.remove("active");
};

// DECODE
document.getElementById("qr-upload").addEventListener("change", handleFile);
document.getElementById("drop-area").addEventListener("dragover", e => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
});
document.getElementById("drop-area").addEventListener("drop", e => {
  e.preventDefault();
  if (e.dataTransfer.files.length > 0) {
    handleFile({ target: { files: e.dataTransfer.files } });
  }
});

function handleFile(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) {
    return alert("Please upload a valid image.");
  }

  const reader = new FileReader();
  reader.onload = function () {
    const img = new Image();
    img.onload = function () {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, canvas.width, canvas.height);

      if (code) {
        document.getElementById("decoded-output").innerText = "Decoded: " + code.data;
      } else {
        document.getElementById("decoded-output").innerText = "No QR code found.";
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function copyDecodedText() {
  const output = document.getElementById("decoded-output").innerText.replace("Decoded: ", "");
  if (!output) return alert("Nothing to copy.");
  navigator.clipboard.writeText(output).then(() => alert("Copied!"));
}
