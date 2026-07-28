import { state } from "../app.js";

export async function render(root) {
  document.getElementById("fab-add").style.display = "none";
  const m = state.marcas;
  const aprovadas = m.filter(x => x.status === "Aprovada" || x.status === "Parceria ativa").length;
  const analise = m.filter(x => x.status === "Em análise").length;
  const notas = m.filter(x => x.nota != null).map(x => Number(x.nota));
  const media = notas.length ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : "—";

  const bySeg = {};
  m.forEach(x => { if (x.segmento) bySeg[x.segmento] = (bySeg[x.segmento] || 0) + 1; });
  const segRows = Object.entries(bySeg).sort((a, b) => b[1] - a[1]);

  const byEstado = {};
  m.forEach(x => { if (x.estado) byEstado[x.estado] = (byEstado[x.estado] || 0) + 1; });
  const estadoRows = Object.entries(byEstado).sort((a, b) => b[1] - a[1]);

  root.innerHTML = `
    <div class="eyebrow">Painel geral</div>
    <h1 class="page-title">Curadoria de Moda</h1>
    <p class="page-sub">Panorama das marcas, lojistas e negociações em andamento.</p>

    <div class="stat-grid">
      <div class="stat-card"><div class="num">${m.length}</div><div class="label">Marcas</div></div>
      <div class="stat-card"><div class="num">${aprovadas}</div><div class="label">Aprovadas</div></div>
      <div class="stat-card"><div class="num">${analise}</div><div class="label">Em análise</div></div>
      <div class="stat-card"><div class="num">${media}</div><div class="label">Nota média</div></div>
      <div class="stat-card"><div class="num">${state.lojistas.length}</div><div class="label">Lojistas</div></div>
      <div class="stat-card"><div class="num">${state.contatos.length}</div><div class="label">Contatos</div></div>
      <div class="stat-card"><div class="num">${state.feiras.length}</div><div class="label">Eventos</div></div>
      <div class="stat-card"><div class="num">${state.colecoes.length}</div><div class="label">Coleções</div></div>
    </div>

    <div class="card">
      <div class="eyebrow">Marcas por segmento</div>
      ${segRows.length ? segRows.map(([k, v]) => barRow(k, v, m.length)).join("") :
        `<p class="small">Cadastre marcas para ver a distribuição.</p>`}
    </div>

    <div class="card">
      <div class="eyebrow">Marcas por estado</div>
      ${estadoRows.length ? estadoRows.map(([k, v]) => barRow(k, v, m.length)).join("") :
        `<p class="small">Cadastre marcas para ver a distribuição.</p>`}
    </div>
  `;
}

function barRow(label, value, total) {
  const pct = Math.max(6, Math.round((value / total) * 100));
  return `
    <div style="margin:9px 0;">
      <div class="row-between small" style="margin-bottom:3px;"><span>${label}</span><span>${value}</span></div>
      <div style="height:6px; background:var(--paper-alt); border-radius:4px; overflow:hidden;">
        <div style="height:100%; width:${pct}%; background:var(--gold);"></div>
      </div>
    </div>`;
}
