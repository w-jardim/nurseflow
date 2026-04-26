import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ProvedorSessao, useSessao } from '../../contextos/SessaoContexto';
import { Header } from './Header';
import { Rodape } from './Rodape';
import { Sidebar } from './Sidebar';

function Conteudo() {
  const { carregando, usuario } = useSessao();
  const [menuAberto, setMenuAberto] = useState(false);

  if (carregando) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primario border-t-transparent" />
          <p className="text-sm text-slate-500">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) return <Navigate to="/autenticacao/login" replace />;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar aberto={menuAberto} aoFechar={() => setMenuAberto(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header aoAbrirMenu={() => setMenuAberto(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>

        <Rodape />
      </div>
    </div>
  );
}

export function LayoutPainel() {
  return (
    <ProvedorSessao>
      <Conteudo />
    </ProvedorSessao>
  );
}
