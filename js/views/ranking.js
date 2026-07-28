import { state, slugStatus } from "../app.js";

export async function render(root) {
  document.getElementById("fab-add").style.display = "none";

  const ranked = state.marcas
    .filter(m => m.nota != null)
    .sort((a, b) => Number(b.nota) - Number(a.nota))
    .slice(0, 20);

  root.innerHTML = `
    <div class="eyebrow">Classificação automática</div>
    <h1 class="page-title">Ranking de Marcas</h1>
    <p class="page-sub">As 20 marcas mais bem avaliadas pela Nota da Curadoria.</p>
    <div id="ranking-list"></div>
  `;

  const listEl = root.querySelector("#ranking-list");
  if (!ranked.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">★</span>Cadastre marcas com Nota da Curadoria para ver o ranking.</div>`;
    return;
  }
  ranked.forEach((m, i) => {
    const row = document.createElement("div");
    row.className = "card";
    row.style.display = "flex";
    row.style.alignItems = "center";
    row.style.gap = "12px";
    row.innerHTML = `
      <div class="rank-pos">${i + 1}</div>
      <div style="flex:1;">
        <div style="font-weight:600; font-size:14.5px;">${m.marca}</div>
        <div class="small">${[m.segmento, m.estado].filter(Boolean).join(" · ")}</div>
        ${m.status ? `<span class="status-badge status-${slugStatus(m.status)}">${m.status}</span>` : ""}
      </div>
      <div class="nota-stamp" style="position:static;">${Number(m.nota).toFixed(1)}</div>
    `;
    listEl.appendChild(row);
  });
}
