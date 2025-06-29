function generateQR() {
  const qrContainer = document.getElementById("qr-code");
  const input = document.getElementById("text-input").value.trim();

  // Clear old QR
  qrContainer.innerHTML = "";

  if (input === "") {
    alert("Please enter some text or URL to generate QR code.");
    return;
  }

  new QRCode(qrContainer, {
    text: input,
    width: 200,
    height: 200,
  });
}
