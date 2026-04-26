export function formatarReais(valorCentavos: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorCentavos / 100);
}

export function reaisParaCentavos(valor: string) {
  const normalizado = valor.replace(/\./g, '').replace(',', '.').replace(/[^\d.]/g, '');
  const numero = Number(normalizado);

  if (!Number.isFinite(numero) || numero < 0) {
    return 0;
  }

  return Math.round(numero * 100);
}
