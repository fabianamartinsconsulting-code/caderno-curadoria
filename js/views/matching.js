import { state, topMatches } from "../app.js";

export async function render(root) {
  document.getElementById("fab-add").style.display = "none";

  root.innerHTML = `
    <div class="eyebrow">Cruzamento automático</div>
    <h1 class="page-title">Matching</h1>
    <p class="page-sub">Estilo (peso 3) · Segmento (peso 2) · Faixa de preço (peso 2) · Estado (peso 1) · +1 se a marca estiver Aprovada/Parceria ativa. Pontuação máxima: 9.</p>
    <div id="matching-list"></div>
  `;

  const listEl = root.querySelector("#matching-list");
  if (!state.lojistas.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">⇄</span>Cadastre lojistas para ver o matching com as marcas.</div>`;
    return;
  }
  if (!state.marcas.length) {
    listEl.innerHTML = `<div class="empty-state"><span class="ic">⇄</span>Cadastre marcas para ver o matching com os lojistas.</div>`;
    return;
  }

  state.lojistas.forEach(lj => {
    const matches = topMatches(lj, state.marcas, 3).filter(x => x.score > 0);
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <div class="marca-nome" style="font-family:var(--display); font-size:16px; font-weight:600;">${lj.nome_loja}</div>
      <div class="small" style="margin-bottom:10px;">${[lj.cidade, lj.estado].filter(Boolean).join("/") || "Sem localização"}</div>
      ${matches.length ? matches.map(m => `
        <div class="row-between" style="padding:8px 0; border-top:1px solid var(--line);">
          <div>
            <div style="font-weight:600; font-size:13.5px;">${m.marca.marca}</div>
            <div class="small">${[m.marca.segmento, m.marca.estilo].filter(Boolean).join(" · ")}</div>
          </div>
          <div class="match-score ${m.score >= 6 ? "high" : ""}">${m.score}</div>
        </div>
      `).join("") : `<p class="small">Nenhuma combinação com pontuação — revise as preferências do lojista.</p>`}
    `;
    listEl.appendChild(card);
  });
}
