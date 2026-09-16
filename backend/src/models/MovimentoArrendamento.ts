import { Schema, model, Document, Types } from "mongoose";

export type TipoMovimentoArrendamento = "RECEITA" | "DESPESA";

export interface IMovimentoArrendamento extends Document {
  grupoId: Types.ObjectId;
  usuarioId: Types.ObjectId;
  tipo: TipoMovimentoArrendamento;
  categoria: string;
  valor: number;
  data: Date;
  mes: number;
  ano: number;
  descricao?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const movimentoArrendamentoSchema = new Schema<IMovimentoArrendamento>(
  {
    grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    tipo: { type: String, enum: ["RECEITA", "DESPESA"], required: true },
    categoria: { type: String, required: true, trim: true },
    valor: { type: Number, required: true, min: 0 },
    data: { type: Date, required: true },
    mes: { type: Number, required: true, min: 1, max: 12 },
    ano: { type: Number, required: true },
    descricao: { type: String, trim: true },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

movimentoArrendamentoSchema.index({ grupoId: 1, mes: 1, ano: 1 });

export const MovimentoArrendamento = model<IMovimentoArrendamento>(
  "MovimentoArrendamento",
  movimentoArrendamentoSchema
);
