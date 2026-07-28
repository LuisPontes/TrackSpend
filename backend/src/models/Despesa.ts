import { Schema, model, Document, Types } from "mongoose";
import { TipoDespesa } from "./Categoria";

export interface IDespesa extends Document {
  grupoId: Types.ObjectId;
  usuarioId: Types.ObjectId;
  categoria: string;
  tipo: TipoDespesa;
  valor: number;
  data: Date;
  mes: number;
  ano: number;
  descricao?: string;
  criadoEm: Date;
  atualizadoEm: Date;
}

const despesaSchema = new Schema<IDespesa>(
  {
    grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
    usuarioId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    categoria: { type: String, required: true, trim: true },
    tipo: { type: String, enum: ["FIXA", "VARIAVEL"], required: true },
    valor: { type: Number, required: true, min: 0 },
    data: { type: Date, required: true },
    mes: { type: Number, required: true, min: 1, max: 12 },
    ano: { type: Number, required: true },
    descricao: { type: String, trim: true },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

despesaSchema.index({ grupoId: 1, mes: 1, ano: 1 });
despesaSchema.index({ grupoId: 1, categoria: 1 });

export const Despesa = model<IDespesa>("Despesa", despesaSchema);
