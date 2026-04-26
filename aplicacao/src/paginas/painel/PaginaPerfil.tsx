import { PainelPerfilProfissional } from '../../componentes/PainelPerfilProfissional';
import { useSessao } from '../../contextos/SessaoContexto';
import { requisitarApi } from '../../servicos/api';
import type { PerfilProfissional } from '../../tipos/profissionais';

export function PaginaPerfil() {
  const { perfil, atualizarPerfil } = useSessao();

  async function salvarPerfil(dados: {
    nomePublico: string; slug: string; bio: string;
    telefone: string; conselho: string;
  }) {
    const atualizado = await requisitarApi<PerfilProfissional>('/profissionais/me', {
      metodo: 'PUT',
      autenticada: true,
      corpo: {
        nomePublico: dados.nomePublico,
        slug: dados.slug,
        bio: dados.bio || undefined,
        telefone: dados.telefone || undefined,
        conselho: dados.conselho || undefined,
      },
    });
    atualizarPerfil(atualizado);
  }

  return <PainelPerfilProfissional perfil={perfil} aoSalvar={salvarPerfil} />;
}
