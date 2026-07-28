import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.SUPABASE_CONFIG;
const sb = createClient(cfg.url, cfg.anonKey);

export const LISTAS = {
  segmentos: ["Jeanswear","Casual","Alfaiataria/Social","Streetwear","Praia/Beachwear",
              "Fitness/Activewear","Acessórios","Calçados","Infantil","Outro"],
  estilos: ["Minimalista","Boho","Contemporâneo","Clássico","Streetwear","Romântico",
            "Rústico/Country","Alfaiataria","Sustentável","Outro"],
  faixasPreco: ["Popular","Médio","Premium","Luxo"],
  atacadoVarejo: ["Atacado","Varejo","Atacado e Varejo"],
  statusMarcas: ["Em análise","Contato iniciado","Em negociação","Aprovada","Reprovada","Parceria ativa"],
  estados: ["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR",
            "PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"],
  tiposContato: ["WhatsApp","E-mail","Instagram DM","Ligação","Reunião presencial","Reunião online","Feira/Evento"],
  statusContatos: ["Aguardando resposta","Em conversa","Follow-up agendado","Concluído","Sem retorno"],
  tiposEvento: ["Feira","Desfile","Showroom","Encontro de negócios","Outro"],
  statusEventos: ["Planejado","Confirmado","Realizado","Cancelado"],
  temporadas: ["Primavera/Verão","Outono/Inverno","Resort/Cruise","Atemporal"],
  categoriasTendencia: ["Cor","Tecido","Modelagem","Estampa","Referência Cultural","Acabamento"],
  statusColecoes: ["Em produção","Lançada","Descontinuada","Pré-venda"],
  statusLojistas: ["Ativo","Prospect","Inativo"],
};

export const state = {
  user: null,
  marcas: [],
  lojistas: [],
  contatos: [],
  feiras: [],
  tendencias: [],
  colecoes: [],
  currentView: "dashboard",
};

async function listAll(table, orderCol = "created_at") {
  const { data, error } = await sb.from(table).select("*").order(orderCol, { ascending: false });
  if (error) { console.error(table, error); toast("Erro ao carregar " + table); return []; }
  return data;
}
export async function saveRow(table, row) {
  const payload = { ...row, user_id: state.user.id };
  if (row.id) {
    const { error } = await sb.from(table).update(payload).eq("id", row.id);
    if (error) throw error;
  } else {
    delete payload.id;
    const { error } = await sb.from(table).insert(payload);
    if (error) throw error;
  }
}
export async function deleteRow(table, id) {
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) throw error;
}

export async function reloadAll() {
  [state.marcas, state.lojistas, state.contatos, state.feiras, state.tendencias, state.colecoes] =
    await Promise.all([
      listAll("marcas"),
      listAll("lojistas"),
      listAll("contatos"),
      listAll("feiras_eventos"),
      listAll("tendencias"),
      listAll("colecoes"),
    ]);
}

export function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2200);
}
export function slugStatus(s) {
  return (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "-");
}
export function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("pt-BR");
}
export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}
export function optionsHtml(list, selected) {
  return `<option value="">—</option>` + list.map(v =>
    `<option value="${v}" ${v === selected ? "selected" : ""}>${v}</option>`).join("");
}

const loginScreen = document.getElementById("login-screen");
const appRoot = document.getElementById("app");

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const errEl = document.getElementById("login-error");
  errEl.textContent = "";
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) { errEl.textContent = "E-mail ou senha inválidos."; return; }
  await bootAfterLogin(data.user);
});

document.getElementById("logout-btn").addEventListener("click", async () => {
  await sb.auth.signOut();
  location.reload();
});

async function bootAfterLogin(user) {
  state.user = user;
  loginScreen.style.display = "none";
  appRoot.style.display = "block";
  await reloadAll();
  renderView("dashboard");
}

(async () => {
  const { data } = await sb.auth.getSession();
  if (data.session) {
    await bootAfterLogin(data.session.user);
  }
})();

document.querySelectorAll("nav.bottomnav button").forEach(btn => {
  btn.addEventListener("click", () => {
    if (btn.dataset.view === "mais") { openMaisMenu(); return; }
    renderView(btn.dataset.view);
  });
});

function setActiveNav(view) {
  document.querySelectorAll("nav.bottomnav button").forEach(b => {
    b.classList.toggle("active", b.dataset.view === view ||
      (b.dataset.view === "mais" && ["contatos","feiras","tendencias","colecoes","ranking"].includes(view)));
  });
}

function openMaisMenu() {
  const items = [
    ["contatos", "✎ Contatos"], ["feiras", "▲ Feiras e Eventos"],
    ["tendencias", "❖ Tendências"], ["colecoes", "▤ Coleções"], ["ranking", "★ Ranking"],
  ];
  showModal(`
    <div class="modal-header"><h2>Mais opções</h2></div>
    <div class="divider"></div>
    ${items.map(([v, label]) => `<button class="btn btn-ghost btn-block" data-goto="${v}" style="margin-top:8px; justify-content:flex-start;">${label}</button>`).join("")}
  `);
  document.querySelectorAll("[data-goto]").forEach(b => {
    b.addEventListener("click", () => { closeModal(); renderView(b.dataset.goto); });
  });
}

export async function renderView(view) {
  state.currentView = view;
  setActiveNav(view);
  const root = document.getElementById("view-root");
  root.innerHTML = `<div class="empty-state">Carregando…</div>`;
  const mod = await import(`./views/${view}.js`);
  await mod.render(root);
}

export function showModal(innerHtml) {
  const backdrop = el(`<div class="modal-backdrop"><div class="modal-sheet" style="position:relative;">
    <button class="modal-close">✕</button>${innerHtml}</div></div>`);
  backdrop.addEventListener("click", (e) => { if (e.target === backdrop) closeModal(); });
  backdrop.querySelector(".modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-root").appendChild(backdrop);
}
export function closeModal() {
  document.getElementById("modal-root").innerHTML = "";
}

export function matchScore(lojista, marca) {
  let score = 0;
  if (lojista.estilo_preferido && lojista.estilo_preferido === marca.estilo) score += 3;
  if (lojista.segmento_preferido && lojista.segmento_preferido === marca.segmento) score += 2;
  if (lojista.faixa_preco_preferida && lojista.faixa_preco_preferida === marca.faixa_preco) score += 2;
  if (lojista.estado && lojista.estado === marca.estado) score += 1;
  if (marca.status === "Aprovada" || marca.status === "Parceria ativa") score += 1;
  return score;
}
export function topMatches(lojista, marcas, n = 3) {
  return marcas
    .map(m => ({ marca: m, score: matchScore(lojista, m) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}
