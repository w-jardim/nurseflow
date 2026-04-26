import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutAutenticacao } from './componentes/LayoutAutenticacao';
import { PaginaCadastro } from './paginas/PaginaCadastro';
import { PaginaInicial } from './paginas/PaginaInicial';
import { PaginaLogin } from './paginas/PaginaLogin';
import { PaginaPainel } from './paginas/PaginaPainel';
import { PaginaPublicaProfissional } from './paginas/PaginaPublicaProfissional';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicial />} />
      <Route element={<LayoutAutenticacao />}>
        <Route path="/autenticacao/login" element={<PaginaLogin />} />
        <Route path="/autenticacao/cadastro" element={<PaginaCadastro />} />
      </Route>
      <Route path="/painel" element={<PaginaPainel />} />
      <Route path="/:slug" element={<PaginaPublicaProfissional />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
