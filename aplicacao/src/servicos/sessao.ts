const CHAVE_TOKEN = 'nurseflow.token';

export function salvarToken(token: string) {
  localStorage.setItem(CHAVE_TOKEN, token);
}

export function buscarToken() {
  return localStorage.getItem(CHAVE_TOKEN);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN);
}
