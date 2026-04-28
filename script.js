
var atividades = JSON.parse(localStorage.getItem("registro")) || [];
alterarStatusAtividade()
renderizarTabela();


//localStorage.clear();

document.addEventListener("change", function (e) {
    if (e.target.classList.contains("check-table")) {

        let tr = e.target.closest("tr");
        let id = Number(tr.dataset.id);

        let atividade = atividades.find(a => a.id === id);

        atividade.pendente = !e.target.checked;

        renderizarTabela();

        alterarStatusAtividade();
    }
});


document.getElementById('form-todo').addEventListener('submit', function (event) {

    event.preventDefault();
    event.stopPropagation();
    let dados = new FormData(this);

    atividades.push(new Atividade(dados.get('atividade'), dados.get('classificacao'), dados.get('data')));
    localStorage.setItem("registro", JSON.stringify(atividades));
    alterarStatusAtividade()
    renderizarTabela();
    desenharGrafico();
    this.reset();

});
window.addEventListener('load', () => {
    let data = document.querySelector('#inputData')
    const hoje = new Date().toISOString().split("T")[0];
    data.setAttribute('min', hoje);
});
google.charts.load('current', { 'packages': ['geochart', 'bar', 'corechart'], });
google.charts.setOnLoadCallback(desenharGrafico);

function Atividade(atividade, classificacao, data) {
    this.id = Date.now() + Math.floor(Math.random() * 1000);
    this.atividade = atividade;
    this.classificacao = classificacao;
    this.data = data;
    this.pendente = true;
}

function contarPendencias() {
    return atividades.reduce((contador, atividade) => {
        if (atividade.pendente) {
            contador++;
        }
        return contador;
    }, 0);
}

function contarFinalizadas() {
    return atividades.reduce((contador, atividade) => {
        if (!atividade.pendente) {
            contador++;
        }
        return contador;
    }, 0);
}

function alterarStatusAtividade() {
    pendenteTag = document.querySelector('#pendente').innerText = `PENDENTES: ${contarPendencias()}`
    finalizadoTag = document.querySelector('#finalizado').innerText = `FINALIZADAS: ${contarFinalizadas()}`
    totalTag = document.querySelector('#total').innerText = `TOTAL: ${atividades.length}`


}

function renderizarTabela() {
    let tbody = document.querySelector("#tabela");

    tbody.innerHTML = atividades.map(a =>
        `
        <tr data-id="${a.id}">
            <td class="${a.pendente ? "" : "concluido"}">${a.atividade}</td>
            <td class="${a.pendente ? "" : "concluido"}">${a.classificacao}</td>
            <td class="${a.pendente ? "" : "concluido"}">${a.data}</td>
            <td>
                <input type="checkbox" class="check-table" ${a.pendente ? "" : "checked"}>
                <span class="delete-btn" style="cursor:pointer;">🗑️</span>
            </td>
        </tr>
    `).join("");
}

function desenharGrafico() {
    var data = google.visualization.arrayToDataTable([
        ['Classificação', 'Quantidade'],
        ['Lazer', contarPorClassificacao('Lazer')],
        ['Fisica', contarPorClassificacao('Física')],
        ['Domestico', contarPorClassificacao('Doméstica')],
        ['academico', contarPorClassificacao('Acadêmica')]
    ])

    var options = {
        width: 400,
        height: 150,
        legend: { position: "none" }
    }

    var chart = new google.visualization.ColumnChart(document.getElementById("graficoPrincipal"));
    chart.draw(data, options);
}

function contarPorClassificacao(classificacao) {
    return atividades.reduce((contador, atividade) => {
        if (atividade.classificacao === classificacao) {
            contador++;
        }
        return contador;
    }, 0);
}

document.addEventListener("click", function (e) {
    if (e.target.classList.contains("delete-btn")) {

        let tr = e.target.closest("tr");
        let id = Number(tr.dataset.id);

        removerAtividade(id);
    }
});

function removerAtividade(id) {

    atividades = atividades.filter(a => a.id !== id);

    localStorage.setItem("registro", JSON.stringify(atividades));

    renderizarTabelaRemovida();
    alterarStatusAtividade();
    desenharGrafico();
}

document.getElementById("filtroTipo").addEventListener("change", function () {
    renderizarTabela();
});

function renderizarTabela() {
    let tbody = document.querySelector("#tabela");

    let tipo = document.getElementById("filtroTipo").value;
    let pendente = document.getElementById("filtroPendentes").checked;
    let finalizada = document.getElementById("filtroFinalizadas").checked;

    let lista = atividades.filter(a => {

        if (tipo !== "todos" && a.classificacao !== tipo) {
            return false;
        }

        if (pendente && !finalizada && !a.pendente) {
            return false;
        }

        if (!pendente && finalizada && a.pendente) {
            return false;
        }

        return true;
    });

    tbody.innerHTML = lista.map(a =>
        `
        <tr data-id="${a.id}">
            <td class="${a.pendente ? "" : "concluido"}">${a.atividade}</td>
            <td class="${a.pendente ? "" : "concluido"}">${a.classificacao}</td>
            <td class="${a.pendente ? "" : "concluido"}">${a.data}</td>
            <td>
                <input type="checkbox" class="check-table" ${a.pendente ? "" : "checked"}>
                <span class="delete-btn">🗑️</span>
            </td>
        </tr>
        `
    ).join("");
}
document.getElementById("filtroPendentes").addEventListener("change", renderizarTabela);

document.getElementById("filtroFinalizadas").addEventListener("change", renderizarTabela);
