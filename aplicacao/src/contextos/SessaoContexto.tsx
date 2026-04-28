import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { requisitarApi } from '../servicos/api';
import { buscarRefreshToken, buscarToken, limparSessao } from '../servicos/sessao';
import type { Usuario } from '../tipos/autenticacao';
import type { PerfilProfissional } from '../tipos/profissionais';

type ContextoTipo = {
  usuario: Usuario | null;
  perfil: PerfilProfissional | null;
  atualizarPerfil: (p: PerfilProfissional) => void;
  sair: () => void;
  carregando: boolean;
};

const Contexto = createContext<ContextoTipo | null>(null);

export function ProvedorSessao({ children }: { children: ReactNode }) {
  const navegar = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<PerfilProfissional | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!buscarToken()) {
      navegar('/autenticacao/login');
      return;
    }
    async function init() {
      try {
        const sessao = await requisitarApi<{ usuario: Usuario }>('/autenticacao/me', {
          autenticada: true,
        });
        setUsuario(sessao.usuario);
        if (sessao.usuario.papel === 'PROFISSIONAL') {
          const p = await requisitarApi<PerfilProfissional>('/profissionais/me', {
            autenticada: true,
          });
          setPerfil(p);
        }
      } catch {
        limparSessao();
        navegar('/autenticacao/login');
      } finally {
        setCarregando(false);
      }
    }
    void init();
  }, [navegar]);

  async function sair() {
    const refreshToken = buscarRefreshToken();

    try {
      if (refreshToken) {
        await requisitarApi<{ sucesso: true }>('/autenticacao/sair', {
          metodo: 'POST',
          corpo: { refreshToken },
          ignorarRefreshAutomatico: true,
        });
      }
    } catch {
      // O frontend sempre encerra a sessão local, mesmo se o backend falhar.
    } finally {
      limparSessao();
      setUsuario(null);
      setPerfil(null);
      navegar('/autenticacao/login');
    }
  }

  if (!buscarToken()) {
    return (
      <Contexto.Provider value={{ usuario, perfil, atualizarPerfil: setPerfil, sair, carregando }}>
        {children}
      </Contexto.Provider>
    );
  }

  return (
    <Contexto.Provider value={{ usuario, perfil, atualizarPerfil: setPerfil, sair, carregando }}>
      {children}
    </Contexto.Provider>
  );
}

export function useSessao() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useSessao fora do ProvedorSessao');
  return ctx;
}
