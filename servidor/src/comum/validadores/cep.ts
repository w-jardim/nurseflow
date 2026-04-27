export function limparCep(valor: string) {
  return valor.replace(/\D/g, '');
}

export function cepValido(valor: string) {
  return limparCep(valor).length === 8;
}
