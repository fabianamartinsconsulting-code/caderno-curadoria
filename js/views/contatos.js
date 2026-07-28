import { state, LISTAS, saveRow, deleteRow, reloadAll, renderView, showModal, closeModal, toast, optionsHtml, fmtDate } from "../app.js";

export async function render(root) {
  const fab = document.getElementById("fab-add");
  fab.style.display = "flex";
  fab.onclick = () => openForm();
  paint(root);
}

function marcaNome(id) {
  const m = state.marcas.find(x => x.id === id);
  return m ? m.marca : "—";
}

function paint(root) {
  const list = state.contatos;
  root.innerHTML = `
    <div class="eyebrow">Histórico</div>
    <h1 class="page-title">Contatos</h1>
    <p class="page-sub">${list.length} registro${list.length === 1 ? "" : "s"} de conversa.</p>
    <div id="ct-list"></div>
  `;
  const listEl = root.querySelector("#ct-list");
  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">✎</span>Nenhum contato registrado ainda.</div>`;
    return;
  }
  const hoje = new Date().toISOString().slice(0, 10);
  list.forEach(ct => {
    const atrasado = ct.data_followup && ct.data_followup < hoje && ct.status !== "Concluído";
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="row-between">
        <div style="font-weight:600;">${marcaNome(ct.marca_id)}</div>
        <div class="small">${fmtDate(ct.data)}</div>
      </div>
      <div class="small" style="margin:4px 0;">${ct.tipo || "—"} · ${ct.responsavel || "—"}</div>
      ${ct.resumo ? `<div class="small" style="color:var(--ink);">${ct.resumo}</div>` : ""}
      ${ct.data_followup ? `<div class="small" style="margin-top:6px; ${atrasado ? "color:var(--rust); font-weight:600;" : ""}">Follow-up: ${fmtDate(ct.data_followup)} ${atrasado ? "⚠ atrasado" : ""}</div>` : ""}
    `;
    card.addEventListener("click", () => openForm(ct));
    listEl.appendChild(card);
  });
}

function openForm(ct = {}) {
  const marcaOptions = state.marcas.map(m => `<option value="${m.id}" ${m.id === ct.marca_id ? "selected" : ""}>${m.marca}</option>`).join("");
  showModal(`
    <div class="modal-header"><h2>${ct.id ? "Editar contato" : "Novo contato"}</h2></div>
    <form id="ct-form">
      <label>Marca *</label><select name="marca_id" required><option value="">Selecione…</option>${marcaOptions}</select>
      <label>Data</label><input name="data" type="date" value="${ct.data || new Date().toISOString().slice(0,10)}" />
      <label>Tipo de contato</label><select name="tipo">${optionsHtml(LISTAS.tiposContato, ct.tipo)}</select>
      <label>Responsável</label><input name="responsavel" value="${ct.responsavel || ""}" />
      <label>Resumo da conversa</label><textarea name="resumo">${ct.resumo || ""}</textarea>
      <label>Próximo passo</label><textarea name="proximo_passo">${ct.proximo_passo || ""}</textarea>
      <label>Data do follow-up</label><input name="data_followup" type="date" value="${ct.data_followup || ""}" />
      <label>Status</label><select name="status">${optionsHtml(LISTAS.statusContatos, ct.status || "Em conversa")}</select>

      <button class="btn btn-primary btn-block" type="submit">Salvar</button>
      ${ct.id ? `<button class="btn btn-danger btn-block" type="button" id="del-btn" style="margin-top:8px;">Excluir</button>` : ""}
    </form>
  `);

  document.getElementById("ct-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = Object.fromEntries(new FormData(e.target).entries());
    row.data_followup = row.data_followup || null;
    if (ct.id) row.id = ct.id;
    try {
      await saveRow("contatos", row);
      await reloadAll();
      closeModal();
      toast("Contato salvo.");
      renderView("contatos");
    } catch (err) { toast("Erro: " + err.message); }
  });

  const delBtn = document.getElementById("del-btn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm("Excluir este registro de contato?")) return;
    await deleteRow("contatos", ct.id);
    await reloadAll();
    closeModal();
    toast("Contato excluído.");
    renderView("contatos");
  });
}
