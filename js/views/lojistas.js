import { state, LISTAS, saveRow, deleteRow, reloadAll, renderView, showModal, closeModal, toast, optionsHtml, slugStatus } from "../app.js";

export async function render(root) {
  const fab = document.getElementById("fab-add");
  fab.style.display = "flex";
  fab.onclick = () => openForm();
  paint(root);
}

function paint(root) {
  const list = state.lojistas;
  root.innerHTML = `
    <div class="eyebrow">Clientes</div>
    <h1 class="page-title">Lojistas</h1>
    <p class="page-sub">${list.length} lojista${list.length === 1 ? "" : "s"} cadastrada${list.length === 1 ? "" : "s"}.</p>
    <div id="lojistas-list"></div>
  `;
  const listEl = root.querySelector("#lojistas-list");
  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">⌂</span>Nenhum lojista ainda.<br>Toque em "+" para cadastrar o primeiro.</div>`;
    return;
  }
  list.forEach(lj => {
    const card = document.createElement("div");
    card.className = "ficha";
    card.innerHTML = `
      <div class="marca-nome">${lj.nome_loja}</div>
      <div class="meta">${[lj.cidade, lj.estado].filter(Boolean).join("/") || "—"}</div>
      <div class="tags">
        ${lj.estilo_preferido ? `<span class="tag">${lj.estilo_preferido}</span>` : ""}
        ${lj.segmento_preferido ? `<span class="tag">${lj.segmento_preferido}</span>` : ""}
        ${lj.faixa_preco_preferida ? `<span class="tag">${lj.faixa_preco_preferida}</span>` : ""}
      </div>
      ${lj.status ? `<span class="status-badge status-${slugStatus(lj.status)}">${lj.status}</span>` : ""}
    `;
    card.addEventListener("click", () => openForm(lj));
    listEl.appendChild(card);
  });
}

function openForm(lj = {}) {
  showModal(`
    <div class="modal-header"><h2>${lj.id ? "Editar lojista" : "Novo lojista"}</h2></div>
    <form id="loj-form">
      <label>Nome da loja *</label><input name="nome_loja" required value="${lj.nome_loja || ""}" />
      <label>Cidade</label><input name="cidade" value="${lj.cidade || ""}" />
      <label>Estado</label><select name="estado">${optionsHtml(LISTAS.estados, lj.estado)}</select>
      <label>Estilo preferido</label><select name="estilo_preferido">${optionsHtml(LISTAS.estilos, lj.estilo_preferido)}</select>
      <label>Faixa de preço preferida</label><select name="faixa_preco_preferida">${optionsHtml(LISTAS.faixasPreco, lj.faixa_preco_preferida)}</select>
      <label>Segmento preferido</label><select name="segmento_preferido">${optionsHtml(LISTAS.segmentos, lj.segmento_preferido)}</select>
      <label>Ticket médio de compra (R$)</label><input name="ticket_medio_compra" type="number" step="0.01" value="${lj.ticket_medio_compra ?? ""}" />
      <label>Contato</label><input name="contato" value="${lj.contato || ""}" />
      <label>Instagram</label><input name="instagram" value="${lj.instagram || ""}" />
      <label>Site</label><input name="site" value="${lj.site || ""}" />
      <label>Status</label><select name="status">${optionsHtml(LISTAS.statusLojistas, lj.status || "Ativo")}</select>
      <label>Observações</label><textarea name="observacoes">${lj.observacoes || ""}</textarea>

      <button class="btn btn-primary btn-block" type="submit">Salvar</button>
      ${lj.id ? `<button class="btn btn-danger btn-block" type="button" id="del-btn" style="margin-top:8px;">Excluir lojista</button>` : ""}
    </form>
  `);

  document.getElementById("loj-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const row = Object.fromEntries(fd.entries());
    row.ticket_medio_compra = row.ticket_medio_compra === "" ? null : Number(row.ticket_medio_compra);
    if (lj.id) row.id = lj.id;
    try {
      await saveRow("lojistas", row);
      await reloadAll();
      closeModal();
      toast("Lojista salvo.");
      renderView("lojistas");
    } catch (err) { toast("Erro ao salvar: " + err.message); }
  });

  const delBtn = document.getElementById("del-btn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm(`Excluir "${lj.nome_loja}"?`)) return;
    await deleteRow("lojistas", lj.id);
    await reloadAll();
    closeModal();
    toast("Lojista excluído.");
    renderView("lojistas");
  });
}
