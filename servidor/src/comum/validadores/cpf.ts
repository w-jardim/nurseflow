export function limparCpf(valor: string) {
  return valor.replace(/\D/g, '');
}

export function cpfValido(valor: string) {
  const cpf = limparCpf(valor);

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  const calcularDigito = (tamanho: number) => {
    const soma = cpf
      .slice(0, tamanho)
      .split('')
      .reduce((total, digito, indice) => total + Number(digito) * (tamanho + 1 - indice), 0);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };

  return calcularDigito(9) === Number(cpf[9]) && calcularDigito(10) === Number(cpf[10]);
}
