/**
 * Unifica categorias que só diferem na capitalização (ex: "violeta" e "Violeta")
 * e garante que o nome final começa com maiúscula. Uso:
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
import { capitalizarInicial } from "../utils/texto";

const NOME_GRUPO = "casa";

async function main() {
  const apply = process.argv.includes("--apply");

  await mongoose.connect(process.env.DATABASE_URL as string);

  const grupo = await Grupo.findOne({ nome: new RegExp(`^${NOME_GRUPO}$`, "i") });
  if (!grupo) {
    throw new Error(`Grupo "${NOME_GRUPO}" não encontrado.`);
  }

  const nomes = await Despesa.distinct("categoria", { grupoId: grupo._id });

  const grupos = new Map<string, string[]>(); // canonical -> variantes originais
  for (const nome of nomes) {
    const canonico = capitalizarInicial(nome);
    if (!grupos.has(canonico)) grupos.set(canonico, []);
    grupos.get(canonico)!.push(nome);
  }

  let totalDespesasAtualizadas = 0;
  let totalOrcamentosAtualizados = 0;

  for (const [canonico, variantes] of grupos) {
    const aRenomear = variantes.filter((v) => v !== canonico);
    if (aRenomear.length === 0) continue;

    console.log(`"${variantes.join('", "')}" → "${canonico}"`);

    if (!apply) continue;

    for (const variante of aRenomear) {
      const resDespesas = await Despesa.updateMany(
        { grupoId: grupo._id, categoria: variante },
        { $set: { categoria: canonico } }
      );
      totalDespesasAtualizadas += resDespesas.modifiedCount;

      const resOrcamentos = await Orcamento.updateMany(
        { grupoId: grupo._id, "categorias.categoriaNome": variante },
        { $set: { "categorias.$[item].categoriaNome": canonico } },
        { arrayFilters: [{ "item.categoriaNome": variante }] }
      );
      totalOrcamentosAtualizados += resOrcamentos.modifiedCount;

      const categoriaVariante = await Categoria.findOne({ grupoId: grupo._id, nome: variante });
      if (categoriaVariante) {
        const categoriaCanonica = await Categoria.findOne({ grupoId: grupo._id, nome: canonico });
        if (categoriaCanonica) {
          await Categoria.deleteOne({ _id: categoriaVariante._id });
        } else {
          categoriaVariante.nome = canonico;
          await categoriaVariante.save();
        }
      }
    }
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
