import { Schema, model, Document, Types } from "mongoose";

export interface IAcerto extends Document {
  grupoId: Types.ObjectId;
  de: Types.ObjectId;
  para: Types.ObjectId;
  valor: number;
  mes: number;
  ano: number;
  descricao?: string;
  pago: boolean;
  dataPagamento?: Date;
  criadoEm: Date;
}

const acertoSchema = new Schema<IAcerto>({
  grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
  de: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  para: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
  valor: { type: Number, required: true, min: 0 },
  mes: { type: Number, required: true, min: 1, max: 12 },
  ano: { type: Number, required: true },
  descricao: { type: String, trim: true },
  pago: { type: Boolean, default: false },
  dataPagamento: { type: Date },
  criadoEm: { type: Date, default: Date.now },
});

export const Acerto = model<IAcerto>("Acerto", acertoSchema);
