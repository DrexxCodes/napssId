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

// Cloudinary configuration - HARDCODE YOUR KEYS HERE
const CLOUDINARY_CONFIG = {
  cloudName: "dehkozfhr",     // Replace with your Cloudinary cloud name
  uploadPreset: "BoscoClothingsUploadServer" // Replace with your unsigned upload preset
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
    return enrollmentDoc.exists; // exists is a property, not a function
  } catch (error) {
    console.error("Error checking Firestore enrollment:", error);
    throw error;
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
function showCloudStatus(inCloud) {
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
function showCameraSection(regNumber) {
  const cameraHTML = `
    <div class="mt-6 border-t-2 border-gray-200 pt-6">
      <h4 class="text-lg font-bold text-gray-800 mb-4 flex items-center">
        <svg class="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Upload Profile Photo
      </h4>
      
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
      
      <!-- Captured Image Preview -->
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
      
      <!-- Open Camera Button -->
      <button id="openCameraBtn" class="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center">
        <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        Open Camera
      </button>
    </div>
  `;
  
  return cameraHTML;
}

// Initialize camera functionality
function initializeCameraControls(regNumber) {
  currentRegNumber = regNumber;
  
  const openCameraBtn = document.getElementById('openCameraBtn');
  const closeCameraBtn = document.getElementById('closeCameraBtn');
  const captureBtn = document.getElementById('captureBtn');
  const retakeBtn = document.getElementById('retakeBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  
  const cameraPreview = document.getElementById('cameraPreview');
  const imagePreview = document.getElementById('imagePreview');
  const uploadProgress = document.getElementById('uploadProgress');
  const uploadSuccess = document.getElementById('uploadSuccess');
  
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const capturedImage = document.getElementById('capturedImage');
  
  let stream = null;
  
  // Open camera
  openCameraBtn.addEventListener('click', async () => {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use rear camera (especially important for iPhone)
        audio: false 
      });
      video.srcObject = stream;
      openCameraBtn.classList.add('hidden');
      cameraPreview.classList.remove('hidden');
    } catch (error) {
      alert('Error accessing camera: ' + error.message);
    }
  });
  
  // Close camera
  closeCameraBtn.addEventListener('click', () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    cameraPreview.classList.add('hidden');
    openCameraBtn.classList.remove('hidden');
  });
  
  // Capture photo
  captureBtn.addEventListener('click', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    const imageDataUrl = canvas.toDataURL('image/jpeg', 0.9);
    capturedImage.src = imageDataUrl;
    
    // Stop camera
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    cameraPreview.classList.add('hidden');
    imagePreview.classList.remove('hidden');
  });
  
  // Retake photo
  retakeBtn.addEventListener('click', async () => {
    imagePreview.classList.add('hidden');
    uploadSuccess.classList.add('hidden');
    
    try {
      stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' }, // Use rear camera
        audio: false 
      });
      video.srcObject = stream;
      openCameraBtn.classList.add('hidden');
      cameraPreview.classList.remove('hidden');
    } catch (error) {
      alert('Error accessing camera: ' + error.message);
      openCameraBtn.classList.remove('hidden');
    }
  });
  
  // Upload to Cloudinary
  uploadBtn.addEventListener('click', async () => {
    imagePreview.classList.add('hidden');
    uploadProgress.classList.remove('hidden');
    
    try {
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      const file = new File([blob], `profile_${currentRegNumber}.jpg`, { type: 'image/jpeg' });
      
      // Upload with progress
      const imageUrl = await uploadToCloudinary(file, (progress) => {
        const progressBar = document.getElementById('progressBar');
        progressBar.style.width = `${progress}%`;
        progressBar.textContent = `${Math.round(progress)}%`;
      });
      
      // Update Firestore
      await updateProfileURL(currentRegNumber, imageUrl);
      
      // Show success
      uploadProgress.classList.add('hidden');
      uploadSuccess.classList.remove('hidden');
      document.getElementById('uploadedImage').src = imageUrl;
      const imageLink = document.getElementById('imageLink');
      imageLink.href = imageUrl;
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
  showCloudStatus: showCloudStatus,
  showCameraSection: showCameraSection,
  initializeCameraControls: initializeCameraControls
};