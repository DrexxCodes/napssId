// admin-profile.js - Student profile viewer with Firebase integration

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIiht0HgpOoEexwAcEFfCFRtb8WtTho0c",
  authDomain: "cobaltai-6c012.firebaseapp.com",
  projectId: "cobaltai-6c012",
  storageBucket: "cobaltai-6c012.firebasestorage.app",
  messagingSenderId: "703066241181",
  appId: "1:703066241181:web:2b995f41ed42b6ed1b7c74"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

let currentStudent = null;

// Get reg number from URL
function getRegNumberFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('reg');
}

// Load student data from local JSON
async function loadLocalStudentData(regNumber) {
    try {
        const response = await fetch('../api/data.json');
        const students = await response.json();
        
        const student = students.find(s => s.reg_number === regNumber);
        return student || null;
    } catch (error) {
        console.error('Error loading local student data:', error);
        return null;
    }
}

// Load student data from Firebase
async function loadFirestoreData(regNumber) {
    try {
        const docRef = db.collection('enrollments').doc(regNumber);
        const docSnap = await docRef.get();
        
        if (docSnap.exists) {
            return docSnap.data();
        }
        return null;
    } catch (error) {
        console.error('Error loading Firestore data:', error);
        return null;
    }
}

// Generate QR Code using QRCode.js
function generateQRCode(containerId, data) {
    const container = document.getElementById(containerId);
    
    // Clear any existing QR code
    container.innerHTML = '';
    
    // Create QR code
    new QRCode(container, {
        text: data,
        width: 200,
        height: 200,
        colorDark: "#065f46",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Download QR Code
function downloadQRCode(containerId, filename) {
    const container = document.getElementById(containerId);
    const img = container.querySelector('img');
    
    if (!img) {
        alert('QR Code not generated yet');
        return;
    }
    
    // Create canvas from image
    const canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    
    // Download
    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${filename}_${currentStudent.reg_number}.png`;
    link.href = url;
    link.click();
}

// Display student profile
async function displayProfile(localData, firestoreData) {
    // Update basic info from local data
    document.getElementById('studentName').textContent = localData.full_name;
    document.getElementById('regNumber').textContent = localData.reg_number;
    document.getElementById('registrationDate').textContent = localData.date;

    // Update phone number from Firestore (if available)
    const phoneContainer = document.getElementById('phoneContainer');
    if (firestoreData && firestoreData.phoneNumber) {
        document.getElementById('phoneNumber').textContent = firestoreData.phoneNumber;
    } else {
        phoneContainer.classList.add('hidden');
    }

    // Handle profile image
    const profileImage = document.getElementById('profileImage');
    const profileImagePlaceholder = document.getElementById('profileImagePlaceholder');
    const downloadImageBtn = document.getElementById('downloadImageBtn');
    
    if (firestoreData && firestoreData.profileURL) {
        profileImage.src = firestoreData.profileURL;
        profileImage.classList.remove('hidden');
        profileImagePlaceholder.classList.add('hidden');
        downloadImageBtn.classList.remove('hidden');
        
        // Set up download button with proper download functionality
        downloadImageBtn.onclick = async () => {
            try {
                // Fetch the image as a blob
                const response = await fetch(firestoreData.profileURL);
                const blob = await response.blob();
                
                // Create a temporary URL for the blob
                const blobUrl = window.URL.createObjectURL(blob);
                
                // Create a temporary link and trigger download
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = `profile_${localData.reg_number}.jpg`;
                document.body.appendChild(link);
                link.click();
                
                // Clean up
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
                
                // Show success notification
                showCopyNotification('Profile photo downloaded');
            } catch (error) {
                console.error('Download failed:', error);
                // Fallback: open in new tab if download fails (CORS issue)
                window.open(firestoreData.profileURL, '_blank');
            }
        };
        
        document.getElementById('photoStatus').textContent = '✓ Uploaded';
    } else {
        document.getElementById('photoStatus').textContent = 'No Photo';
    }

    // Update cloud status
    if (firestoreData) {
        document.getElementById('cloudStatus').textContent = '✓ Synced';
    } else {
        document.getElementById('cloudStatus').textContent = 'Local Only';
    }

    // Generate QR Codes
    // Virtual ID - just the reg number
    generateQRCode('virtualIdQR', localData.reg_number);

    // Scannable ID - URL format
    const scannableUrl = `https://napss-nau.vercel.app/stu/${localData.reg_number}`;
    generateQRCode('scannableIdQR', scannableUrl);
    document.getElementById('scannableUrl').textContent = scannableUrl;

    // Show profile content
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('profileContent').classList.remove('hidden');
}

// Show error
function showError(message) {
    document.getElementById('loadingState').classList.add('hidden');
    document.getElementById('errorMessage').textContent = message;
    document.getElementById('errorState').classList.remove('hidden');
}

// Initialize profile page
async function initProfile() {
    const regNumber = getRegNumberFromURL();
    
    if (!regNumber) {
        showError('No registration number provided in URL');
        return;
    }

    try {
        // Load data from both sources
        const localData = await loadLocalStudentData(regNumber);
        
        if (!localData) {
            showError(`Student with registration number "${regNumber}" not found in local database`);
            return;
        }

        currentStudent = localData;

        // Try to load Firestore data (optional)
        const firestoreData = await loadFirestoreData(regNumber);

        // Display profile
        await displayProfile(localData, firestoreData);

    } catch (error) {
        console.error('Error initializing profile:', error);
        showError('An error occurred while loading the profile. Please try again.');
    }
}

// Make downloadQRCode available globally
window.downloadQRCode = downloadQRCode;

// Copy to clipboard function
function copyToClipboard(text, fieldName) {
    // Use the modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            showCopyNotification(fieldName);
        }).catch(err => {
            // Fallback to older method
            fallbackCopyToClipboard(text, fieldName);
        });
    } else {
        // Fallback for older browsers
        fallbackCopyToClipboard(text, fieldName);
    }
}

// Fallback copy method
function fallbackCopyToClipboard(text, fieldName) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopyNotification(fieldName);
    } catch (err) {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    }
    
    document.body.removeChild(textArea);
}

// Show copy notification
function showCopyNotification(fieldName) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center animate-slideIn';
    notification.innerHTML = `
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
        <span>${fieldName} copied!</span>
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.3s';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Make copyToClipboard available globally
window.copyToClipboard = copyToClipboard;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initProfile);