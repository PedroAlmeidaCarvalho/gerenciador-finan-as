
// --- Constantes Globais ---
export const USERS_DB_KEY = 'financasAppUsers';
export const CURRENT_USER_KEY = 'financasAppCurrentUser';
export const BUDGET_PERCENTUALS = {
    essencial: 0.50,
    opcional: 0.30,
    investimento: 0.20
};
export let STORAGE_KEY;

// --- Estado da Aplicação ---
export let currentUser = null;
export let rendaTotal = 0.00;
export let gastoTotal = 0.00;
export let gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
export let transacoes = [];

// --- Funções de Persistência ---

export function setStorageKey(username) {
    currentUser = username;
    STORAGE_KEY = `financasAppDados_${username}`;
    localStorage.setItem(CURRENT_USER_KEY, username);
}

export function clearState() {
    currentUser = null;
    STORAGE_KEY = null;
    rendaTotal = 0.00;
    gastoTotal = 0.00;
    gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
    transacoes = [];
}

export function saveData() {
    if (!STORAGE_KEY) return;
    try {
        const dados = { rendaTotal, gastoTotal, gastosPorCategoria, transacoes };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
    } catch (error) {
        console.error('Erro ao salvar dados no localStorage:', error);
    }
}

export function loadData() {
    if (!STORAGE_KEY) return;

    try {
        const dadosSalvos = localStorage.getItem(STORAGE_KEY);
        if (dadosSalvos) {
            const dados = JSON.parse(dadosSalvos);
            rendaTotal = dados.rendaTotal || 0.00;
            gastoTotal = dados.gastoTotal || 0.00;
            gastosPorCategoria = dados.gastosPorCategoria || { essencial: 0, opcional: 0, investimento: 0 };
            transacoes = dados.transacoes || [];
        } else {
            rendaTotal = 0.00;
            gastoTotal = 0.00;
            gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
            transacoes = [];
        }
    } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
        rendaTotal = 0.00;
        gastoTotal = 0.00;
        gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
        transacoes = [];
    }
    // Retorna os dados para serem usados pelos módulos de UI/Dashboard/Transactions
    return { rendaTotal, transacoes };
}

// --- Funções para alterar o estado ---

export function setRendaTotal(renda) {
    rendaTotal = renda;
}

export function addTransaction(despesa) {
    transacoes.unshift(despesa);
    gastoTotal += despesa.valor;
    gastosPorCategoria[despesa.categoria] += despesa.valor;
}

export function removeTransaction(id) {
    const transacaoIndex = transacoes.findIndex(t => t.id === id);
    if (transacaoIndex > -1) {
        const transacao = transacoes[transacaoIndex];
        gastoTotal -= transacao.valor;
        gastosPorCategoria[transacao.categoria] -= transacao.valor;
        transacoes.splice(transacaoIndex, 1);
        return true;
    }
    return false;
}

export function updateTransaction(id, novaDescricao, novoValor, novaCategoria) {
    const transacao = transacoes.find(t => t.id === id);
    if (!transacao) return false;

    const valorAntigo = transacao.valor;
    const categoriaAntiga = transacao.categoria;

    gastoTotal = (gastoTotal - valorAntigo) + novoValor;
    gastosPorCategoria[categoriaAntiga] -= valorAntigo;
    gastosPorCategoria[novaCategoria] += novoValor;

    transacao.valor = novoValor;
    transacao.categoria = novaCategoria;
    transacao.descricao = novaDescricao;
    return transacao;
}

export function resetTransactionData() {
    gastoTotal = 0.00;
    gastosPorCategoria = { essencial: 0.00, opcional: 0.00, investimento: 0.00 };
    transacoes = [];
}