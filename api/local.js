// Local.js - Data handling for NAPSS UNIZIK Card Listing DB

let cardData = [];

// Fetch data from JSON file
async function fetchCardData() {
    try {
        const response = await fetch('api/data.json');
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        cardData = await response.json();
        // Stats section removed, so no need to update total records
        return cardData;
    } catch (error) {
        console.error('Error fetching card data:', error);
        showError('Failed to load database. Please refresh the page.');
        return [];
    }
}

// Search for a record by last 3 digits
function searchByDigits(digits) {
    // Ensure digits is a string with 3 characters
    const searchDigits = digits.toString().padStart(3, '0');
    
    // Search for matching records
    const results = cardData.filter(record => {
        const regNumber = record.reg_number.toString();
        
        // For standard reg numbers (2025134XXX), check last 3 digits
        if (regNumber.startsWith('2025134')) {
            return regNumber.slice(-3) === searchDigits;
        }
        
        // For other reg numbers, check if they end with the digits
        if (regNumber.endsWith(searchDigits)) {
            return true;
        }
        
        // For assigned numbers (001, 002, etc.), match exactly
        if (regNumber === searchDigits) {
            return true;
        }
        
        return false;
    });
    
    return results;
}

// Format date and time
function formatDateTime(dateTimeString) {
    // Input format: "04-02-2026 16:19:26"
    const parts = dateTimeString.split(' ');
    if (parts.length !== 2) return { date: dateTimeString, time: '' };
    
    const datePart = parts[0]; // "04-02-2026"
    const timePart = parts[1]; // "16:19:26"
    
    return {
        date: datePart,
        time: timePart,
        full: dateTimeString
    };
}

// Display search result
async function displayResult(record) {
    const resultContent = document.getElementById('resultContent');
    const dateTime = formatDateTime(record.date);
    
    // Check if record exists in Firebase
    let cloudStatusHTML = '';
    let cameraHTML = '';
    let inCloud = false;
    
    try {
        if (window.onlineDB) {
            inCloud = await window.onlineDB.checkEnrollment(record.reg_number);
            cloudStatusHTML = window.onlineDB.showCloudStatus(inCloud);
            
            // Only show camera if record is in cloud
            if (inCloud) {
                cameraHTML = window.onlineDB.showCameraSection(record.reg_number);
            }
        }
    } catch (error) {
        console.error('Error checking cloud status:', error);
    }
    
    resultContent.innerHTML = `
        <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                </svg>
                <span class="font-semibold text-green-800">Registration Number</span>
            </div>
            <p class="text-2xl font-bold text-green-900 font-mono">${record.reg_number}</p>
        </div>
        
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
            <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                <span class="font-semibold text-blue-800">Full Name</span>
            </div>
            <p class="text-xl font-semibold text-blue-900">${record.full_name}</p>
        </div>
        
        <div class="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-r-lg">
            <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span class="font-semibold text-purple-800">Date of Upload</span>
            </div>
            <p class="text-lg font-semibold text-purple-900">${dateTime.date}</p>
        </div>
        
        <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-r-lg">
            <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-semibold text-orange-800">Time of Upload</span>
            </div>
            <p class="text-lg font-semibold text-orange-900">${dateTime.time}</p>
        </div>
        
        <div class="bg-gradient-to-r from-green-100 to-emerald-100 p-4 rounded-lg mt-2">
            <div class="flex items-center justify-center text-green-700">
                <svg class="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span class="font-semibold">Card Verified Successfully</span>
            </div>
        </div>
        
        ${cloudStatusHTML}
        ${cameraHTML}
    `;
    
    // Initialize camera controls if record is in cloud
    if (inCloud && window.onlineDB) {
        window.onlineDB.initializeCameraControls(record.reg_number);
    }
}

// Show error message
function showError(message) {
    const errorSection = document.getElementById('errorSection');
    const errorMessage = document.getElementById('errorMessage');
    const loader = document.getElementById('loader');
    const resultSection = document.getElementById('resultSection');
    
    loader.classList.add('hidden');
    resultSection.classList.add('hidden');
    errorMessage.textContent = message;
    errorSection.classList.remove('hidden');
}

// Hide all sections
function hideAllSections() {
    document.getElementById('loader').classList.add('hidden');
    document.getElementById('resultSection').classList.add('hidden');
    document.getElementById('errorSection').classList.add('hidden');
}

// Initialize the application
async function init() {
    await fetchCardData();
    
    // Initialize Firebase
    if (window.onlineDB) {
        await window.onlineDB.initialize();
    }
    
    const searchForm = document.getElementById('searchForm');
    const regDigitsInput = document.getElementById('regDigits');
    const closeResultBtn = document.getElementById('closeResult');
    const closeErrorBtn = document.getElementById('closeError');
    
    // Only allow numbers in input
    regDigitsInput.addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Handle form submission
    searchForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const digits = regDigitsInput.value.trim();
        
        // Validate input
        if (digits.length !== 3) {
            showError('Please enter exactly 3 digits.');
            return;
        }
        
        // Show loader
        hideAllSections();
        document.getElementById('loader').classList.remove('hidden');
        
        // Simulate loading delay for better UX
        setTimeout(async () => {
            const results = searchByDigits(digits);
            
            if (results.length > 0) {
                // Display first matching result
                await displayResult(results[0]);
                document.getElementById('loader').classList.add('hidden');
                document.getElementById('resultSection').classList.remove('hidden');
            } else {
                showError(`No record found for registration number ending with "${digits}". Please verify the digits and try again.`);
            }
        }, 800);
    });
    
    // Close result
    closeResultBtn.addEventListener('click', function() {
        hideAllSections();
        regDigitsInput.value = '';
        regDigitsInput.focus();
    });
    
    // Close error
    closeErrorBtn.addEventListener('click', function() {
        hideAllSections();
        regDigitsInput.value = '';
        regDigitsInput.focus();
    });
    
    // Focus input on page load
    regDigitsInput.focus();
}

// Start the application when DOM is loaded
document.addEventListener('DOMContentLoaded', init);