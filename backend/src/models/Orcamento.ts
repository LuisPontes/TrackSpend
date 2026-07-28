import { Schema, model, Document, Types } from "mongoose";
import { TipoDespesa } from "./Categoria";

export type TipoDivisao = "50/50" | "percentual" | "fixo";

export interface IOrcamentoCategoria {
  categoriaNome: string;
  valorPrevisto: number;
  tipo: TipoDespesa;
}

export interface IDivisao {
  tipo: TipoDivisao;
  detalhes: Record<string, number>;
}

export interface IOrcamento extends Document {
  grupoId: Types.ObjectId;
  mes: number;
  ano: number;
  categorias: IOrcamentoCategoria[];
  divisao: IDivisao;
  criadoEm: Date;
}

const orcamentoSchema = new Schema<IOrcamento>({
  grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
  mes: { type: Number, required: true, min: 1, max: 12 },
  ano: { type: Number, required: true },
  categorias: [
    {
      _id: false,
      categoriaNome: { type: String, required: true },
      valorPrevisto: { type: Number, required: true, min: 0 },
      tipo: { type: String, enum: ["FIXA", "VARIAVEL"], required: true },
    },
  ],
  divisao: {
    _id: false,
    tipo: { type: String, enum: ["50/50", "percentual", "fixo"], required: true, default: "50/50" },
    detalhes: { type: Schema.Types.Mixed, default: {} },
  },
  criadoEm: { type: Date, default: Date.now },
});

orcamentoSchema.index({ grupoId: 1, mes: 1, ano: 1 }, { unique: true });

export const Orcamento = model<IOrcamento>("Orcamento", orcamentoSchema);
