import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const cfg = window.SUPABASE_CONFIG;
const sb = createClient(cfg.url, cfg.anonKey);

// ---------------------------------------------------------------------
// Listas fixas (mesmas categorias da planilha original)
// ---------------------------------------------------------------------
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

// ---------------------------------------------------------------------
// Estado em memória (cache local simples; recarregado a cada troca de aba)
// ---------------------------------------------------------------------
export const state = {
  user: null,
  marcas: [],
  lojistas: [],
  contatos: [],
