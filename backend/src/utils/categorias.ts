import { capitalizarInicial } from "./texto";

/**
 * Grupos de variantes (sem acentos, minúsculas) que devem colapsar na mesma
 * categoria — cobre singular/plural e sinónimos comuns. A chave de cada grupo
 * é a primeira variante da lista, usada só internamente; o nome apresentado
 * vem de DISPLAY_NAMES.
 */
const ALIAS_GRUPOS: string[][] = [
  ["cafe", "cafes", "bar", "bares"],
  ["transporte", "transportes"],
  ["alimentacao", "comida", "supermercado"],
  ["utilidades", "utilidade"],
  ["saude", "farmacia"],
  ["lazer", "entretenimento"],
  ["outro", "outros"],
];

const DISPLAY_NAMES: Record<string, string> = {
  cafe: "Café",
  transporte: "Transportes",
  alimentacao: "Alimentação",
  utilidades: "Utilidades",
  saude: "Saúde",
  lazer: "Lazer",
  outro: "Outro",
};

const ALIAS_PARA_CHAVE = new Map<string, string>();
for (const grupo of ALIAS_GRUPOS) {
  const [chave] = grupo;
  for (const variante of grupo) {
    ALIAS_PARA_CHAVE.set(variante, chave);
  }
}

const MARCAS_DIACRITICAS = /[̀-ͯ]/g;

function removerAcentos(texto: string): string {
  return texto.normalize("NFD").replace(MARCAS_DIACRITICAS, "");
}

function slugify(nome: string): string {
  return removerAcentos(nome.trim().toLowerCase()).replace(/\s+/g, " ");
}

/**
 * Normaliza o nome de uma categoria para um valor canónico: remove acentos,
 * ignora maiúsculas/minúsculas e espaços extra, e funde variantes conhecidas
 * (singular/plural, sinónimos) sob o mesmo nome de exibição. Categorias
 * desconhecidas só são corrigidas em acentuação/capitalização — continuam
 * livres, não são forçadas para uma lista fixa.
 */
export function normalizarCategoria(nome: string): string {
  const slug = slugify(nome);
  const chave = ALIAS_PARA_CHAVE.get(slug);
  if (chave) {
    return DISPLAY_NAMES[chave];
  }
  return capitalizarInicial(nome);
}
