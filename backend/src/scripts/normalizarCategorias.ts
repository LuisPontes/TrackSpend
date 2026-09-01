/**
 * Unifica categorias que só diferem em acentuação/capitalização/sinónimos
 * conhecidos (ex: "Saude" e "Saúde", "cafe" e "Café") em todos os grupos.
 * Uso:
 *
 *   npx tsx src/scripts/normalizarCategorias.ts [--apply]
 *
 * Sem --apply corre em modo dry-run: só imprime o que seria alterado.
 */
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { Grupo } from "../models/Grupo";
import { Despesa } from "../models/Despesa";
import { Categoria } from "../models/Categoria";
import { Orcamento } from "../models/Orcamento";
import { normalizarCategoria } from "../utils/categorias";

async function normalizarGrupo(grupoId: mongoose.Types.ObjectId, nomeGrupo: string, apply: boolean) {
  const nomes = await Despesa.distinct("categoria", { grupoId });

  const grupos = new Map<string, string[]>(); // canonical -> variantes originais
  for (const nome of nomes) {
    const canonico = normalizarCategoria(nome);
    if (!grupos.has(canonico)) grupos.set(canonico, []);
    grupos.get(canonico)!.push(nome);
  }

  let despesasAtualizadas = 0;
  let orcamentosAtualizados = 0;

  for (const [canonico, variantes] of grupos) {
    const aRenomear = variantes.filter((v) => v !== canonico);
    if (aRenomear.length === 0) continue;

    console.log(`[${nomeGrupo}] "${variantes.join('", "')}" → "${canonico}"`);

    if (!apply) continue;

    for (const variante of aRenomear) {
      const resDespesas = await Despesa.updateMany(
        { grupoId, categoria: variante },
        { $set: { categoria: canonico } }
      );
      despesasAtualizadas += resDespesas.modifiedCount;

      const resOrcamentos = await Orcamento.updateMany(
        { grupoId, "categorias.categoriaNome": variante },
        { $set: { "categorias.$[item].categoriaNome": canonico } },
        { arrayFilters: [{ "item.categoriaNome": variante }] }
      );
      orcamentosAtualizados += resOrcamentos.modifiedCount;

      const categoriaVariante = await Categoria.findOne({ grupoId, nome: variante });
      if (categoriaVariante) {
        const categoriaCanonica = await Categoria.findOne({ grupoId, nome: canonico });
        if (categoriaCanonica) {
          await Categoria.deleteOne({ _id: categoriaVariante._id });
        } else {
          categoriaVariante.nome = canonico;
          await categoriaVariante.save();
        }
      }
    }
  }

  return { despesasAtualizadas, orcamentosAtualizados };
}

async function main() {
  const apply = process.argv.includes("--apply");

  await mongoose.connect(process.env.DATABASE_URL as string);

  const grupos = await Grupo.find({});
  if (grupos.length === 0) {
    throw new Error("Nenhum grupo encontrado.");
  }

  let totalDespesasAtualizadas = 0;
  let totalOrcamentosAtualizados = 0;

  for (const grupo of grupos) {
    const { despesasAtualizadas, orcamentosAtualizados } = await normalizarGrupo(grupo._id, grupo.nome, apply);
    totalDespesasAtualizadas += despesasAtualizadas;
    totalOrcamentosAtualizados += orcamentosAtualizados;
  }

  if (!apply) {
    console.log("\nModo dry-run — nada foi alterado. Corre com --apply para gravar.");
  } else {
    console.log(`\nDespesas atualizadas: ${totalDespesasAtualizadas}`);
    console.log(`Orçamentos atualizados: ${totalOrcamentosAtualizados}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
