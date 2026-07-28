import { state, LISTAS, saveRow, deleteRow, reloadAll, renderView, showModal, closeModal, toast, optionsHtml } from "../app.js";

export async function render(root) {
  const fab = document.getElementById("fab-add");
  fab.style.display = "flex";
  fab.onclick = () => openForm();
  paint(root);
}

function paint(root) {
  const list = state.tendencias;
  root.innerHTML = `
    <div class="eyebrow">Referências por temporada</div>
    <h1 class="page-title">Tendências</h1>
    <p class="page-sub">${list.length} registro${list.length === 1 ? "" : "s"}.</p>
    <div id="td-list"></div>
  `;
  const listEl = root.querySelector("#td-list");
  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">❖</span>Nenhuma tendência registrada ainda.</div>`;
    return;
  }
  list.forEach(td => {
    const card = document.createElement("div");
    card.className = "card";
    card.style.cursor = "pointer";
    card.innerHTML = `
      <div class="row-between">
        <div style="font-weight:600;">${td.categoria || "—"}</div>
        <div class="small">${"★".repeat(td.relevancia || 0)}${"☆".repeat(5 - (td.relevancia || 0))}</div>
      </div>
      <div class="small" style="margin:4px 0;">${[td.temporada, td.ano].filter(Boolean).join(" · ")}</div>
      <div class="small" style="color:var(--ink);">${td.descricao}</div>
    `;
    card.addEventListener("click", () => openForm(td));
    listEl.appendChild(card);
  });
}

function openForm(td = {}) {
  showModal(`
    <div class="modal-header"><h2>${td.id ? "Editar tendência" : "Nova tendência"}</h2></div>
    <form id="td-form">
      <label>Temporada</label><select name="temporada">${optionsHtml(LISTAS.temporadas, td.temporada)}</select>
      <label>Ano</label><input name="ano" type="number" value="${td.ano ?? new Date().getFullYear()}" />
      <label>Categoria</label><select name="categoria">${optionsHtml(LISTAS.categoriasTendencia, td.categoria)}</select>
      <label>Descrição *</label><textarea name="descricao" required>${td.descricao || ""}</textarea>
      <label>Fonte/Referência</label><input name="fonte" value="${td.fonte || ""}" />
      <label>Relevância (1–5)</label><input name="relevancia" type="number" min="1" max="5" value="${td.relevancia ?? ""}" />
      <label>Observações</label><textarea name="observacoes">${td.observacoes || ""}</textarea>

      <button class="btn btn-primary btn-block" type="submit">Salvar</button>
      ${td.id ? `<button class="btn btn-danger btn-block" type="button" id="del-btn" style="margin-top:8px;">Excluir</button>` : ""}
    </form>
  `);

  document.getElementById("td-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const row = Object.fromEntries(new FormData(e.target).entries());
    row.ano = row.ano === "" ? null : Number(row.ano);
    row.relevancia = row.relevancia === "" ? null : Number(row.relevancia);
    if (td.id) row.id = td.id;
    try {
      await saveRow("tendencias", row);
      await reloadAll();
      closeModal();
      toast("Tendência salva.");
      renderView("tendencias");
    } catch (err) { toast("Erro: " + err.message); }
  });

  const delBtn = document.getElementById("del-btn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm("Excluir esta tendência?")) return;
    await deleteRow("tendencias", td.id);
    await reloadAll();
    closeModal();
    toast("Tendência excluída.");
    renderView("tendencias");
  });
}
