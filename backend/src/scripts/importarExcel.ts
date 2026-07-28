/**
 * Importa despesas históricas de um Excel (uma folha por ano, blocos mensais)
 * para o TrackSpend. Uso:
 *
 *   npx tsx src/scripts/importarExcel.ts <caminho.xlsx> [--apply] [--force]
 *
 * Sem --apply corre em modo dry-run: só imprime o relatório, não escreve na BD.
 */
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import mongoose from "mongoose";
import * as XLSX from "xlsx";
import { Usuario } from "../models/Usuario";
import { Grupo } from "../models/Grupo";
import { Categoria } from "../models/Categoria";
import { Despesa } from "../models/Despesa";
import { Orcamento, IOrcamentoCategoria } from "../models/Orcamento";

const EMAIL_CATARINA = "morlengas@gmail.com";
const EMAIL_LUIS = "luismarquespontes@gmail.com";
const NOME_GRUPO = "casa";

const MESES: Record<string, number> = {
  janeiro: 0, fevereiro: 1, marco: 2, abril: 3, maio: 4, junho: 5,
  julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
  octubro: 9, // erro de escrita (espanhol) usado nas folhas de 2022-2026
};

const CATEGORIAS_FIXAS = [
  "net", "agua", "epal", "electricidade", "edp", "gas", "renda",
  "aluguer", "violeta", "limpeza", "seguro", "transferencia", "imposto",
];

function normalizar(valor: unknown): string {
  return String(valor ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}

function paraNumero(valor: unknown): number | null {
  if (typeof valor === "number" && !Number.isNaN(valor)) return valor;
  return null;
}

function inferirTipo(categoriaNome: string): "FIXA" | "VARIAVEL" {
  const chave = normalizar(categoriaNome);
  return CATEGORIAS_FIXAS.some((c) => chave.includes(c)) ? "FIXA" : "VARIAVEL";
}

interface DespesaParaImportar {
  categoria: string;
  tipo: "FIXA" | "VARIAVEL";
  valor: number;
  mes: number; // 1-12
  ano: number;
  pessoa: "catarina" | "luis";
}

interface PrevistoChave {
  categoria: string;
  tipo: "FIXA" | "VARIAVEL";
  valorPrevisto: number;
  mes: number;
  ano: number;
}

interface DespesaOrfa {
  categoria: string;
  tipo: "FIXA" | "VARIAVEL";
  valor: number;
  mes: number;
  ano: number;
}

function parsearSheet(rows: unknown[][], ano: number, avisos: string[]) {
  const despesas: DespesaParaImportar[] = [];
  const previstos: PrevistoChave[] = [];
  const orfaos: DespesaOrfa[] = [];
  const categoriasDesconhecidas = new Set<string>();

  let i = 0;
  while (i < rows.length) {
    const row = rows[i] ?? [];
    let mesEncontrado = -1;
    for (let c = 0; c < Math.min(row.length, 4); c++) {
      const nomeMes = normalizar(row[c]);
      if (nomeMes in MESES) {
        mesEncontrado = MESES[nomeMes];
        break;
      }
    }

    if (mesEncontrado === -1) {
      i++;
      continue;
    }

    const headerRow = (rows[i + 1] ?? []) as unknown[];
    const catarinaCol = headerRow.findIndex((v) => normalizar(v) === "catarina");
    const luisCol = headerRow.findIndex((v) => normalizar(v) === "luis");

    if (catarinaCol === -1 || luisCol === -1) {
      avisos.push(`Ano ${ano}, mês índice ${mesEncontrado}: não encontrei colunas Catarina/Luis — bloco ignorado.`);
      i += 2;
      continue;
    }

    const categoriaCol = catarinaCol - 1;
    const previstoColLabel = headerRow.findIndex((v) => normalizar(v).includes("previsto"));
    const previstoCol = previstoColLabel !== -1 ? previstoColLabel : categoriaCol - 1;
    const totalCol = headerRow.findIndex((v, idx) => idx >= catarinaCol && normalizar(v) === "total");

    let tipoAtual: "FIXA" | "VARIAVEL" | null = null;
    let j = i + 2;

    while (j < rows.length) {
      const r = (rows[j] ?? []) as unknown[];
      const catCell = normalizar(r[categoriaCol]);
      const catarinaVal = paraNumero(r[catarinaCol]);
      const luisVal = paraNumero(r[luisCol]);

      if (!catCell && catarinaVal === null && luisVal === null) {
        break; // linha em branco: fim do bloco do mês
      }
      if (catCell.startsWith("total")) {
        // "TOTAL", "TOTAL FIXAS", "TOTAL VARIÁVEIS", "TOTAL GERAL" — linhas de soma, não despesas.
        j++;
        continue;
      }
      if (catCell.includes("despesas fixa")) {
        tipoAtual = "FIXA";
        j++;
        continue;
      }
      if (catCell.includes("despesas vari")) {
        tipoAtual = "VARIAVEL";
        j++;
        continue;
      }
      if (!catCell) {
        j++;
        continue;
      }

      const categoriaNomeOriginal = String(r[categoriaCol]).trim();
      const tipo = tipoAtual ?? inferirTipo(categoriaNomeOriginal);
      if (!tipoAtual) categoriasDesconhecidas.add(categoriaNomeOriginal);

      const previstoVal = previstoCol >= 0 ? paraNumero(r[previstoCol]) : null;

      if (totalCol !== -1) {
        const totalCell = paraNumero(r[totalCol]);
        const somaCalculada = (catarinaVal ?? 0) + (luisVal ?? 0);
        if (totalCell !== null && Math.abs(totalCell - somaCalculada) > 0.05) {
          avisos.push(
            `Ano ${ano}, ${categoriaNomeOriginal}: soma Catarina+Luis (${somaCalculada.toFixed(2)}) ≠ TOTAL da folha (${totalCell.toFixed(2)}).`
          );
        }
      }

      if (catarinaVal !== null && catarinaVal !== 0) {
        despesas.push({ categoria: categoriaNomeOriginal, tipo, valor: catarinaVal, mes: mesEncontrado + 1, ano, pessoa: "catarina" });
      }
      if (luisVal !== null && luisVal !== 0) {
        despesas.push({ categoria: categoriaNomeOriginal, tipo, valor: luisVal, mes: mesEncontrado + 1, ano, pessoa: "luis" });
      }
      if (previstoVal !== null && previstoVal > 0) {
        previstos.push({ categoria: categoriaNomeOriginal, tipo, valorPrevisto: previstoVal, mes: mesEncontrado + 1, ano });
      }
      if (catarinaVal === null && luisVal === null && totalCol !== -1) {
        const totalCell = paraNumero(r[totalCol]);
        if (totalCell !== null && totalCell !== 0) {
          orfaos.push({ categoria: categoriaNomeOriginal, tipo, valor: totalCell, mes: mesEncontrado + 1, ano });
          // Sem divisão Catarina/Luis na folha original — divide 50/50 (regra já usada para as restantes contas).
          const metade = totalCell / 2;
          despesas.push({ categoria: categoriaNomeOriginal, tipo, valor: metade, mes: mesEncontrado + 1, ano, pessoa: "catarina" });
          despesas.push({ categoria: categoriaNomeOriginal, tipo, valor: metade, mes: mesEncontrado + 1, ano, pessoa: "luis" });
        }
      }

      j++;
    }

    i = j;
  }

  if (categoriasDesconhecidas.size > 0) {
    avisos.push(
      `Ano ${ano}: tipo (FIXA/VARIAVEL) inferido automaticamente para: ${Array.from(categoriasDesconhecidas).join(", ")}.`
    );
  }

  return { despesas, previstos, orfaos };
}

async function main() {
  const args = process.argv.slice(2);
  const apply = args.includes("--apply");
  const force = args.includes("--force");
  const ficheiro = args.find((a) => !a.startsWith("--")) ?? path.join(process.env.HOME ?? "", "Downloads/Despesas .xlsx");

  console.log(`A ler: ${ficheiro}`);
  const workbook = XLSX.readFile(ficheiro);

  const avisos: string[] = [];
  const todasDespesas: DespesaParaImportar[] = [];
  const todosPrevistos: PrevistoChave[] = [];
  const todosOrfaos: DespesaOrfa[] = [];

  for (const nomeSheet of workbook.SheetNames) {
    if (!normalizar(nomeSheet).includes("despesas")) continue;
    const anoMatch = nomeSheet.match(/(\d{4})/);
    if (!anoMatch) continue;
    const ano = Number(anoMatch[1]);

    const sheet = workbook.Sheets[nomeSheet];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, defval: null });

    const { despesas, previstos, orfaos } = parsearSheet(rows, ano, avisos);
    todasDespesas.push(...despesas);
    todosPrevistos.push(...previstos);
    todosOrfaos.push(...orfaos);

    console.log(`  ${nomeSheet}: ${despesas.length} despesas, ${previstos.length} previstos, ${orfaos.length} órfãs`);
  }

  console.log("\n=== RELATÓRIO ===");
  console.log(`Total de despesas a importar: ${todasDespesas.length}`);
  console.log(`Total de valor: ${todasDespesas.reduce((s, d) => s + d.valor, 0).toFixed(2)} €`);
  console.log(`Total de entradas de orçamento (previsto): ${todosPrevistos.length}`);
  console.log(
    `Linhas "órfãs" (valor só na coluna TOTAL, sem Catarina/Luis preenchidos — divididas 50/50): ${todosOrfaos.length}, soma ${todosOrfaos.reduce((s, o) => s + o.valor, 0).toFixed(2)} €`
  );

  if (avisos.length > 0) {
    console.log(`\n=== AVISOS (${avisos.length}) ===`);
    avisos.forEach((a) => console.log(` - ${a}`));
  }

  if (!apply) {
    console.log("\nModo dry-run — nada foi escrito na base de dados. Corre com --apply para gravar.");
    return;
  }

  await mongoose.connect(process.env.DATABASE_URL as string);

  const catarina = await Usuario.findOne({ email: EMAIL_CATARINA });
  const luis = await Usuario.findOne({ email: EMAIL_LUIS });
  const grupo = await Grupo.findOne({ nome: new RegExp(`^${NOME_GRUPO}$`, "i") });

  if (!catarina || !luis || !grupo) {
    throw new Error("Não encontrei os utilizadores ou o grupo esperados na base de dados.");
  }

  const usuarioIdPorPessoa = { catarina: catarina._id, luis: luis._id };

  // Import idempotente: só insere despesas de (mes,ano) que ainda não existem no grupo,
  // para poder correr o script outra vez em segurança sempre que o Excel for corrigido.
  let despesasParaInserir = todasDespesas;
  if (!force) {
    const existentesAgg = await Despesa.aggregate([
      { $match: { grupoId: grupo._id } },
      { $group: { _id: { ano: "$ano", mes: "$mes" } } },
    ]);
    const paresExistentes = new Set(existentesAgg.map((e) => `${e._id.ano}-${e._id.mes}`));

    despesasParaInserir = todasDespesas.filter((d) => !paresExistentes.has(`${d.ano}-${d.mes}`));
    const mesesIgnorados = new Set(
      todasDespesas
        .filter((d) => paresExistentes.has(`${d.ano}-${d.mes}`))
        .map((d) => `${d.mes}/${d.ano}`)
    );
    if (mesesIgnorados.size > 0) {
      console.log(
        `\nA saltar meses já importados (${todasDespesas.length - despesasParaInserir.length} despesas): ${Array.from(mesesIgnorados).sort().join(", ")}`
      );
    }
  }

  const categoriasCriadas = new Map<string, string>();
  for (const d of despesasParaInserir) {
    const chave = `${d.categoria}|${d.tipo}`;
    if (categoriasCriadas.has(chave)) continue;
    const existente = await Categoria.findOne({ grupoId: grupo._id, nome: d.categoria });
    if (existente) {
      categoriasCriadas.set(chave, existente.nome);
    } else {
      const nova = await Categoria.create({ grupoId: grupo._id, nome: d.categoria, tipo: d.tipo });
      categoriasCriadas.set(chave, nova.nome);
    }
  }

  if (despesasParaInserir.length === 0) {
    console.log("\nNada novo para inserir — todos os meses já estavam importados.");
  } else {
    const docs = despesasParaInserir.map((d) => ({
      grupoId: grupo._id,
      usuarioId: usuarioIdPorPessoa[d.pessoa],
      categoria: d.categoria,
      tipo: d.tipo,
      valor: d.valor,
      data: new Date(d.ano, d.mes - 1, 1),
      mes: d.mes,
      ano: d.ano,
    }));

    const resultado = await Despesa.insertMany(docs);
    console.log(`\nInseridas ${resultado.length} despesas.`);
  }

  const porMesAno = new Map<string, PrevistoChave[]>();
  for (const p of todosPrevistos) {
    const chave = `${p.ano}-${p.mes}`;
    if (!porMesAno.has(chave)) porMesAno.set(chave, []);
    porMesAno.get(chave)!.push(p);
  }

  let orcamentosCriados = 0;
  for (const [chave, itens] of porMesAno) {
    const [anoStr, mesStr] = chave.split("-");
    const ano = Number(anoStr);
    const mes = Number(mesStr);

    const jaExiste = await Orcamento.findOne({ grupoId: grupo._id, mes, ano });
    if (jaExiste) continue;

    const categorias: IOrcamentoCategoria[] = itens.map((it) => ({
      categoriaNome: it.categoria,
      valorPrevisto: it.valorPrevisto,
      tipo: it.tipo,
    }));

    await Orcamento.create({
      grupoId: grupo._id,
      mes,
      ano,
      categorias,
      divisao: { tipo: "50/50", detalhes: {} },
    });
    orcamentosCriados++;
  }
  console.log(`Criados ${orcamentosCriados} orçamentos mensais.`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
