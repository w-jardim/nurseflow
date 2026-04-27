import { useEffect, useRef } from 'react';
import { sanitizarHtmlBasico } from '../../utilitarios/html';

type EditorRicoProps = {
  rotulo: string;
  valor: string;
  onChange: (valor: string) => void;
  ajuda?: string;
};

type Comando = {
  rotulo: string;
  titulo: string;
  acao: () => void;
};

function aplicarComando(comando: string, valor?: string) {
  document.execCommand(comando, false, valor);
}

export function EditorRico({ rotulo, valor, onChange, ajuda }: EditorRicoProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.innerHTML === valor) return;
    editor.innerHTML = valor;
  }, [valor]);

  function atualizar() {
    const editor = editorRef.current;
    if (!editor) return;
    onChange(sanitizarHtmlBasico(editor.innerHTML));
  }

  function executar(acao: () => void) {
    const editor = editorRef.current;
    editor?.focus();
    acao();
    atualizar();
  }

  const comandos: Comando[] = [
    { rotulo: 'B', titulo: 'Negrito', acao: () => aplicarComando('bold') },
    { rotulo: 'I', titulo: 'Itálico', acao: () => aplicarComando('italic') },
    { rotulo: 'U', titulo: 'Sublinhado', acao: () => aplicarComando('underline') },
    { rotulo: 'H2', titulo: 'Título', acao: () => aplicarComando('formatBlock', 'h2') },
    { rotulo: 'H3', titulo: 'Subtítulo', acao: () => aplicarComando('formatBlock', 'h3') },
    { rotulo: '•', titulo: 'Lista', acao: () => aplicarComando('insertUnorderedList') },
    { rotulo: '1.', titulo: 'Lista numerada', acao: () => aplicarComando('insertOrderedList') },
    {
      rotulo: 'Link',
      titulo: 'Inserir link',
      acao: () => {
        const url = window.prompt('Cole o link');
        if (!url) return;
        aplicarComando('createLink', url);
      },
    },
  ];

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-700">{rotulo}</span>
        {ajuda ? <span className="text-xs text-slate-500">{ajuda}</span> : null}
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-300 bg-white focus-within:border-primario focus-within:ring-2 focus-within:ring-teal-100">
        <div className="flex flex-wrap gap-1 border-b border-slate-100 bg-slate-50 px-2 py-2">
          {comandos.map((comando) => (
            <button
              className="h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 transition hover:border-primario hover:text-primario"
              key={comando.titulo}
              onClick={() => executar(comando.acao)}
              title={comando.titulo}
              type="button"
            >
              {comando.rotulo}
            </button>
          ))}
        </div>
        <div
          className="min-h-56 px-4 py-3 text-sm leading-7 text-slate-800 outline-none empty:before:text-slate-400 empty:before:content-[attr(data-placeholder)] [&_a]:font-semibold [&_a]:text-destaque [&_h2]:mb-2 [&_h2]:mt-3 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:mb-2 [&_strong]:font-bold [&_ul]:list-disc"
          contentEditable
          data-placeholder="Escreva a apostila da aula..."
          onBlur={atualizar}
          onInput={atualizar}
          ref={editorRef}
          role="textbox"
          suppressContentEditableWarning
        />
      </div>
    </div>
  );
}
