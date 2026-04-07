// DOM Elements
const loginView = document.getElementById('login-view');
const recDashboard = document.getElementById('receptionist-dashboard');
const patDashboard = document.getElementById('patient-dashboard');
const userControls = document.getElementById('userControls');
const currentUserRole = document.getElementById('currentUserRole');

const outputContainer = document.getElementById('output-container');
const outputTerminal = document.getElementById('output-terminal');

let printBuffer = [];

// Override Emscripten's standard output print to buffer into our Neat parser
window.Module = window.Module || {};
window.Module.print = (function() {
    return function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        console.log("C++ Engine (Buffer):", text);
        printBuffer.push(text);
    };
})();
window.Module.printErr = function(text) {
    if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
    console.error(text);
};

function clearTerminal() {
    printBuffer = [];
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

function callWasmNeat(functionName, argsTypes, args) {
    clearTerminal();
    Module.ccall(functionName, null, argsTypes, args);
    renderNeatUI();
}

function renderNeatUI() {
    const resultsContainer = document.getElementById('neat-results');
    resultsContainer.innerHTML = '';
    outputContainer.classList.remove('hidden');

    if (printBuffer.length === 0) return;
    let html = '';

    if (printBuffer[0].includes('Error:')) {
        html = `<div class="alert alert-error">${printBuffer[0]}</div>`;
    } 
    else if (printBuffer[0].includes('successfully')) {
        html = `<div class="alert alert-success">${printBuffer[0]}</div>`;
    } 
    else if (printBuffer[0].includes('Visit History')) {
        html = `<div class="alert alert-info" style="margin-bottom: 20px;">${printBuffer[0].replace(/-/g, '').trim()}</div>`;
        if (printBuffer.length === 2 && printBuffer[1].includes('No visits found')) {
            html += `<div class="alert alert-error">${printBuffer[1]}</div>`;
        } else {
            html += `<table class="data-table"><thead><tr><th>Date</th><th>Diagnosis</th><th>Prescription</th></tr></thead><tbody>`;
            for(let i=1; i < printBuffer.length; i++) {
                const parts = printBuffer[i].split('|').map(p => p.trim());
                if(parts.length === 3) {
                    html += `<tr><td>${parts[0].replace('Date:', '').trim()}</td><td>${parts[1].replace('Diagnosis:', '').trim()}</td><td>${parts[2].replace('Prescription:', '').trim()}</td></tr>`;
                }
            }
            html += `</tbody></table>`;
        }
    } 
    else if (printBuffer[0].includes('more than')) {
        html = `<div class="alert alert-info">${printBuffer[0].replace(/-/g, '').trim()}</div>`;
        if (printBuffer.length === 2 && printBuffer[1].includes('No frequent visitors')) {
            html += `<div class="alert alert-error">${printBuffer[1]}</div>`;
        } else {
            html += `<table class="data-table"><thead><tr><th>Patient ID</th><th>Total Visits</th></tr></thead><tbody>`;
            for(let i=1; i < printBuffer.length; i++) {
                const parts = printBuffer[i].split('|').map(p => p.trim());
                if(parts.length === 2) {
                    html += `<tr><td><strong>${parts[0].replace('Patient ID:', '').trim()}</strong></td><td><span class="badge" style="margin:0">${parts[1].replace('Total Visits:', '').trim()}</span></td></tr>`;
                }
            }
            html += `</tbody></table>`;
        }
    } 
    else if (printBuffer[0].includes('Total visits in')) {
        const parts = printBuffer[0].split(':');
        html = `
        <div class="stat-widget">
            <div class="stat-title">${parts[0].trim()}</div>
            <div class="stat-num">${parts[1] ? parts[1].trim() : '0'}</div>
        </div>`;
    } 
    else {
        html = `<pre class="term">${printBuffer.join('\\n')}</pre>`;
    }

    resultsContainer.innerHTML = html;
}

// ------ C++ BINDINGS ------
document.getElementById('form-register').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('reg-id').value.trim().toUpperCase();
    const name = document.getElementById('reg-name').value.trim();
    const age = parseInt(document.getElementById('reg-age').value);
    const phone = document.getElementById('reg-phone').value;
    
    callWasmNeat('registerPatient_js', ['string', 'string', 'number', 'string'], [id, name, age, phone]);
    closeModal('registerPatientModal');
    e.target.reset();
});

document.getElementById('form-visit').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('vis-id').value.trim().toUpperCase();
    const date = document.getElementById('vis-date').value;
    const diag = document.getElementById('vis-diag').value;
    const pres = document.getElementById('vis-pres').value;
    
    callWasmNeat('addVisit_js', ['string', 'string', 'string', 'string'], [id, date, diag, pres]);
    closeModal('addVisitModal');
    e.target.reset();
});

document.getElementById('form-history').addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('hist-id').value.trim().toUpperCase();
    callWasmNeat('displayPatientHistory_js', ['string'], [id]);
    closeModal('patientHistoryModal');
    e.target.reset();
});

document.getElementById('form-report-frequent').addEventListener('submit', (e) => {
    e.preventDefault();
    const n = parseInt(document.getElementById('rep-freq-n').value);
    callWasmNeat('reportFrequentVisitors_js', ['number'], [n]);
    closeModal('reportsModal');
});

document.getElementById('form-report-month').addEventListener('submit', (e) => {
    e.preventDefault();
    const month = document.getElementById('rep-month').value; 
    callWasmNeat('reportTotalVisitsThisMonth_js', ['string'], [month]);
    closeModal('reportsModal');
});

function loadMyHistory() {
    if(loggedInPatientId) {
        callWasmNeat('displayPatientHistory_js', ['string'], [loggedInPatientId]);
    }
}
