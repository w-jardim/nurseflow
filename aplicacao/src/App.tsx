import { Navigate, Route, Routes } from 'react-router-dom';
import { LayoutAutenticacao } from './componentes/LayoutAutenticacao';
import { LayoutPainel } from './componentes/layout/LayoutPainel';
import { PaginaAlunoCursos } from './paginas/aluno/PaginaAlunoCursos';
import { PaginaAdminMetricas } from './paginas/admin/PaginaAdminMetricas';
import { PaginaAdminProfissionais } from './paginas/admin/PaginaAdminProfissionais';
import { PaginaCadastro } from './paginas/PaginaCadastro';
import { PaginaInicial } from './paginas/PaginaInicial';
import { PaginaLogin } from './paginas/PaginaLogin';
import { PaginaPublicaProfissional } from './paginas/PaginaPublicaProfissional';
import { PaginaAuditoria } from './paginas/painel/PaginaAuditoria';
import { PaginaAlunos } from './paginas/painel/PaginaAlunos';
import { PaginaConsultas } from './paginas/painel/PaginaConsultas';
import { PaginaConsultorias } from './paginas/painel/PaginaConsultorias';
import { PaginaCursos } from './paginas/painel/PaginaCursos';
import { PaginaDashboard } from './paginas/painel/PaginaDashboard';
import { PaginaInteresses } from './paginas/painel/PaginaInteresses';
import { PaginaPacientes } from './paginas/painel/PaginaPacientes';
import { PaginaPerfil } from './paginas/painel/PaginaPerfil';
import { PaginaServicos } from './paginas/painel/PaginaServicos';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<PaginaInicial />} />

      <Route element={<LayoutAutenticacao />}>
        <Route path="/autenticacao/login" element={<PaginaLogin />} />
        <Route path="/autenticacao/cadastro" element={<PaginaCadastro />} />
      </Route>

      <Route element={<LayoutPainel />}>
        {/* Painel do Profissional */}
        <Route path="/painel" element={<PaginaDashboard />} />
        <Route path="/painel/alunos" element={<PaginaAlunos />} />
        <Route path="/painel/pacientes" element={<PaginaPacientes />} />
        <Route path="/painel/cursos" element={<PaginaCursos />} />
        <Route path="/painel/servicos" element={<PaginaServicos />} />
        <Route path="/painel/consultas" element={<PaginaConsultas />} />
        <Route path="/painel/consultorias" element={<PaginaConsultorias />} />
        <Route path="/painel/interesses" element={<PaginaInteresses />} />
        <Route path="/painel/auditoria" element={<PaginaAuditoria />} />
        <Route path="/painel/perfil" element={<PaginaPerfil />} />

        {/* Portal do Aluno */}
        <Route path="/aluno/cursos" element={<PaginaAlunoCursos />} />

        {/* Super Admin */}
        <Route path="/admin" element={<PaginaAdminMetricas />} />
        <Route path="/admin/profissionais" element={<PaginaAdminProfissionais />} />
      </Route>

      <Route path="/:slug" element={<PaginaPublicaProfissional />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
