const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const imageInput = document.getElementById('imageInput');
const messageInput = document.getElementById('messageInput');
const downloadBtn = document.getElementById('downloadBtn');

let image = new Image();

// Load selected image
imageInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

// Draw image on canvas after loading
image.onload = function() {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);
};

function textToBinary(text) {
    return text.split('')
        .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
        .join('');
}

function binaryToText(binary) {
    let text = '';
    for (let i = 0; i < binary.length; i += 8) {
        let charCode = parseInt(binary.substr(i, 8), 2);
        if (charCode === 0) break; // Stop at null terminator
        text += String.fromCharCode(charCode);
    }
    return text;
}

function encodeMessage() {
    let message = messageInput.value;
    if (!message) {
        alert("Enter a message to encode.");
        return;
    }

    message += '\0'; // Add NULL character as end marker
    let binaryMessage = textToBinary(message);
    
    ctx.drawImage(image, 0, 0);
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    if (binaryMessage.length > data.length / 4) {
        alert("Message is too long to encode in this image.");
        return;
    }

    for (let i = 0; i < binaryMessage.length; i++) {
        let pixelIndex = i * 4;
        data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(binaryMessage[i]); // Modify LSB of Red channel
    }

    ctx.putImageData(imageData, 0, 0);
    downloadBtn.style.display = 'block';
}

function decodeMessage() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    let binaryMessage = '';

    for (let i = 0; i < data.length; i += 4) {
        binaryMessage += (data[i] & 1).toString(); // Read LSB from Red channel
        if (binaryMessage.length % 8 === 0 && binaryMessage.slice(-8) === '00000000') {
            break; // Stop at NULL terminator
        }
    }

    let message = binaryToText(binaryMessage);
    alert("Decoded Message: " + message);
}

function downloadImage() {
    const link = document.createElement('a');
    link.download = 'encoded_image.png';
    link.href = canvas.toDataURL();
    link.click();
}
