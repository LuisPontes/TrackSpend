import { Schema, model, Document, Types } from "mongoose";

export type TipoNotificacao = "orcamento_ultrapassado" | "despesa_em_meu_nome";

export interface INotificacao extends Document {
  grupoId: Types.ObjectId;
  memberId: Types.ObjectId;
  tipo: TipoNotificacao;
  categoria?: string;
  mes?: string; // "2026-07"
  orcamentoPrevisao?: number;
  gastoReal?: number;
  excesso?: number;
  despesaId?: Types.ObjectId;
  mensagem?: string;
  lido: boolean;
  criadoEm: Date;
  atualizadoEm: Date;
}

const notificacaoSchema = new Schema<INotificacao>(
  {
    grupoId: { type: Schema.Types.ObjectId, ref: "Grupo", required: true, index: true },
    memberId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true, index: true },
    tipo: { type: String, enum: ["orcamento_ultrapassado", "despesa_em_meu_nome"], required: true },
    categoria: { type: String },
    mes: { type: String },
    orcamentoPrevisao: { type: Number },
    gastoReal: { type: Number },
    excesso: { type: Number },
    despesaId: { type: Schema.Types.ObjectId, ref: "Despesa" },
    mensagem: { type: String },
    lido: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

notificacaoSchema.index({ grupoId: 1, memberId: 1, lido: 1 });

export const Notificacao = model<INotificacao>("Notificacao", notificacaoSchema);
