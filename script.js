document.addEventListener("DOMContentLoaded", function () {
  // Elements
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");
  const controls = document.getElementById("controls");
  const imagePreviews = document.getElementById("imagePreviews");
  const originalCanvas = document.getElementById("originalCanvas");
  const resultCanvas = document.getElementById("resultCanvas");
  const colorPicker = document.getElementById("colorPicker");
  const colorPreview = document.getElementById("colorPreview");
  const tolerance = document.getElementById("tolerance");
  const toleranceValue = document.getElementById("toleranceValue");
  const removeBtn = document.getElementById("removeBtn");
  const downloadBtn = document.getElementById("downloadBtn");
  const resetBtn = document.getElementById("resetBtn");

  // Context
  const originalCtx = originalCanvas.getContext("2d");
  const resultCtx = resultCanvas.getContext("2d");

  // Variables
  let originalImage = null;

  // Event Listeners
  uploadArea.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileSelect);
  uploadArea.addEventListener("dragover", handleDragOver);
  uploadArea.addEventListener("dragleave", handleDragLeave);
  uploadArea.addEventListener("drop", handleDrop);
  colorPicker.addEventListener("input", updateColorPreview);
  tolerance.addEventListener("input", updateToleranceValue);
  removeBtn.addEventListener("click", removeBackground);
  downloadBtn.addEventListener("click", downloadResult);
  resetBtn.addEventListener("click", resetApp);

  // Initialize color preview
  updateColorPreview();

  // Functions
  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add("active");
  }

  function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove("active");
  }

  function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove("active");

    const file = e.dataTransfer.files[0];
    if (file && file.type.match("image.*")) {
      processImage(file);
    }
  }

  function processImage(file) {
    const reader = new FileReader();

    reader.onload = function (event) {
      originalImage = new Image();
      originalImage.onload = function () {
        // Set canvas dimensions
        const maxDimension = 600;
        let width = originalImage.width;
        let height = originalImage.height;

        if (width > height && width > maxDimension) {
          height = height * (maxDimension / width);
          width = maxDimension;
        } else if (height > maxDimension) {
          width = width * (maxDimension / height);
          height = maxDimension;
        }

        originalCanvas.width = width;
        originalCanvas.height = height;
        resultCanvas.width = width;
        resultCanvas.height = height;

        // Draw original image
        originalCtx.clearRect(0, 0, width, height);
        originalCtx.drawImage(originalImage, 0, 0, width, height);

        // Show controls and previews
        controls.style.display = "block";
        imagePreviews.style.display = "flex";
        removeBtn.disabled = false;
      };
      originalImage.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }

  function updateColorPreview() {
    colorPreview.style.backgroundColor = colorPicker.value;
  }

  function updateToleranceValue() {
    toleranceValue.textContent = tolerance.value;
  }

  function removeBackground() {
    if (!originalImage) return;

    // Clear result canvas
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

    // Get selected color
    const colorHex = colorPicker.value;
    const r = parseInt(colorHex.substring(1, 3), 16);
    const g = parseInt(colorHex.substring(3, 5), 16);
    const b = parseInt(colorHex.substring(5, 7), 16);

    // Get image data
    const imageData = originalCtx.getImageData(
      0,
      0,
      originalCanvas.width,
      originalCanvas.height
    );
    const data = imageData.data;

    // Get tolerance value
    const tol = parseInt(tolerance.value);

    // Process image data
    for (let i = 0; i < data.length; i += 4) {
      const pixelR = data[i];
      const pixelG = data[i + 1];
      const pixelB = data[i + 2];

      // Calculate color distance (Euclidean distance in RGB space)
      const distance = Math.sqrt(
        Math.pow(pixelR - r, 2) +
          Math.pow(pixelG - g, 2) +
          Math.pow(pixelB - b, 2)
      );

      // If color is close to selected color (within tolerance), make transparent
      if (distance < tol) {
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }

    // Put the modified image data back
    resultCtx.putImageData(imageData, 0, 0);

    // Enable download button
    downloadBtn.disabled = false;
  }

  function downloadResult() {
    const link = document.createElement("a");
    link.download = "background-removed.png";
    link.href = resultCanvas.toDataURL("image/png");
    link.click();
  }

  function resetApp() {
    // Clear canvases
    originalCtx.clearRect(0, 0, originalCanvas.width, originalCanvas.height);
    resultCtx.clearRect(0, 0, resultCanvas.width, resultCanvas.height);

    // Reset file input
    fileInput.value = "";
    originalImage = null;

    // Hide controls and previews
    controls.style.display = "none";
    imagePreviews.style.display = "none";

    // Disable buttons
    removeBtn.disabled = true;
    downloadBtn.disabled = true;
  }
});
