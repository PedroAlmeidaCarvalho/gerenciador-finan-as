
import * as Data from './data.js';
import * as UI from './ui.js';
import * as Dashboard from './dashboard.js';

// --- Seletores do Formulário e Filtros ---
const { editIdInput, descricaoInput, valorInput, categoriaSelect } = UI.getFormElements();
const { buscaInput, filtroDia, filtroMes, filtroAno, listaTransacoes } = UI.getFilterElements();

// --- Função de Validação Reutilizável ---
function validarTransacao(descricao, valor, categoria) {
    if (descricao.trim() === '') {
        UI.notificacaoErro('Preencha a descrição da transação.');
        return false;
    }
    if (isNaN(valor) || valor <= 0) {
        UI.notificacaoErro('Insira um valor válido e maior que zero.');
        return false;
    }
    if (categoria === '') {
        UI.notificacaoErro('Selecione uma categoria.');
        return false;
    }
    if (Data.rendaTotal <= 0) {
        UI.notificacaoErro('Defina sua renda mensal primeiro.');
        return false;
    }
    return true;
}

// --- Handlers de Formulário ---

export function handleFormSubmit(e) {
    e.preventDefault();
    const idEdicao = editIdInput.value;
    idEdicao ? salvarEdicao(parseInt(idEdicao)) : adicionarDespesa();
}

function adicionarDespesa() {
    const descricao = descricaoInput.value;
    const valor = parseFloat(valorInput.value);
    const categoria = categoriaSelect.value;
    const timestamp = Date.now();

    if (!validarTransacao(descricao, valor, categoria)) return;

    const despesa = { id: timestamp, timestamp: timestamp, descricao, valor, categoria };

    Data.addTransaction(despesa);

    UI.adicionarDespesaDOM(despesa);
    Dashboard.atualizarTudo();
    UI.limparFormulario();
    UI.notificacaoSucesso('Despesa adicionada com sucesso!');
    filtrarDespesas();
}

export function iniciarEdicao(id) {
    const transacao = Data.transacoes.find(t => t.id === id);
    if (!transacao) return;

    UI.setEditMode(transacao);
}

function salvarEdicao(id) {
    const transacao = Data.transacoes.find(t => t.id === id);
    if (!transacao) return;

    const novoValor = parseFloat(valorInput.value);
    const novaCategoria = categoriaSelect.value;
    const novaDescricao = descricaoInput.value;

    if (!validarTransacao(novaDescricao, novoValor, novaCategoria)) return;

    const transacaoAtualizada = Data.updateTransaction(id, novaDescricao, novoValor, novaCategoria);
    if (transacaoAtualizada) {
        UI.updateDespesaDOM(id, transacaoAtualizada);
        UI.cancelEditMode();
        Dashboard.atualizarTudo();
        UI.notificacaoSucesso('Transação atualizada com sucesso!');
        filtrarDespesas();
    }
}

export function cancelarEdicao() {
    UI.cancelEditMode();
}

function excluirTransacao(id) {
    if (confirm('Tem certeza que deseja excluir esta despesa?')) {
        if (Data.removeTransaction(id)) {
            UI.removeDespesaDOM(id);
            Dashboard.atualizarTudo();
            UI.notificacaoSucesso('Despesa excluída!');
        }
    }
}

export function resetarMes(confirmar = true) {
    if (confirmar && !confirm('Você tem certeza que deseja resetar o mês? Todas as suas despesas serão apagadas.')) return;

    Data.resetTransactionData();
    UI.resetarListaDOM();

    // Limpa campos de filtro
    buscaInput.value = '';
    filtroDia.value = '';
    filtroMes.value = '';
    filtroAno.value = '';

    Dashboard.atualizarTudo();
    UI.cancelEditMode();
    UI.notificacaoSucesso('Mês resetado com sucesso!');
}

// --- Funções de Filtro ---

export function filtrarDespesas() {
    const termoBusca = buscaInput.value.toLowerCase();
    const diaFiltro = filtroDia.value;
    const mesFiltro = filtroMes.value;
    const anoFiltro = filtroAno.value;

    const itens = listaTransacoes.querySelectorAll('li');

    itens.forEach(item => {
        const descricao = item.querySelector('.transacao-descricao').textContent.toLowerCase();
        const timestamp = item.dataset.timestamp;

        let matchDesc = termoBusca ? descricao.includes(termoBusca) : true;
        let matchDia = true;
        let matchMes = true;
        let matchAno = true;

        if (timestamp) {
            const dataItem = new Date(parseInt(timestamp));
            const diaItem = dataItem.getDate();
            const mesItem = dataItem.getMonth() + 1;
            const anoItem = dataItem.getFullYear();

            if (diaFiltro) matchDia = (diaItem == diaFiltro);
            if (mesFiltro) matchMes = (mesItem == mesFiltro);
            if (anoFiltro) matchAno = (anoItem == anoFiltro);
        }

        if (matchDesc && matchDia && matchMes && matchAno) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// --- Listener de Ações na Lista (Editar/Deletar) ---

export function handleListClick(e) {
    const targetButton = e.target.closest('button');
    if (!targetButton) return;

    const id = parseInt(targetButton.dataset.id);
    if (targetButton.classList.contains('btn-delete')) {
        excluirTransacao(id);
    } else if (targetButton.classList.contains('btn-edit')) {
        iniciarEdicao(id);
    }
}