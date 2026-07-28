import { Schema, model, Document, Types } from "mongoose";

export interface IUsuario extends Document {
  email: string;
  nome: string;
  senha: string;
  grupos: Types.ObjectId[];
  criadoEm: Date;
  atualizadoEm: Date;
}

const usuarioSchema = new Schema<IUsuario>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    nome: { type: String, required: true, trim: true },
    senha: { type: String, required: true },
    grupos: [{ type: Schema.Types.ObjectId, ref: "Grupo" }],
  },
  { timestamps: { createdAt: "criadoEm", updatedAt: "atualizadoEm" } }
);

export const Usuario = model<IUsuario>("Usuario", usuarioSchema);
