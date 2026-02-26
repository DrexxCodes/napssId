// Local.js - Data handling for NAPSS UNIZIK Card Listing DB

let cardData = [];

// Fetch data from the correct JSON file based on current mode AND identifier type
async function fetchCardData() {
    const mode       = window.currentMode       || 'regular'; // 'regular' | 'cep'
    const identifier = window.currentIdentifier || 'reg';     // 'reg' | 'phone'

    let jsonFile;
    if (identifier === 'phone') {
        jsonFile = mode === 'cep' ? 'api/cep_phone.json' : 'api/regular_phone.json';
    } else {
        jsonFile = mode === 'cep' ? 'api/cep.json' : 'api/data.json';
    }

    try {
        const response = await fetch(jsonFile);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${jsonFile}`);
        }
        cardData = await response.json();
        return cardData;
    } catch (error) {
        console.error('Error fetching card data:', error);
        showError(`Failed to load ${mode.toUpperCase()} database. Please refresh the page.`);
        return [];
    }
}

// Search by last 3 digits of reg number
function searchByDigits(digits) {
    const searchDigits = digits.toString().padStart(3, '0');

    return cardData.filter(record => {
        const regNumber = record.reg_number.toString();

        if (regNumber.startsWith('2025134')) {
            return regNumber.slice(-3) === searchDigits;
        }
        if (regNumber.endsWith(searchDigits)) return true;
        if (regNumber === searchDigits) return true;

        return false;
    });
}

// Search by last 4 digits of phone number
function searchByPhone(digits) {
    const searchDigits = digits.toString().padStart(4, '0');

    return cardData.filter(record => {
        // Support phone_number field or fallback to reg_number
        const phone = (record.phone_number || record.reg_number || '').toString().replace(/\D/g, '');
        return phone.slice(-4) === searchDigits;
    });
}

// Format date and time
function formatDateTime(dateTimeString) {
    const parts = dateTimeString.split(' ');
    if (parts.length !== 2) return { date: dateTimeString, time: '' };
    return {
        date: parts[0],
        time: parts[1],
        full: dateTimeString
    };
}

// Display search result
async function displayResult(record) {
    const resultContent = document.getElementById('resultContent');
    const dateTime      = formatDateTime(record.date);
    const modeTag = (window.currentMode === 'cep')
        ? `<span class="ml-2 text-sm font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full align-middle">CEP</span>`
        : `<span class="ml-2 text-sm font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full align-middle">Regular</span>`;

    const heading = document.querySelector('#resultSection h3');
    if (heading) heading.innerHTML = `✅ Record Found ${modeTag}`;

    let cloudStatusHTML = '';
    let cameraHTML      = '';
    let inCloud         = false;

    try {
        if (window.onlineDB) {
            inCloud = await window.onlineDB.checkEnrollment(record.reg_number);
            cloudStatusHTML = window.onlineDB.showCloudStatus(inCloud);
            if (inCloud) {
                cameraHTML = window.onlineDB.showCameraSection(record.reg_number);
            }
        }
    } catch (error) {
        console.error('Error checking cloud status:', error);
    }

    // Identifier row — phone vs reg number
    const isPhone = window.currentIdentifier === 'phone';
    const identifierRow = isPhone
        ? `<div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span class="font-semibold text-yellow-800">Phone Identifier (last 4 digits)</span>
            </div>
            <p class="text-2xl font-bold text-yellow-900 font-mono">***${(record.phone_number || '').toString().slice(-4)}</p>
           </div>`
        : `<div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <div class="flex items-center mb-2">
                <svg class="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"></path>
                </svg>
                <span class="font-semibold text-green-800">Registration Number</span>
            </div>
            <p class="text-2xl font-bold text-green-900 font-mono">${record.reg_number}</p>
           </div>`;

    resultContent.innerHTML = `
        ${identifierRow}

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

    if (inCloud && window.onlineDB) {
        window.onlineDB.initializeCameraControls(record.reg_number);
    }
}

// Show error message
function showError(message) {
    const errorSection  = document.getElementById('errorSection');
    const errorMessage  = document.getElementById('errorMessage');
    const loader        = document.getElementById('loader');
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

// Core search & display logic (shared between form submit and auto-search)
async function performSearch(digits) {
    hideAllSections();
    document.getElementById('loader').classList.remove('hidden');

    // Always re-fetch for current mode + identifier combination
    await fetchCardData();

    setTimeout(async () => {
        const isPhone = window.currentIdentifier === 'phone';
        const results = isPhone ? searchByPhone(digits) : searchByDigits(digits);

        if (results.length > 0) {
            await displayResult(results[0]);
            document.getElementById('loader').classList.add('hidden');
            document.getElementById('resultSection').classList.remove('hidden');
        } else {
            const modeLabel = (window.currentMode === 'cep') ? 'CEP' : 'Regular';
            const idLabel   = isPhone ? 'phone number ending with' : 'registration number ending with';
            showError(`No ${modeLabel} record found for ${idLabel} "${digits}". Please verify the digits and try again.`);
        }
    }, 800);
}

// Initialize the application
async function init() {
    await fetchCardData();

    if (window.onlineDB) {
        await window.onlineDB.initialize();
    }

    const searchForm     = document.getElementById('searchForm');
    const regDigitsInput = document.getElementById('regDigits');
    const closeResultBtn = document.getElementById('closeResult');
    const closeErrorBtn  = document.getElementById('closeError');

    // Only allow numbers in input + auto-search on reaching required length
    regDigitsInput.addEventListener('input', function () {
        this.value = this.value.replace(/[^0-9]/g, '');

        const isPhone   = window.currentIdentifier === 'phone';
        const maxDigits = isPhone ? 4 : 3;

        if (this.value.length === maxDigits) {
            performSearch(this.value);
        }
    });

    // Manual form submission (button click or Enter key)
    searchForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const digits   = regDigitsInput.value.trim();
        const isPhone  = window.currentIdentifier === 'phone';
        const required = isPhone ? 4 : 3;

        if (digits.length !== required) {
            showError(`Please enter exactly ${required} digits.`);
            return;
        }

        performSearch(digits);
    });

    // Close result
    closeResultBtn.addEventListener('click', function () {
        hideAllSections();
        regDigitsInput.value = '';
        regDigitsInput.focus();
    });

    // Close error
    closeErrorBtn.addEventListener('click', function () {
        hideAllSections();
        regDigitsInput.value = '';
        regDigitsInput.focus();
    });

    regDigitsInput.focus();
}

document.addEventListener('DOMContentLoaded', init);