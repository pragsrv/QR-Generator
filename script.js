let qr;
const qrContainer = document.getElementById("qr-code");

function generateQR(text) {
  const size = parseInt(document.getElementById("qr-size").value) || 200;
  const color = document.getElementById("qr-color").value;
  const bgColor = document.getElementById("bg-color").value;

  qrContainer.innerHTML = "";

  qr = new QRCode(qrContainer, {
    text: text,
    width: size,
    height: size,
    colorDark: color,
    colorLight: bgColor,
    correctLevel: QRCode.CorrectLevel.H
  });
}

// Live generation as user types
document.getElementById("text-input").addEventListener("input", (e) => {
  const value = e.target.value.trim();
  if (value) {
    generateQR(value);
  } else {
    qrContainer.innerHTML = "";
  }
});

// Regenerate if color/size changes
["qr-size", "qr-color", "bg-color"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => {
    const value = document.getElementById("text-input").value.trim();
    if (value) generateQR(value);
  });
});

// Download QR
function downloadQR() {
  const img = qrContainer.querySelector("img") || qrContainer.querySelector("canvas");
  if (!img) return alert("Please generate a QR code first.");

  const link = document.createElement("a");
  link.href = img.src || img.toDataURL("image/png");
  link.download = "qr-code.png";
  link.click();
}
