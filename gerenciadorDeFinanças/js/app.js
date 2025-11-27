
// js/app.js
import * as Auth from './modules/auth.js'; // CAMINHO CORRETO
import * as Dashboard from './modules/dashboard.js'; // CAMINHO CORRETO
import * as Transactions from './modules/transactions.js'; // CAMINHO CORRETO

document.addEventListener('DOMContentLoaded', () => {

    // --- Seletores do DOM usados diretamente na inicialização ---
    const btnDefinirRenda = document.getElementById('btn-definir-renda');
    const btnResetar = document.getElementById('btn-resetar');
    const balancoCircle = document.getElementById('balanco-circle');
    const btnLogout = document.getElementById('btn-logout');
    const formTransacao = document.getElementById('form-transacao');
    const listaTransacoes = document.getElementById('lista-transacoes');
    const categoriaSelect = document.getElementById('categoria');
    const buscaInput = document.getElementById('input-busca');
    const filtroDia = document.getElementById('filtro-dia');
    const filtroMes = document.getElementById('filtro-mes');
    const filtroAno = document.getElementById('filtro-ano');
    const btnCancelEdit = document.getElementById('btn-cancel-edit');

    // --- Inicialização de Módulos (Listeners) ---

    // 1. Listeners de Autenticação (Login/Registro/Logout)
    Auth.initAuthListeners();
    btnLogout.addEventListener('click', Auth.handleLogout);

    // 2. Listeners do Dashboard (Renda e Visualização)
    btnDefinirRenda.addEventListener('click', Dashboard.definirRenda);
    // Usa um listener para expandir/recolher o dashboard
    balancoCircle.addEventListener('click', () => {
        Dashboard.toggleDashboard();
        if (document.getElementById('orcamento-visual').classList.contains('ativo')) {
            Dashboard.animarBordasPequenas();
        }
    });

    // 3. Listeners de Transações (Formulário, Edição e Filtros)
    formTransacao.addEventListener('submit', Transactions.handleFormSubmit);
    listaTransacoes.addEventListener('click', Transactions.handleListClick);
    btnResetar.addEventListener('click', () => Transactions.resetarMes(true));
    btnCancelEdit.addEventListener('click', Transactions.cancelarEdicao);

    // 4. Listeners de Filtro e Categoria
    buscaInput.addEventListener('input', Transactions.filtrarDespesas);
    filtroDia.addEventListener('input', Transactions.filtrarDespesas);
    filtroMes.addEventListener('input', Transactions.filtrarDespesas);
    filtroAno.addEventListener('input', Transactions.filtrarDespesas);

    categoriaSelect.addEventListener('change', () => {
        categoriaSelect.className = categoriaSelect.value;
    });

    // 5. Inicialização (Verifica se o usuário está logado)
    Auth.checkLoginStatus();
});