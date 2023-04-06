const scanSection = document.querySelector("section.scannen")
let cameraStatus = 0;
let scanInterval;

let formats;
BarcodeDetector.getSupportedFormats().then((arr => formats = arr));
const barcodeDetector = new BarcodeDetector({ formats });

function createVideo() {
    if (cameraStatus == 0) {
        const videoElement = document.createElement("video");
        videoElement.setAttribute("id", "video");
        videoElement.autoplay = true;
        scanSection.appendChild(videoElement);
        scanSection.classList.add("enable");
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            const constraints = { 
                video: true,
                audio: false
            }
            navigator.mediaDevices.getUserMedia(constraints).then(stream => videoElement.srcObject = stream);
        }
        scanInterval = setInterval(scanProducts, 3000)
        cameraStatus = 1;
    } else {
        const video = document.querySelector("#video");
        const mediaStream = video.srcObject;
        const tracks = mediaStream.getTracks();
        tracks.forEach(track => track.stop());
        scanSection.classList.remove("enable");
        clearInterval(scanInterval)
        scanSection.innerHTML = ""
        cameraStatus = 0;
    }
}

function scanProducts() {
    const video = document.querySelector("#video");

    barcodeDetector
    .detect(video)
    .then((barcodes) => {
        if (barcodes.length == 0) {
            console.log("No barcode found...")
        } else {
            barcodes.forEach((barcode) => {
                console.log(barcode.rawValue);

                const video = document.querySelector("#video");
                const mediaStream = video.srcObject;
                const tracks = mediaStream.getTracks();
                tracks.forEach(track => track.stop());
                scanSection.classList.remove("enable");
                clearInterval(scanInterval)
                scanSection.innerHTML = ""
                cameraStatus = 0;
        
                window.location.hash = "#product/" + barcode.rawValue;
            });
        }
    })
    .catch((err) => {
        console.log(err);
    });
}

createVideo();