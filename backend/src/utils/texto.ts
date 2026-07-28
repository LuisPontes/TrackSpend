export function capitalizarInicial(texto: string): string {
  const t = texto.trim();
  if (t.length === 0) return t;
  return t.charAt(0).toUpperCase() + t.slice(1);
}
