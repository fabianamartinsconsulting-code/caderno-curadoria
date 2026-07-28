import { state, LISTAS, saveRow, deleteRow, reloadAll, renderView, showModal, closeModal, toast, optionsHtml, slugStatus } from "../app.js";

export async function render(root) {
  const fab = document.getElementById("fab-add");
  fab.style.display = "flex";
  fab.onclick = () => openForm();

  paint(root);
}

function paint(root) {
  const list = [...state.marcas].sort((a, b) => (b.nota || 0) - (a.nota || 0));
  root.innerHTML = `
    <div class="eyebrow">Banco de Marcas</div>
    <h1 class="page-title">Marcas</h1>
    <p class="page-sub">${list.length} marca${list.length === 1 ? "" : "s"} cadastrada${list.length === 1 ? "" : "s"}.</p>
    <div id="marcas-list"></div>
  `;
  const listEl = root.querySelector("#marcas-list");
  if (!list.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">✦</span>Nenhuma marca ainda.<br>Toque em "+" para cadastrar a primeira.</div>`;
    return;
  }
  list.forEach(marca => {
    const card = document.createElement("div");
    card.className = "ficha";
    card.innerHTML = `
      <div class="marca-nome">${marca.marca}</div>
      <div class="meta">${[marca.segmento, [marca.cidade, marca.estado].filter(Boolean).join("/")].filter(Boolean).join(" · ") || "—"}</div>
      <div class="tags">
        ${marca.estilo ? `<span class="tag">${marca.estilo}</span>` : ""}
        ${marca.faixa_preco ? `<span class="tag">${marca.faixa_preco}</span>` : ""}
      </div>
      ${marca.status ? `<span class="status-badge status-${slugStatus(marca.status)}">${marca.status}</span>` : ""}
      ${marca.nota != null ? `<div class="nota-stamp">${Number(marca.nota).toFixed(1)}</div>` : ""}
    `;
    card.addEventListener("click", () => openForm(marca));
    listEl.appendChild(card);
  });
}

function openForm(marca = {}) {
  showModal(`
    <div class="modal-header"><h2>${marca.id ? "Editar marca" : "Nova marca"}</h2></div>
    <form id="marca-form">
      <label>Marca *</label><input name="marca" required value="${marca.marca || ""}" />
      <label>Segmento</label><select name="segmento">${optionsHtml(LISTAS.segmentos, marca.segmento)}</select>
      <label>Cidade</label><input name="cidade" value="${marca.cidade || ""}" />
      <label>Estado</label><select name="estado">${optionsHtml(LISTAS.estados, marca.estado)}</select>
      <label>Público</label><input name="publico" value="${marca.publico || ""}" />
      <label>Estilo</label><select name="estilo">${optionsHtml(LISTAS.estilos, marca.estilo)}</select>
      <label>Faixa de preço</label><select name="faixa_preco">${optionsHtml(LISTAS.faixasPreco, marca.faixa_preco)}</select>
      <label>Ticket médio (R$)</label><input name="ticket_medio" type="number" step="0.01" value="${marca.ticket_medio ?? ""}" />
      <label>Pedido mínimo</label><input name="pedido_minimo" type="number" step="1" value="${marca.pedido_minimo ?? ""}" />
      <label>Atacado ou Varejo</label><select name="atacado_varejo">${optionsHtml(LISTAS.atacadoVarejo, marca.atacado_varejo)}</select>
      <label>Região de atuação</label><input name="regiao_atuacao" value="${marca.regiao_atuacao || ""}" />
      <label>Site</label><input name="site" value="${marca.site || ""}" />
      <label>Instagram</label><input name="instagram" value="${marca.instagram || ""}" />
      <label>Contato</label><input name="contato" value="${marca.contato || ""}" />
      <label>Origem da marca</label><input name="origem" value="${marca.origem || ""}" />
      <label>Link do catálogo</label><input name="link_catalogo" value="${marca.link_catalogo || ""}" />
      <label>Nota da Curadoria (0–10)</label><input name="nota" type="number" min="0" max="10" step="0.1" value="${marca.nota ?? ""}" />
      <label>Status</label><select name="status">${optionsHtml(LISTAS.statusMarcas, marca.status || "Em análise")}</select>
      <label>Observações</label><textarea name="observacoes">${marca.observacoes || ""}</textarea>

      <button class="btn btn-primary btn-block" type="submit">Salvar</button>
      ${marca.id ? `<button class="btn btn-danger btn-block" type="button" id="del-btn" style="margin-top:8px;">Excluir marca</button>` : ""}
    </form>
  `);

  document.getElementById("marca-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const row = Object.fromEntries(fd.entries());
    ["ticket_medio", "pedido_minimo", "nota"].forEach(k => { row[k] = row[k] === "" ? null : Number(row[k]); });
    if (marca.id) row.id = marca.id;
    try {
      await saveRow("marcas", row);
      await reloadAll();
      closeModal();
      toast("Marca salva.");
      renderView("marcas");
    } catch (err) { toast("Erro ao salvar: " + err.message); }
  });

  const delBtn = document.getElementById("del-btn");
  if (delBtn) delBtn.addEventListener("click", async () => {
    if (!confirm(`Excluir "${marca.marca}"? Essa ação não pode ser desfeita.`)) return;
    await deleteRow("marcas", marca.id);
    await reloadAll();
    closeModal();
    toast("Marca excluída.");
    renderView("marcas");
  });
}
