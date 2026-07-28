interface Props {
  mes: number;
  ano: number;
  anosDisponiveis: number[];
  aoMudarMes: (mes: number) => void;
  aoMudarAno: (ano: number) => void;
}

const MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export function Filtros({ mes, ano, anosDisponiveis, aoMudarMes, aoMudarAno }: Props) {
  return (
    <div className="flex gap-3">
      <select
        value={mes}
        onChange={(e) => aoMudarMes(Number(e.target.value))}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      >
        {MESES.map((nome, index) => (
          <option key={nome} value={index + 1}>
            {nome}
          </option>
        ))}
      </select>
      <select
        value={ano}
        onChange={(e) => aoMudarAno(Number(e.target.value))}
        className="rounded border border-slate-300 px-3 py-2 text-sm"
      >
        {anosDisponiveis.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );
}
