
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Dashboard from './dashboard.js';
import * as Transactions from './transactions.js';

// --- Seletores de Login/Registro ---
const formLogin = document.getElementById('form-login');
const formRegister = document.getElementById('form-register');
const formForgotPassword = document.getElementById('form-forgot-password');

const loginError = document.getElementById('login-error');
const registerError = document.getElementById('register-error');
const forgotError = document.getElementById('forgot-error');

const loginIdentifierInput = document.getElementById('login-identifier');
const loginPasswordInput = document.getElementById('login-password');
const registerUsernameInput = document.getElementById('register-username');
const registerEmailInput = document.getElementById('register-email');
const registerPasswordInput = document.getElementById('register-password');
const forgotIdentifierInput = document.getElementById('forgot-identifier');
const forgotNewPasswordInput = document.getElementById('forgot-new-password');


function clearErrors() {
    loginError.textContent = '';
    registerError.textContent = '';
    forgotError.textContent = '';
}

function showAuthForm(formToShow) {
    formLogin.style.display = 'none';
    formRegister.style.display = 'none';
    formForgotPassword.style.display = 'none';

    formToShow.style.display = 'flex';
    clearErrors();
}

// --- Handlers de Autenticação ---

export function handleRegister(e) {
    e.preventDefault();
    const username = registerUsernameInput.value;
    const email = registerEmailInput.value;
    const password = registerPasswordInput.value;

    if (!username || !email || !password) {
        registerError.textContent = 'Todos os campos são obrigatórios.';
        return;
    }

    let users = JSON.parse(localStorage.getItem(Data.USERS_DB_KEY)) || [];

    if (users.find(user => user.username === username)) {
        registerError.textContent = 'Este nome de usuário já existe.';
        return;
    }
    if (users.find(user => user.email === email)) {
        registerError.textContent = 'Este email já está em uso.';
        return;
    }

    users.push({ username, email, password });
    localStorage.setItem(Data.USERS_DB_KEY, JSON.stringify(users));

    alert('Usuário registrado com sucesso! Faça o login.');
    showAuthForm(formLogin);
}

export function handleLogin(e) {
    e.preventDefault();
    const identifier = loginIdentifierInput.value;
    const password = loginPasswordInput.value;

    let users = JSON.parse(localStorage.getItem(Data.USERS_DB_KEY)) || [];

    const user = users.find(user =>
        (user.email === identifier || user.username === identifier)
    );

    if (user && user.password === password) {
        // SUCESSO
        Data.setStorageKey(user.username);
        const { rendaTotal, transacoes } = Data.loadData();
        UI.showAppScreen(user.username, rendaTotal, transacoes);
        Dashboard.atualizarTudo();
        Transactions.filtrarDespesas();
    } else {
        // Falha
        loginError.textContent = 'Email, usuário ou senha inválidos.';
    }
}

export function handleForgotPassword(e) {
    e.preventDefault();
    const identifier = forgotIdentifierInput.value;
    const newPassword = forgotNewPasswordInput.value;

    if (!identifier || !newPassword) {
        forgotError.textContent = 'Todos os campos são obrigatórios.';
        return;
    }

    let users = JSON.parse(localStorage.getItem(Data.USERS_DB_KEY)) || [];

    const userIndex = users.findIndex(user =>
        user.email === identifier || user.username === identifier
    );

    if (userIndex > -1) {
        users[userIndex].password = newPassword;
        localStorage.setItem(Data.USERS_DB_KEY, JSON.stringify(users));

        alert('Senha redefinida com sucesso! Faça o login com sua nova senha.');

        showAuthForm(formLogin);
    } else {
        forgotError.textContent = 'Email ou Nome de Usuário não encontrado.';
    }
}

export function handleLogout() {
    localStorage.removeItem(Data.CURRENT_USER_KEY);
    
    // Limpa o estado e a UI
    Data.clearState();
    UI.resetarListaDOM();
    UI.getRendaInput().value = '';
    UI.getFilterElements().buscaInput.value = '';
    UI.getFilterElements().filtroDia.value = '';
    UI.getFilterElements().filtroMes.value = '';
    UI.getFilterElements().filtroAno.value = '';
    
    Dashboard.atualizarTudo();
    
    UI.showLoginScreen();
}

export function checkLoginStatus() {
    const loggedInUser = localStorage.getItem(Data.CURRENT_USER_KEY);
    if (loggedInUser) {
        Data.setStorageKey(loggedInUser);
        const { rendaTotal, transacoes } = Data.loadData();
        UI.showAppScreen(loggedInUser, rendaTotal, transacoes);
        Dashboard.atualizarTudo();
        Transactions.filtrarDespesas();
    } else {
        UI.showLoginScreen();
    }
}

// --- Listeners de Toggle ---

export function initAuthListeners() {
    formLogin.addEventListener('submit', handleLogin);
    formRegister.addEventListener('submit', handleRegister);
    formForgotPassword.addEventListener('submit', handleForgotPassword);
    
    document.getElementById('toggle-to-register').addEventListener('click', () => showAuthForm(formRegister));
    document.getElementById('toggle-to-login').addEventListener('click', () => showAuthForm(formLogin));
    document.getElementById('toggle-to-forgot').addEventListener('click', () => showAuthForm(formForgotPassword));
    document.getElementById('toggle-to-login-from-forgot').addEventListener('click', () => showAuthForm(formLogin));
}