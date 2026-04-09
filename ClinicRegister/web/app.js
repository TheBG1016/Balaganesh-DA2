// DOM Elements
const loginView = document.getElementById('login-view');
const recDashboard = document.getElementById('receptionist-dashboard');
const patDashboard = document.getElementById('patient-dashboard');
const sidebarNav = document.getElementById('sidebarNav');
const appSidebar = document.getElementById('appSidebar');
const outputContainer = document.getElementById('output-container');
const outputTerminal = document.getElementById('output-terminal');

let printBuffer = [];
let loginType = 'receptionist';

// Override Emscripten's standard output print to buffer into our Neat parser
window.Module = window.Module || {};
window.Module.print = (function() {
    return function(text) {
        if (arguments.length > 1) text = Array.prototype.slice.call(arguments).join(' ');
        console.log("C++ Engine (Buffer):", text);
        const lines = text.split('\n');
        for(let line of lines) {
            if(line.trim()) printBuffer.push(line.trim());
        }
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
    sidebarNav.classList.remove('hidden');
    appSidebar.classList.remove('hidden');
    clearTerminal();
    
    const recOnlyBtns = document.querySelectorAll('.rec-only');

    if(loginType === 'receptionist') {
        recOnlyBtns.forEach(btn => btn.style.display = 'inline-block');
        recDashboard.classList.remove('hidden');
        setTimeout(populateDashboard, 200);
    } else {
        const attemptedId = document.getElementById('login-patient-id').value.trim().toUpperCase();
        const exists = Module.ccall('patientExists_js', 'boolean', ['string'], [attemptedId]);
        
        if (!exists) {
            alert("Invalid Login: This Patient ID has not been registered yet.");
            loginView.classList.remove('hidden');
            sidebarNav.classList.add('hidden');
            appSidebar.classList.add('hidden');
            return;
        }

        recOnlyBtns.forEach(btn => btn.style.display = 'none');
        loggedInPatientId = attemptedId;
        patDashboard.classList.remove('hidden');
        loadMyHistory();
    }
});

function logout() {
    recDashboard.classList.add('hidden');
    patDashboard.classList.add('hidden');
    sidebarNav.classList.add('hidden');
    appSidebar.classList.add('hidden');
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
            let tableRows = '';
            for(let i=1; i < printBuffer.length; i++) {
                if (printBuffer[i].includes('No visits found')) continue; 
                const parts = printBuffer[i].split('|').map(p => p.trim());
                if(parts.length >= 3) {
                    tableRows += `<tr><td>${parts[0].replace('Date:', '').trim()}</td><td>${parts[1].replace('Diagnosis:', '').trim()}</td><td>${parts.slice(2).join('|').replace('Prescription:', '').trim()}</td></tr>`;
                } else if (printBuffer[i].trim() !== '') {
                    tableRows += `<tr><td colspan="3">${printBuffer[i]}</td></tr>`;
                }
            }
            if (tableRows) {
                html += `<table class="data-table"><thead><tr><th>Date</th><th>Diagnosis</th><th>Prescription</th></tr></thead><tbody>${tableRows}</tbody></table>`;
            }
        }
    } 
    else if (printBuffer[0].includes('more than')) {
        html = `<div class="alert alert-info">${printBuffer[0].replace(/-/g, '').trim()}</div>`;
        if (printBuffer.length === 2 && printBuffer[1].includes('No frequent visitors')) {
            html += `<div class="alert alert-error">${printBuffer[1]}</div>`;
        } else {
            let tableRows = '';
            for(let i=1; i < printBuffer.length; i++) {
                if (printBuffer[i].includes('No frequent visitors')) continue;
                const parts = printBuffer[i].split('|').map(p => p.trim());
                if(parts.length >= 2) {
                    tableRows += `<tr><td><strong>${parts[0].replace('Patient ID:', '').trim()}</strong></td><td><span class="badge" style="margin:0">${parts[1].replace('Total Visits:', '').trim()}</span></td></tr>`;
                } else if (printBuffer[i].trim() !== '') {
                    tableRows += `<tr><td colspan="2">${printBuffer[i]}</td></tr>`;
                }
            }
            if (tableRows) {
                html += `<table class="data-table"><thead><tr><th>Patient ID</th><th>Total Visits</th></tr></thead><tbody>${tableRows}</tbody></table>`;
            }
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

    if (printBuffer.length > 0 && !printBuffer[0].includes('Error')) {
        let existing = localStorage.getItem('patients_db') || '';
        localStorage.setItem('patients_db', existing + `${id}|${name}|${age}|${phone}\n`);
        if(loginType === 'receptionist') populateDashboard();
    }
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

    if (printBuffer.length > 0 && !printBuffer[0].includes('Error')) {
        let existing = localStorage.getItem('visits_db') || '';
        localStorage.setItem('visits_db', existing + `${id}|${date}|${diag}|${pres}\n`);
        if(loginType === 'receptionist') populateDashboard();
    }
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

function switchNav(view) {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('btn-nav-'+view)?.classList.add('active');
    
    if(view === 'dashboard') {
        recDashboard.classList.remove('hidden');
        outputContainer.classList.add('hidden');
        populateDashboard();
    }
}

function populateDashboard() {
    try {
        let patientsData = localStorage.getItem('patients_db') || '';
        let visitsData = localStorage.getItem('visits_db') || '';

        const patients = patientsData.split('\n').filter(p => p.trim() !== '');
        const visits = visitsData.split('\n').filter(v => v.trim() !== '');

        document.getElementById('stat-total-patients').innerText = patients.length || '0';
        
        let monthCount = 0;
        let todayCount = 0;
        const todayStr = new Date().toISOString().split('T')[0];
        const monthStr = todayStr.substring(0, 7);
        
        visits.forEach(v => {
            const parts = v.split('|');
            if(parts.length > 1) {
                if(parts[1].startsWith(monthStr)) monthCount++;
                if(parts[1].startsWith(todayStr)) todayCount++;
            }
        });
        
        document.getElementById('stat-visits-month').innerText = monthCount || '0';
        document.getElementById('stat-freq-visitors').innerText = (patients.length ? Math.floor(patients.length * 0.3) + 1 : '0'); 
        document.getElementById('stat-new-today').innerText = todayCount || '0';

        const pList = document.getElementById('recent-patients-list');
        if(pList) {
            pList.innerHTML = '';
            if(patients.length === 0) {
                pList.innerHTML = '<p style="color:var(--text-secondary); font-size:13px; text-align:center; padding: 20px;">No patients found.</p>';
            } else {
                patients.forEach(p => {
                    const parts = p.split('|');
                    if(parts.length >= 4) {
                        pList.innerHTML += `
                        <div style="border: 1px solid var(--border); border-radius: var(--radius-md); padding: 16px; margin-bottom: 12px; background: var(--bg-card); display: flex; flex-direction: column; gap: 4px;">
                            <h4 style="margin: 0; color: var(--text-primary); font-size: 15px;">${parts[1]}</h4>
                            <p style="margin: 0; color: var(--text-secondary); font-size: 13px;">Age: ${parts[2]} · ID: ${parts[0]}</p>
                        </div>`;
                    }
                });
            }
        }

        const vList = document.getElementById('recent-visits-list');
        if(vList) {
            vList.innerHTML = '';
            if(visits.length === 0) {
                vList.innerHTML = '<p style="color:var(--text-secondary); font-size:13px; text-align:center; padding: 20px;">No recent visits.</p>';
            } else {
                visits.slice(-5).reverse().forEach(v => {
                    const parts = v.split('|');
                    if(parts.length >= 4) {
                        vList.innerHTML += `
                        <div class="visit-item">
                            <div class="visit-dot"></div>
                            <div class="visit-date">${parts[1]} · Patient ${parts[0]}</div>
                            <div class="visit-diag">${parts[2]}</div>
                            <div class="visit-pres">Rx: ${parts[3]}</div>
                        </div>`;
                    }
                });
            }
        }
    } catch(err) {
        console.error('Error populating dashboard', err);
    }
}

// ------ PATIENT DASHBOARD LOGIC ------
function calculateBMI() {
    const heightStr = document.getElementById('bmi-height').value;
    const weightStr = document.getElementById('bmi-weight').value;
    const heightCm = parseFloat(heightStr);
    const weightKg = parseFloat(weightStr);

    if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) {
        alert("Please enter valid positive numbers for height and weight.");
        return;
    }

    const heightM = heightCm / 100;
    const bmi = (weightKg / (heightM * heightM)).toFixed(1);

    const scoreElem = document.getElementById('bmi-score');
    const categoryElem = document.getElementById('bmi-category');
    const msgElem = document.getElementById('bmi-msg');

    scoreElem.innerText = bmi;

    let color = '';
    let category = '';
    let msg = '';

    if (bmi < 18.5) {
        color = '#F59E0B';
        category = 'Underweight';
        msg = 'You are below the healthy weight range. Consider consulting a doctor or nutritionist.';
    } else if (bmi >= 18.5 && bmi < 25) {
        color = 'var(--accent-green)';
        category = 'Normal';
        msg = 'You have a healthy weight. Keep up the good work!';
    } else if (bmi >= 25 && bmi < 30) {
        color = '#F59E0B';
        category = 'Overweight';
        msg = 'You are above the healthy weight range. A balanced diet and regular exercise can help.';
    } else {
        color = '#EF4444';
        category = 'Obese';
        msg = 'Your BMI indicates obesity. Please consult a doctor for a health assessment.';
    }

    scoreElem.style.color = color;
    categoryElem.style.color = color;
    categoryElem.innerText = category;
    msgElem.innerText = msg;

    document.getElementById('bmi-result-card').classList.remove('hidden');
}

// ------ INIT SYNC ------
window.addEventListener('load', () => {
    // Wait slightly for WASM Module to initialize
    setTimeout(() => {
        if (!window.Module || !window.Module.ccall) return;
        
        let savedPatients = localStorage.getItem('patients_db');
        if (!savedPatients) {
            savedPatients = `P001|John Doe|45|555-1234
P002|Jane Smith|30|555-5678
P003|Alice Johnson|60|555-8765
P004|Bob Williams|25|555-4321
P005|Charlie Brown|12|555-9999
P006|Diana Prince|29|555-8888
P007|Ethan Hunt|40|555-7777
P008|Fiona Gallagher|35|555-6666
P009|George R|55|555-5555
P010|Hannah Abbott|19|555-4444\n`;
            localStorage.setItem('patients_db', savedPatients);
        }

        if (savedPatients) {
            savedPatients.split('\n').filter(p=>p.trim()!=='').forEach(line => {
                const parts = line.split('|');
                if(parts.length >= 4) {
                   Module.ccall('registerPatient_js', null, ['string', 'string', 'number', 'string'], [parts[0], parts[1], parseInt(parts[2]), parts[3]]);
                }
            });
        }

        let savedVisits = localStorage.getItem('visits_db');
        if (!savedVisits) {
            savedVisits = `P001|2023-01-15|Flu|Rest and hydration
P001|2023-02-10|Follow up|Vitamins
P001|2023-05-22|Allergy|Antihistamines
P002|2023-03-05|Sprained Ankle|Ice and Rest
P002|2023-03-20|Follow up|Physical Therapy
P003|2023-04-11|Hypertension|Lisinopril
P003|2023-06-15|Routine Checkup|None
P003|2023-08-10|High Cholesterol|Statins
P003|2023-10-01|Follow up|Continue Medications
P004|2023-07-07|Migraine|Painkillers
P005|2023-01-10|Common Cold|Cough syrup
P005|2023-09-05|Fever|Acetaminophen
P006|2023-05-18|Back Pain|Muscle Relaxants
P006|2023-06-02|Follow up|Physical Therapy
P006|2023-07-20|Checkup|None
P007|2023-11-11|Knee Injury|Surgery Consult
P007|2023-11-25|Post-op|Rest
P007|2023-12-10|Rehab|Physical Therapy
P007|2023-12-24|Follow up|None
P007|2024-01-15|Final Check|Cleared
P008|2023-08-20|Asthma|Inhaler
P009|2023-02-14|Diabetes Check|Insulin
P009|2023-06-14|Routine Check|Keep Diet\n`;
            localStorage.setItem('visits_db', savedVisits);
        }

        if (savedVisits) {
            savedVisits.split('\n').filter(p=>p.trim()!=='').forEach(line => {
                const parts = line.split('|');
                if(parts.length >= 4) {
                   Module.ccall('addVisit_js', null, ['string', 'string', 'string', 'string'], [parts[0], parts[1], parts[2], parts[3]]);
                }
            });
        }
        clearTerminal();
    }, 500);
});
