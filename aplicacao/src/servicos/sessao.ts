import type { RespostaAutenticacao } from '../tipos/autenticacao';

const CHAVE_TOKEN_ACESSO = 'nurseflow.token';
const CHAVE_REFRESH_TOKEN = 'nurseflow.refresh-token';

export function salvarSessao(resposta: RespostaAutenticacao) {
  localStorage.setItem(CHAVE_TOKEN_ACESSO, resposta.acesso.token);
  localStorage.setItem(CHAVE_REFRESH_TOKEN, resposta.refreshToken.token);
}

export function salvarToken(token: string) {
  localStorage.setItem(CHAVE_TOKEN_ACESSO, token);
}

export function salvarRefreshToken(token: string) {
  localStorage.setItem(CHAVE_REFRESH_TOKEN, token);
}

export function buscarToken() {
  return localStorage.getItem(CHAVE_TOKEN_ACESSO);
}

export function buscarRefreshToken() {
  return localStorage.getItem(CHAVE_REFRESH_TOKEN);
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN_ACESSO);
  localStorage.removeItem(CHAVE_REFRESH_TOKEN);
}

export function limparToken() {
  localStorage.removeItem(CHAVE_TOKEN_ACESSO);
}

export function limparRefreshToken() {
  localStorage.removeItem(CHAVE_REFRESH_TOKEN);
}
