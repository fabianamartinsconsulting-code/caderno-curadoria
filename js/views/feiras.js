import { state, LISTAS, saveRow, deleteRow, reloadAll, renderView, showModal, closeModal, toast, optionsHtml, fmtDate, slugStatus } from "../app.js";

export async function render(root) {
  const fab = document.getElementById("fab-add");
  fab.style.display = "flex";
  fab.onclick = () => openForm();
  paint(root);
}

function paint(root) {
  const list = state.feiras;
  root.innerHTML = `
    <div class="eyebrow">Agenda</div>
    <h1 class="page-title">Feiras e Eventos</h1>
    <p class="page-sub">${list.length} evento${list.length === 1 ? "" : "s"} registrado${list.length === 1 ? "" : "s"}.</p>
    <div id="ev-list"></div>
  `;
  const listEl = root.querySelector("#ev-list");
  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">▲</span>Nenhum evento registrado ainda.</div>`;
    return;
  }
  list.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="row-between">
        <div style="font-weight:600;">${ev.nome}</div>
        ${ev.status ? `<span class="status-badge status-${slugStatus(ev.status)}">${ev.status}</span>` : ""}
      </div>
      <div class="small" style="margin:4px 0;">${ev.tipo || "—"} · ${[ev.cidade, ev.estado].filter(Boolean).join("/") || "—"}</div>
      <div class="small">${fmtDate(ev.data_inicio)} — ${fmtDate(ev.data_fim)}</div>
    `;
    card.addEventListener("click", () => openForm(ev));
    listEl.appendChild(card);
  });
}

function openForm(ev = {}) {
  showModal(`
    <div class="modal-header"><h2>${ev.id ? "Editar evento" : "Novo evento"}</h2></div>
    <form id="ev-form">
      <label>Nome do evento *</label><input name="nome" required value="${ev.nome || ""}" />
      <label>Tipo</label><select name="tipo">${optionsHtml(LISTAS.tiposEvento, ev.tipo)}</select>
      <label>Cidade</label><input name="cidade" value="${ev.cidade || ""}" />
      <label>Estado</label><select name="estado">${optionsHtml(LISTAS.estados, ev.estado)}</select>
      <label>Data início</label><input name="data_inicio" type="date" value="${ev.data_inicio || ""}" />
      <label>Data fim</label><input name="data_fim" type="date" value="${ev.data_fim || ""}" />
      <label>Marcas visitadas</label><textarea name="marcas_visitadas">${ev.marcas_visitadas || ""}</textarea>
      <label>Contatos feitos</label><textarea name="contatos_feitos">${ev.contatos_feitos || ""}</textarea>
      <label>Oportunidades identificadas</label><textarea name="oportunidades">${ev.oportunidades || ""}</textarea>
      <label>Status</label><select name="status">${optionsHtml(LISTAS.statusEventos, ev.status || "Planejado")}</select>
      <label>Observações</label><textarea name="observacoes">${ev.observacoes || ""}</textarea>

      <button class="btn btn-primary btn-block" type="submit">Salvar</button>
      ${ev.id ? `<button class="btn btn-danger btn-block" type="button" id="del-btn" style="margin-top:8px;">Excluir</button>` : ""}
    </form>
  `);

  document.getElementById("ev-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = Object.fromEntries(new FormData(e.target).entries());
    row.data_inicio = row.data_inicio || null;
    row.data_fim = row.data_fim || null;
    if (ev.id) row.id = ev.id;
    try {
      await saveRow("feiras_eventos", row);
      await reloadAll();
      closeModal();
      toast("Evento salvo.");
      renderView("feiras");
    } catch (err) { toast("Erro: " + err.message); }
  });

  const delBtn = document.getElementById("del-btn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm(`Excluir "${ev.nome}"?`)) return;
    await deleteRow("feiras_eventos", ev.id);
    await reloadAll();
    closeModal();
    toast("Evento excluído.");
    renderView("feiras");
  });
}
