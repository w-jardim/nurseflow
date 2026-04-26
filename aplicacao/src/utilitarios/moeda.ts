export function formatarReais(valorCentavos: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valorCentavos / 100);
}

export function formatarReaisSemSimbolo(valorCentavos: number) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(valorCentavos / 100);
}

export function mascararReais(valor: string) {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  const centavos = Number(digitos || 0);

  return formatarReaisSemSimbolo(centavos);
}

export function reaisParaCentavos(valor: string) {
  const digitos = valor.replace(/\D/g, '');
  return Number(digitos || 0);
}
