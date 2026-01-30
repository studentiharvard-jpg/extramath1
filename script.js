
const ADMIN_PASS = "As1lbek_1221";
let userSelections = {};

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

function calculateFinalResult() {
    const code = document.getElementById('userTestCode').value.trim();
    const correct = JSON.parse(localStorage.getItem('extra_' + code));
    let totalScore = 0;

    // 1-35 tekshirish
    for (let i = 1; i <= 35; i++) {
        const userChoice = userSelections[i];
        const rightAns = correct.closed[i];
        const userBtn = document.getElementById(`btn-user-${i}-${userChoice}`);
        const rightBtn = document.getElementById(`btn-user-${i}-${rightAns}`);

        if (userChoice === rightAns) {
            if(userBtn) userBtn.classList.add('correct');
            totalScore++;
        } else {
            if(userBtn) userBtn.classList.add('wrong');
            if(rightBtn) rightBtn.classList.add('correct');
        }
    }

    // 36-45 tekshirish
    for (let i = 36; i <= 45; i++) {
        const ua = document.getElementById(`user-${i}a`).value.trim();
        const ub = document.getElementById(`user-${i}b`).value.trim();
        const ca = correct.open[i].a;
        const cb = correct.open[i].b;

        if (ua === ca) { totalScore++; document.getElementById(`user-${i}a`).style.borderColor = "var(--success)"; }
        else { document.getElementById(`user-${i}a`).style.borderColor = "var(--error)"; }

        if (ub === cb) { totalScore++; document.getElementById(`user-${i}b`).style.borderColor = "var(--success)"; }
        else { document.getElementById(`user-${i}b`).style.borderColor = "var(--error)"; }
    }

    alert(`Test yakunlandi! To'g'ri javoblar soni: ${totalScore}`);
    document.getElementById('checkBtn').classList.add('hidden');
    document.getElementById('resetBtn').classList.remove('hidden');
}