// DOM Elements
const loginView = document.getElementById('login-view');
const recDashboard = document.getElementById('receptionist-dashboard');
const patDashboard = document.getElementById('patient-dashboard');
const userControls = document.getElementById('userControls');
const currentUserRole = document.getElementById('currentUserRole');

const outputContainer = document.getElementById('output-container');
const outputTerminal = document.getElementById('output-terminal');

let loginType = 'receptionist';
let loggedInPatientId = null;

// Override Emscripten's standard output print to draw to our terminal instead of default console
window.Module = window.Module || {};
window.Module.print = (function() {
    return function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        console.log(text);
        if(outputContainer) {
            outputContainer.classList.remove('hidden');
            outputTerminal.textContent += text + "\n";
            // auto scroll
            outputTerminal.scrollTop = outputTerminal.scrollHeight;
        }
    };
})();
window.Module.printErr = function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    console.error(text);
};

function clearTerminal() {
    outputTerminal.textContent = "";
}

// ------ LOGIN LOGIC ------
function switchLoginTab(type) {
    loginType = type;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    if(type === 'patient') {
        document.getElementById('patient-id-group').style.display = 'block';
        document.getElementById('rec-user-group').style.display = 'none';
        document.getElementById('rec-pass-group').style.display = 'none';
    } else {
        document.getElementById('patient-id-group').style.display = 'none';
        document.getElementById('rec-user-group').style.display = 'block';
        document.getElementById('rec-pass-group').style.display = 'block';
    }
}

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    loginView.classList.add('hidden');
    userControls.classList.remove('hidden');
    clearTerminal();
    
    if(loginType === 'receptionist') {
        currentUserRole.innerText = 'Receptionist';
        recDashboard.classList.remove('hidden');
    } else {
        const attemptedId = document.getElementById('login-patient-id').value.trim().toUpperCase();
        const exists = Module.ccall('patientExists_js', 'boolean', ['string'], [attemptedId]);
        
        if (!exists) {
            alert("Invalid Login: This Patient ID has not been registered yet.");
            // Keep them on the login view
            loginView.classList.remove('hidden');
            userControls.classList.add('hidden');
            return;
        }

        loggedInPatientId = attemptedId;
        currentUserRole.innerText = 'Patient: ' + loggedInPatientId;
        patDashboard.classList.remove('hidden');
        loadMyHistory();
    }
});

function logout() {
    recDashboard.classList.add('hidden');
    patDashboard.classList.add('hidden');
    userControls.classList.add('hidden');
    outputContainer.classList.add('hidden');
    loginView.classList.remove('hidden');
    loggedInPatientId = null;
    document.getElementById('login-form').reset();
}

// ------ MODAL LOGIC ------
function openModal(id) { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

// ------ C++ BINDINGS ------
document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTerminal();
    const id = document.getElementById('reg-id').value.trim().toUpperCase();
    const name = document.getElementById('reg-name').value.trim();
    const age = parseInt(document.getElementById('reg-age').value);
    const phone = document.getElementById('reg-phone').value;
    
    // Call C++ extern "C" function
    Module.ccall('registerPatient_js', null, ['string', 'string', 'number', 'string'], [id, name, age, phone]);
    closeModal('registerPatientModal');
    e.target.reset();
});

document.getElementById('form-visit').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTerminal();
    const id = document.getElementById('vis-id').value.trim().toUpperCase();
    const date = document.getElementById('vis-date').value;
    const diag = document.getElementById('vis-diag').value;
    const pres = document.getElementById('vis-pres').value;
    
    Module.ccall('addVisit_js', null, ['string', 'string', 'string', 'string'], [id, date, diag, pres]);
    closeModal('addVisitModal');
    e.target.reset();
});

document.getElementById('form-history').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTerminal();
    const id = document.getElementById('hist-id').value.trim().toUpperCase();
    Module.ccall('displayPatientHistory_js', null, ['string'], [id]);
    closeModal('patientHistoryModal');
    e.target.reset();
});

document.getElementById('form-report-frequent').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTerminal();
    const n = parseInt(document.getElementById('rep-freq-n').value);
    Module.ccall('reportFrequentVisitors_js', null, ['number'], [n]);
    closeModal('reportsModal');
});

document.getElementById('form-report-month').addEventListener('submit', (e) => {
    e.preventDefault();
    clearTerminal();
    const month = document.getElementById('rep-month').value; 
    Module.ccall('reportTotalVisitsThisMonth_js', null, ['string'], [month]);
    closeModal('reportsModal');
});

function loadMyHistory() {
    if(loggedInPatientId) {
        clearTerminal();
        Module.ccall('displayPatientHistory_js', null, ['string'], [loggedInPatientId]);
    }
}
