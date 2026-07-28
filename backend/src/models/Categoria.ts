import { Schema, model, Document, Types } from "mongoose";

export type TipoDespesa = "FIXA" | "VARIAVEL";

export interface ICategoria extends Document {
  grupoId: Types.ObjectId;
  nome: string;
  tipo: TipoDespesa;
  cor: string;
  ativo: boolean;
}

const categoriaSchema = new Schema<ICategoria>({
  grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
  nome: { type: String, required: true, trim: true },
  tipo: { type: String, enum: ["FIXA", "VARIAVEL"], required: true },
  cor: { type: String, default: "#64748b" },
  ativo: { type: Boolean, default: true },
});

categoriaSchema.index({ grupoId: 1, nome: 1 }, { unique: true });

export const Categoria = model<ICategoria>("Categoria", categoriaSchema);
