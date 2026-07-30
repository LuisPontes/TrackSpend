import { Schema, model, Document, Types } from "mongoose";

export interface IGrupoSettings {
  permitirDespesaEmNomeOutro: boolean;
}

export interface IGrupo extends Document {
  nome: string;
  descricao?: string;
  criadorId: Types.ObjectId;
  membros: Types.ObjectId[];
  moeda: string;
  settings: IGrupoSettings;
  criadoEm: Date;
  atualizadoEm: Date;
}

const grupoSchema = new Schema<IGrupo>(
  {
    nome: { type: String, required: true, trim: true },
    descricao: { type: String, trim: true },
    criadorId: { type: Schema.Types.ObjectId, ref: "Usuario", required: true },
    membros: [{ type: Schema.Types.ObjectId, ref: "Usuario" }],
    moeda: { type: String, default: "EUR" },
    settings: {
      _id: false,
      permitirDespesaEmNomeOutro: { type: Boolean, default: false },
    },
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

export const Grupo = model<IGrupo>("Grupo", grupoSchema);
