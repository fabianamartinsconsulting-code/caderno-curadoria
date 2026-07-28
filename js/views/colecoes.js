import { state, LISTAS, saveRow, deleteRow, reloadAll, renderView, showModal, closeModal, toast, optionsHtml, slugStatus } from "../app.js";

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
  const list = state.colecoes;
  root.innerHTML = `
    <div class="eyebrow">Por temporada</div>
    <h1 class="page-title">Coleções</h1>
    <p class="page-sub">${list.length} coleção${list.length === 1 ? "" : "ões"} cadastrada${list.length === 1 ? "" : "s"}.</p>
    <div id="cl-list"></div>
  `;
  const listEl = root.querySelector("#cl-list");
  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">▤</span>Nenhuma coleção registrada ainda.</div>`;
    return;
  }
  list.forEach(cl => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="row-between">
        <div style="font-weight:600;">${cl.nome}</div>
        ${cl.status ? `<span class="status-badge status-${slugStatus(cl.status)}">${cl.status}</span>` : ""}
      </div>
      <div class="small" style="margin:4px 0;">${marcaNome(cl.marca_id)} · ${[cl.temporada, cl.ano].filter(Boolean).join(" ")}</div>
      ${cl.pecas_chave ? `<div class="small" style="color:var(--ink);">${cl.pecas_chave}</div>` : ""}
    `;
    card.addEventListener("click", () => openForm(cl));
    listEl.appendChild(card);
  });
}

function openForm(cl = {}) {
  const marcaOptions = state.marcas.map(m => `<option value="${m.id}" ${m.id === cl.marca_id ? "selected" : ""}>${m.marca}</option>`).join("");
  showModal(`
    <div class="modal-header"><h2>${cl.id ? "Editar coleção" : "Nova coleção"}</h2></div>
    <form id="cl-form">
      <label>Marca</label><select name="marca_id"><option value="">—</option>${marcaOptions}</select>
      <label>Temporada</label><select name="temporada">${optionsHtml(LISTAS.temporadas, cl.temporada)}</select>
      <label>Ano</label><input name="ano" type="number" value="${cl.ano ?? new Date().getFullYear()}" />
      <label>Nome da coleção *</label><input name="nome" required value="${cl.nome || ""}" />
      <label>Peças-chave</label><textarea name="pecas_chave">${cl.pecas_chave || ""}</textarea>
      <label>Preço médio (R$)</label><input name="preco_medio" type="number" step="0.01" value="${cl.preco_medio ?? ""}" />
      <label>Lookbook (link)</label><input name="lookbook_link" value="${cl.lookbook_link || ""}" />
      <label>Status</label><select name="status">${optionsHtml(LISTAS.statusColecoes, cl.status || "Em produção")}</select>
      <label>Observações</label><textarea name="observacoes">${cl.observacoes || ""}</textarea>

      <button class="btn btn-primary btn-block" type="submit">Salvar</button>
      ${cl.id ? `<button class="btn btn-danger btn-block" type="button" id="del-btn" style="margin-top:8px;">Excluir</button>` : ""}
    </form>
  `);

  document.getElementById("cl-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = Object.fromEntries(new FormData(e.target).entries());
    row.ano = row.ano === "" ? null : Number(row.ano);
    row.preco_medio = row.preco_medio === "" ? null : Number(row.preco_medio);
    row.marca_id = row.marca_id || null;
    if (cl.id) row.id = cl.id;
    try {
      await saveRow("colecoes", row);
      await reloadAll();
      closeModal();
      toast("Coleção salva.");
      renderView("colecoes");
    } catch (err) { toast("Erro: " + err.message); }
  });

  const delBtn = document.getElementById("del-btn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm(`Excluir "${cl.nome}"?`)) return;
    await deleteRow("colecoes", cl.id);
    await reloadAll();
    closeModal();
    toast("Coleção excluída.");
    renderView("colecoes");
  });
}
