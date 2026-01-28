import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBDsHh-v2-vKzjR4aYLVe_5vXlq5N0dJK8",
    authDomain: "cogestionescuola.firebaseapp.com",
    projectId: "cogestionescuola",
    storageBucket: "cogestionescuola.firebasestorage.app",
    messagingSenderId: "872783196115",
    appId: "1:872783196115:web:a71f4648f605b546d68926"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg = document.getElementById('error-message');
const logoutBtn = document.getElementById('logout-btn');

const studentNameEl = document.getElementById('student-name');
const studentClassEl = document.getElementById('student-class');
const scheduleBody = document.getElementById('schedule-body');

onAuthStateChanged(auth, async (user) => {
    if (user) {
        loginView.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        
        await loadUserData(user.uid);
    } else {
        dashboardView.classList.add('hidden');
        loginView.classList.remove('hidden');
        loginForm.reset();
    }
});

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput.value;
    const password = passwordInput.value;
    errorMsg.textContent = "";

    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error("Errore Login:", error);
        errorMsg.textContent = "Email o password non corretti.";
    }
});

logoutBtn.addEventListener('click', () => {
    signOut(auth);
});

async function loadUserData(uid) {
    try {
        const docRef = doc(db, "studenti", uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            studentNameEl.textContent = `${data.nome} ${data.cognome}`;
            studentClassEl.textContent = data.classe;

            const inizialeNome = data.nome ? data.nome.charAt(0).toUpperCase() : "";
            const inizialeCognome = data.cognome ? data.cognome.charAt(0).toUpperCase() : "";
            
            const avatarEl = document.getElementById('user-avatar');
            if (avatarEl) {
                avatarEl.textContent = `${inizialeNome}${inizialeCognome}`;
            }

            renderSchedule(data.orario);
        } else {
            console.log("Nessun documento trovato per questo studente!");
            studentNameEl.textContent = "Studente non trovato";
        }
    } catch (error) {
        console.error("Errore recupero dati:", error);
    }
}

function renderSchedule(scheduleArray) {
    scheduleBody.innerHTML = ""; 

    if (!scheduleArray || scheduleArray.length === 0) {
        scheduleBody.innerHTML = "<tr><td colspan='4'>Nessuna attività programmata</td></tr>";
        return;
    }

    scheduleArray.sort((a, b) => a.ora - b.ora);

    scheduleArray.forEach(item => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${item.ora}°</td>
            <td>${item.fascia}</td>
            <td><strong>${item.aula || '-'}</strong></td> 
            <td>${item.lezione}</td>
        `;
        scheduleBody.appendChild(row);
    });
}