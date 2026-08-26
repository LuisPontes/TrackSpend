/**
 * Unifica categorias duplicadas específicas em todos os grupos, meses e anos:
 *   "SuperMercado" / "Supermercado" -> "Alimentação"
 *   "Cafes/Bar"                     -> "Cafes/Bares"
 *   "Transportes"                   -> "Transporte"
 *   "Linpeza"                       -> "Limpeza"
 *
 * Uso:
 *   npx tsx src/scripts/unificarCategorias.ts [--apply]
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

const MAPEAMENTO: Record<string, string> = {
  SuperMercado: "Alimentação",
  Supermercado: "Alimentação",
  "Cafes/Bar": "Cafes/Bares",
  Transportes: "Transporte",
  Linpeza: "Limpeza",
};

async function main() {
  const apply = process.argv.includes("--apply");

  await mongoose.connect(process.env.DATABASE_URL as string);

  const grupos = await Grupo.find({});

  let totalDespesasAtualizadas = 0;
  let totalOrcamentosAtualizados = 0;
  let totalCategoriasRemovidas = 0;
  let totalCategoriasRenomeadas = 0;

  for (const grupo of grupos) {
    for (const [variante, canonico] of Object.entries(MAPEAMENTO)) {
      const temDespesas = await Despesa.exists({ grupoId: grupo._id, categoria: variante });
      const temOrcamentos = await Orcamento.exists({
        grupoId: grupo._id,
        "categorias.categoriaNome": variante,
      });
      const categoriaVariante = await Categoria.findOne({ grupoId: grupo._id, nome: variante });

      if (!temDespesas && !temOrcamentos && !categoriaVariante) continue;

      console.log(`[${grupo.nome}] "${variante}" → "${canonico}"`);

      if (!apply) continue;

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

      if (categoriaVariante) {
        const categoriaCanonica = await Categoria.findOne({ grupoId: grupo._id, nome: canonico });
        if (categoriaCanonica) {
          await Categoria.deleteOne({ _id: categoriaVariante._id });
          totalCategoriasRemovidas += 1;
        } else {
          categoriaVariante.nome = canonico;
          await categoriaVariante.save();
          totalCategoriasRenomeadas += 1;
        }
      }
    }
  }

  if (!apply) {
    console.log("\nModo dry-run — nada foi alterado. Corre com --apply para gravar.");
  } else {
    console.log(`\nDespesas atualizadas: ${totalDespesasAtualizadas}`);
    console.log(`Orçamentos atualizados: ${totalOrcamentosAtualizados}`);
    console.log(`Categorias removidas (já existia a canónica): ${totalCategoriasRemovidas}`);
    console.log(`Categorias renomeadas: ${totalCategoriasRenomeadas}`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
