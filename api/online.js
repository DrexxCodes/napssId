// online.js - Firebase integration for NAPSS UNIZIK Card Listing DB

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIiht0HgpOoEexwAcEFfCFRtb8WtTho0c",
  authDomain: "cobaltai-6c012.firebaseapp.com",
  projectId: "cobaltai-6c012",
  storageBucket: "cobaltai-6c012.firebasestorage.app",
  messagingSenderId: "703066241181",
  appId: "1:703066241181:web:2b995f41ed42b6ed1b7c74"
};

// Cloudinary configuration
const CLOUDINARY_CONFIG = {
  cloudName: "dehkozfhr",     
  uploadPreset: "BoscoClothingsUploadServer" 
};

// Initialize Firebase
let db = null;
let currentRegNumber = null;

async function initializeFirebase() {
  try {
    // Initialize Firebase App
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase initialized successfully");
    return true;
  } catch (error) {
    console.error("Error initializing Firebase:", error);
    return false;
  }
}

// Check if registration number exists in Firestore enrollments collection
async function checkFirestoreEnrollment(regNumber) {
  try {
    const enrollmentDoc = await db.collection("enrollments").doc(regNumber).get();
    return enrollmentDoc.exists;
  } catch (error) {
    console.error("Error checking Firestore enrollment:", error);
    throw error;
  }
}

// Check if a student has already had a profile photo captured/uploaded
async function checkIfAlreadyCaptured(regNumber) {
  try {
    const enrollmentDoc = await db.collection("enrollments").doc(regNumber).get();
    if (enrollmentDoc.exists) {
      const data = enrollmentDoc.data();
      return (data && data.profileURL) ? data.profileURL : null;
    }
    return null;
  } catch (error) {
    console.error("Error checking capture status:", error);
    return null;
  }
}

// Update profile URL in Firestore
async function updateProfileURL(regNumber, imageUrl) {
  try {
    await db.collection("enrollments").doc(regNumber).update({
      profileURL: imageUrl,
      profileUploadedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating profile URL:", error);
    throw error;
  }
}

// Upload image to Cloudinary
async function uploadToCloudinary(file, onProgress) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder', 'napss-cards'); // Optional: organize in folder

    const xhr = new XMLHttpRequest();
    
    // Track upload progress
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percentComplete = (e.loaded / e.total) * 100;
        onProgress(percentComplete);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        resolve(response.secure_url);
      } else {
        reject(new Error('Upload failed'));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`);
    xhr.send(formData);
  });
}

// Show cloud status in UI
function showCloudStatus(inCloud, existingProfileURL) {
  let captureStatusHTML = '';

  if (inCloud && existingProfileURL) {
    captureStatusHTML = `
      <div class="mt-3 bg-amber-50 border-2 border-amber-400 rounded-lg p-3 flex items-start gap-3">
        <div class="shrink-0 mt-0.5">
          <svg class="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-bold text-amber-700">📸 Already Captured — Replacing will overwrite the existing photo</p>
          <div class="mt-2 flex items-center gap-3">
            <img src="${existingProfileURL}" alt="Existing profile" class="w-14 h-14 rounded-lg object-cover border-2 border-amber-300 shrink-0" onerror="this.style.display='none'" />
            <span class="text-xs text-amber-600 break-all">${existingProfileURL}</span>
          </div>
        </div>
      </div>`;
  } else if (inCloud) {
    captureStatusHTML = `
      <div class="mt-3 bg-green-50 border border-green-300 rounded-lg px-3 py-2 flex items-center gap-2">
        <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <span class="text-sm text-green-700 font-medium">No photo on file — ready for first capture</span>
      </div>`;
  }

  const cloudStatusHTML = inCloud
    ? `<div class="bg-green-100 border-2 border-green-500 rounded-lg p-4 mt-4 animate-pulse">
         <div class="flex items-center justify-center text-green-700">
           <svg class="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"></path>
           </svg>
           <div>
             <div class="font-bold text-lg">✓ Reg Number in Cloud too!</div>
             <div class="text-sm text-green-600">Record found in Firebase enrollment database</div>
           </div>
         </div>
         ${captureStatusHTML}
       </div>`
    : `<div class="bg-yellow-100 border-2 border-yellow-500 rounded-lg p-4 mt-4">
         <div class="flex items-center justify-center text-yellow-700">
           <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
           </svg>
           <span class="font-semibold">Not found in cloud enrollment database</span>
         </div>
       </div>`;

  return cloudStatusHTML;
}

// Show camera section
function showCameraSection(regNumber, alreadyCaptured) {
  const replaceBadge = alreadyCaptured
    ? `<div class="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-300 rounded-lg px-3 py-2">
        <svg class="w-4 h-4 text-amber-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        <span class="text-sm font-semibold text-amber-700">Replacing existing photo — new upload will overwrite the current one</span>
      </div>`
    : '';

  const cameraHTML = `
    <div class="mt-6 border-t-2 border-gray-200 pt-6">
      <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Upload Profile Photo
      </h4>

      ${replaceBadge}

      <!-- Hidden file input for gallery/device upload -->
      <input type="file" id="fileUploadInput" accept="image/*" class="hidden" />

      <!-- Camera Preview -->
      <div id="cameraPreview" class="hidden mb-4">
        <video id="video" autoplay playsinline class="w-full rounded-lg border-2 border-green-300"></video>
        <div class="mt-3 flex gap-3">
          <button id="captureBtn" class="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
            📸 Capture Photo
          </button>
          <button id="closeCameraBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all">
            ✕ Close
          </button>
        </div>
      </div>

      <!-- Canvas for captured image -->
      <canvas id="canvas" class="hidden"></canvas>

      <!-- Captured / Selected Image Preview -->
      <div id="imagePreview" class="hidden mb-4">
        <img id="capturedImage" class="w-full rounded-lg border-2 border-green-300" />
        <div class="mt-3 flex gap-3">
          <button id="uploadBtn" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-all">
            ☁️ Upload to Cloud
          </button>
          <button id="retakeBtn" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all">
            🔄 Retake
          </button>
        </div>
      </div>

      <!-- Upload Progress -->
      <div id="uploadProgress" class="hidden mb-4">
        <div class="bg-gray-200 rounded-full h-6 overflow-hidden">
          <div id="progressBar" class="bg-green-600 h-full transition-all duration-300 flex items-center justify-center text-white text-xs font-bold" style="width: 0%">
            0%
          </div>
        </div>
        <p class="text-center text-gray-600 mt-2 text-sm">Uploading to Cloudinary...</p>
      </div>

      <!-- Upload Success -->
      <div id="uploadSuccess" class="hidden">
        <div class="bg-green-50 border-2 border-green-500 rounded-lg p-4">
          <div class="flex items-center text-green-700 mb-3">
            <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span class="font-bold">Photo Uploaded Successfully!</span>
          </div>
          <img id="uploadedImage" class="w-full rounded-lg mb-3" />
          <a id="imageLink" href="#" target="_blank" class="text-blue-600 hover:underline text-sm break-all"></a>
        </div>
      </div>

      <!-- Action Buttons Row: Open Camera + Upload Image -->
      <div id="actionButtons" class="flex gap-3">
        <button id="openCameraBtn" class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
          </svg>
          Open Camera
        </button>
        <button id="openFileBtn" class="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-4 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2">
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          Upload Image
        </button>
      </div>
    </div>
  `;

  return cameraHTML;
}

// Initialize camera functionality
function initializeCameraControls(regNumber) {
  currentRegNumber = regNumber;

  const openCameraBtn   = document.getElementById('openCameraBtn');
  const openFileBtn     = document.getElementById('openFileBtn');
  const fileUploadInput = document.getElementById('fileUploadInput');
  const closeCameraBtn  = document.getElementById('closeCameraBtn');
  const captureBtn      = document.getElementById('captureBtn');
  const retakeBtn       = document.getElementById('retakeBtn');
  const uploadBtn       = document.getElementById('uploadBtn');

  const actionButtons  = document.getElementById('actionButtons');
  const cameraPreview  = document.getElementById('cameraPreview');
  const imagePreview   = document.getElementById('imagePreview');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadSuccess  = document.getElementById('uploadSuccess');

  const video         = document.getElementById('video');
  const canvas        = document.getElementById('canvas');
  const capturedImage = document.getElementById('capturedImage');

  let stream        = null;
  let uploadedBlob  = null; // holds blob for whichever source was used

  // ── Helpers ────────────────────────────────────────────────────────────────

  function showActionButtons() {
    actionButtons.classList.remove('hidden');
    cameraPreview.classList.add('hidden');
    imagePreview.classList.add('hidden');
  }

  async function openRearCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { exact: 'environment' } },
        audio: false
      });
    } catch {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
    }
    video.srcObject = stream;
    actionButtons.classList.add('hidden');
    cameraPreview.classList.remove('hidden');
  }

  function stopCamera() {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      stream = null;
    }
  }

  // ── Open Camera ────────────────────────────────────────────────────────────
  openCameraBtn.addEventListener('click', async () => {
    try {
      await openRearCamera();
    } catch (error) {
      alert('Error accessing camera: ' + error.message);
    }
  });

  // ── Open File Picker ───────────────────────────────────────────────────────
  openFileBtn.addEventListener('click', () => {
    fileUploadInput.click();
  });

  fileUploadInput.addEventListener('change', () => {
    const file = fileUploadInput.files[0];
    if (!file) return;

    // Validate it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    uploadedBlob = file; // store for upload step

    const reader = new FileReader();
    reader.onload = (e) => {
      capturedImage.src = e.target.result;
      actionButtons.classList.add('hidden');
      uploadSuccess.classList.add('hidden');
      imagePreview.classList.remove('hidden');
    };
    reader.readAsDataURL(file);

    // Reset so the same file can be re-selected if needed
    fileUploadInput.value = '';
  });

  // ── Close Camera ───────────────────────────────────────────────────────────
  closeCameraBtn.addEventListener('click', () => {
    stopCamera();
    showActionButtons();
  });

  // ── Capture Photo ──────────────────────────────────────────────────────────
  captureBtn.addEventListener('click', () => {
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);

    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    capturedImage.src  = imageDataUrl;
    uploadedBlob       = null; // will be generated from canvas on upload

    stopCamera();
    cameraPreview.classList.add('hidden');
    imagePreview.classList.remove('hidden');
  });

  // ── Retake / Choose Again ──────────────────────────────────────────────────
  retakeBtn.addEventListener('click', async () => {
    imagePreview.classList.add('hidden');
    uploadSuccess.classList.add('hidden');
    uploadedBlob = null;
    showActionButtons();
  });

  // ── Upload to Cloudinary + Firestore ──────────────────────────────────────
  uploadBtn.addEventListener('click', async () => {
    imagePreview.classList.add('hidden');
    uploadProgress.classList.remove('hidden');

    try {
      let file;

      if (uploadedBlob) {
        // Came from file picker — use directly
        file = new File([uploadedBlob], `profile_${currentRegNumber}.jpg`, { type: uploadedBlob.type || 'image/jpeg' });
      } else {
        // Came from camera canvas
        const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
        file = new File([blob], `profile_${currentRegNumber}.jpg`, { type: 'image/jpeg' });
      }

      const imageUrl = await uploadToCloudinary(file, (progress) => {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width  = `${progress}%`;
        progressBar.textContent  = `${Math.round(progress)}%`;
      });

      await updateProfileURL(currentRegNumber, imageUrl);

      uploadProgress.classList.add('hidden');
      uploadSuccess.classList.remove('hidden');
      document.getElementById('uploadedImage').src = imageUrl;
      const imageLink = document.getElementById('imageLink');
      imageLink.href        = imageUrl;
      imageLink.textContent = imageUrl;

    } catch (error) {
      uploadProgress.classList.add('hidden');
      alert('Upload failed: ' + error.message);
      imagePreview.classList.remove('hidden');
    }
  });
}

// Export functions for use in local.js
window.onlineDB = {
  initialize: initializeFirebase,
  checkEnrollment: checkFirestoreEnrollment,
  checkIfAlreadyCaptured: checkIfAlreadyCaptured,
  showCloudStatus: showCloudStatus,
  showCameraSection: showCameraSection,
  initializeCameraControls: initializeCameraControls
};