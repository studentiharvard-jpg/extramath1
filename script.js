const ADMIN_PASS = "As1lbek_1221";
let userSelections = {};
let myChart = null; // Grafikni saqlash uchun

function showUserForm() {
    document.getElementById('home-card').classList.add('hidden');
    document.getElementById('user-info-card').classList.remove('hidden');
}

function loginAdmin() {
    let pass = prompt("Admin parolini kiriting:");
    if (pass === ADMIN_PASS) {
        document.getElementById('home-card').classList.add('hidden');
        document.getElementById('admin-panel').classList.remove('hidden');
        buildGrid('admin-questions-grid', 'admin');
    } else if (pass !== null) {
        alert("Parol noto'g'ri!");
    }
}

function buildGrid(containerId, mode) {
    const grid = document.getElementById(containerId);
    grid.innerHTML = "";
    for (let i = 1; i <= 45; i++) {
        const row = document.createElement('div');
        row.className = 'q-row';
        if (i <= 35) {
            row.innerHTML = `<b>${i}. Savol</b>
                <div class="options" id="opts-${mode}-${i}">
                    ${['A','B','C','D'].map(opt => `<button class="opt-btn" onclick="handleSelect('${mode}', ${i}, '${opt}')" id="btn-${mode}-${i}-${opt}">${opt}</button>`).join('')}
                </div>`;
        } else {
            row.innerHTML = `<b>${i}. Ochiq savol</b>
                <div class="open-inputs">
                    <input type="text" id="${mode}-${i}a" placeholder="a)">
                    <input type="text" id="${mode}-${i}b" placeholder="b)">
                </div>`;
        }
        grid.appendChild(row);
    }
}

function handleSelect(mode, qId, val) {
    document.querySelectorAll(`#opts-${mode}-${qId} .opt-btn`).forEach(b => b.classList.remove('selected'));
    document.getElementById(`btn-${mode}-${qId}-${val}`).classList.add('selected');
    if(mode === 'user') userSelections[qId] = val;
}

function saveAdminKeys() {
    const code = document.getElementById('newTestCode').value.trim();
    if(!code) return alert("Test kodini kiriting!");
    
    let keys = { closed: {}, open: {} };
    for (let i = 1; i <= 35; i++) {
        const sel = document.querySelector(`#opts-admin-${i} .selected`);
        keys.closed[i] = sel ? sel.innerText : null;
    }
    for (let i = 36; i <= 45; i++) {
        keys.open[i] = {
            a: document.getElementById(`admin-${i}a`).value.trim(),
            b: document.getElementById(`admin-${i}b`).value.trim()
        };
    }
    localStorage.setItem('extra_' + code, JSON.stringify(keys));
    alert(`Kod ${code} muvaffaqiyatli faollashtirildi!`);
    location.reload();
}

function openTestSheet() {
    const code = document.getElementById('userTestCode').value.trim();
    if (!localStorage.getItem('extra_' + code)) return alert("Bunday kodli test mavjud emas!");
    
    document.getElementById('user-info-card').classList.add('hidden');
    document.getElementById('test-sheet').classList.remove('hidden');
    buildGrid('questions-grid', 'user');
}

// NATIJANI HISOBLASH VA SAQLASH (XATOLARNI KO'RSATISH BILAN)
function calculateFinalResult() {
    const code = document.getElementById('userTestCode').value.trim();
    const name = document.getElementById('userName').value.trim() || "Noma'lum";
    const correct = JSON.parse(localStorage.getItem('extra_' + code));
    let totalScore = 0;
    let analysis = {}; 

    // 1-35 yopiq savollar
    for (let i = 1; i <= 35; i++) {
        const userChoice = userSelections[i]; 
        const rightAns = correct.closed[i];
        
        const userBtn = document.getElementById(`btn-user-${i}-${userChoice}`);
        const rightBtn = document.getElementById(`btn-user-${i}-${rightAns}`);

        if (userChoice === rightAns) {
            if(userBtn) userBtn.classList.add('correct');
            totalScore++;
            analysis[i] = 1;
        } else {
            if(userBtn) userBtn.classList.add('wrong');
            if(rightBtn) rightBtn.classList.add('correct');
            analysis[i] = 0;
        }
    }

    // 36-45 ochiq savollar
    for (let i = 36; i <= 45; i++) {
        const uaInput = document.getElementById(`user-${i}a`);
        const ubInput = document.getElementById(`user-${i}b`);
        const ca = correct.open[i].a;
        const cb = correct.open[i].b;

        // a qismi
        if (uaInput.value.trim() === ca) {
            totalScore++;
            uaInput.style.borderColor = "var(--success)";
            analysis[`${i}a`] = 1;
        } else {
            uaInput.style.borderColor = "var(--error)";
            uaInput.value = `${uaInput.value} (To'g'ri: ${ca})`;
            analysis[`${i}a`] = 0;
        }

        // b qismi
        if (ubInput.value.trim() === cb) {
            totalScore++;
            ubInput.style.borderColor = "var(--success)";
            analysis[`${i}b`] = 1;
        } else {
            ubInput.style.borderColor = "var(--error)";
            ubInput.value = `${ubInput.value} (To'g'ri: ${cb})`;
            analysis[`${i}b`] = 0;
        }
    }

    // Statistika uchun saqlash
    const resultData = { name: name, score: totalScore, details: analysis, date: new Date().toLocaleString() };
    let allResults = JSON.parse(localStorage.getItem('extra_results_' + code)) || [];
    allResults.push(resultData);
    localStorage.setItem('extra_results_' + code, JSON.stringify(allResults));

    alert(`Test yakunlandi! Natija: ${totalScore} ta to'g'ri.`);
    document.getElementById('checkBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');
}

// STATISTIKANI KO'RSATISH FUNKSIYASI
function showStats() {
    const code = document.getElementById('newTestCode').value.trim();
    if(!code) return alert("Avval test kodini yozing!");
    
    const results = JSON.parse(localStorage.getItem('extra_results_' + code)) || [];
    if(results.length === 0) return alert("Hali natijalar yo'q!");

    document.getElementById('admin-panel').classList.add('hidden');
    document.getElementById('stats-panel').classList.remove('hidden');

    // Ro'yxatni chiqarish
    const listDiv = document.getElementById('results-list');
    listDiv.innerHTML = results.map(r => `
        <div style="padding: 10px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between;">
            <span><b>${r.name}</b></span>
            <span style="color: #8263ff">${r.score} ta to'g'ri</span>
        </div>
    `).join('');

    // Grafik uchun ma'lumot tayyorlash
    const labels = [];
    const data = [];
    for(let i = 1; i <= 35; i++) {
        labels.push(i);
        let count = results.reduce((sum, res) => sum + (res.details[i] || 0), 0);
        data.push(count);
    }

    const ctx = document.getElementById('statsChart').getContext('2d');
    if(myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "To'g'ri topganlar soni",
                data: data,
                backgroundColor: '#8263ff'
            }]
        },
        options: { scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } } }
    });
}

function closeStats() {
    document.getElementById('stats-panel').classList.add('hidden');
    document.getElementById('admin-panel').classList.remove('hidden');
}

