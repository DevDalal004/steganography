const imageInput = document.getElementById('imageInput');
const messageInput = document.getElementById('messageInput');
const downloadBtn = document.getElementById('downloadBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let image = new Image();

imageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      image.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

image.onload = function () {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
};

function textToBinary(text) {
  return text.split('').map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join('');
}

function binaryToText(binary) {
  let result = '';
  for (let i = 0; i < binary.length; i += 8) {
    let char = binary.substr(i, 8);
    if (char === '00000000') break;
    result += String.fromCharCode(parseInt(char, 2));
  }
  return result;
}

function encodeMessage() {
  let message = messageInput.value;
  if (!message) return alert('Enter a message.');

  message += '\0';
  let binary = textToBinary(message);

  ctx.drawImage(image, 0, 0);
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;

  if (binary.length > data.length / 4) {
    return alert('Message too long to encode.');
  }

  for (let i = 0; i < binary.length; i++) {
    let pixelIndex = i * 4;
    data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(binary[i]);
  }

  ctx.putImageData(imageData, 0, 0);
  downloadBtn.style.display = 'block';
}

function decodeMessage() {
  let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  let data = imageData.data;
  let binary = '';

  for (let i = 0; i < data.length; i += 4) {
    binary += (data[i] & 1).toString();
    if (binary.length % 8 === 0 && binary.slice(-8) === '00000000') break;
  }

  alert('Decoded Message: ' + binaryToText(binary));
}

function downloadImage() {
  const link = document.createElement('a');
  link.download = 'encoded_image.png';
  link.href = canvas.toDataURL();
  link.click();
}
