import { Schema, model, Document, Types } from "mongoose";

export interface IPagamentoEmprestimo {
  _id: Types.ObjectId;
  valor: number;
  data: Date;
  descricao?: string;
  criadoEm: Date;
}

export interface IEmprestimo extends Document {
  grupoId: Types.ObjectId;
  credorId: Types.ObjectId;
  devedorId: Types.ObjectId;
  valor: number;
  data: Date;
  descricao?: string;
  pagamentos: IPagamentoEmprestimo[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const pagamentoSchema = new Schema<IPagamentoEmprestimo>(
  {
    valor: { type: Number, required: true, min: 0 },
    data: { type: Date, required: true },
    descricao: { type: String, trim: true },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: false } }
);

const emprestimoSchema = new Schema<IEmprestimo>(
  {
    grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
    credorId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    devedorId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    valor: { type: Number, required: true, min: 0 },
    data: { type: Date, required: true },
    descricao: { type: String, trim: true },
    pagamentos: [pagamentoSchema],
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

export const Emprestimo = model<IEmprestimo>("Emprestimo", emprestimoSchema);
