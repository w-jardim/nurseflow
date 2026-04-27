import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

type Tipo = 'sucesso' | 'erro' | 'info' | 'aviso';
type Item = { id: string; tipo: Tipo; mensagem: string };
type Ctx = { toast: (mensagem: string, tipo?: Tipo) => void };

const ToastCtx = createContext<Ctx | null>(null);

const CONFIG: Record<Tipo, { fundo: string; texto: string; icone: string; borda: string; svg: string }> = {
  sucesso: {
    fundo: 'bg-emerald-50',
    texto: 'text-emerald-800',
    icone: 'text-emerald-500',
    borda: 'border-emerald-200',
    svg: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  erro: {
    fundo: 'bg-red-50',
    texto: 'text-red-800',
    icone: 'text-red-500',
    borda: 'border-red-200',
    svg: 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  info: {
    fundo: 'bg-blue-50',
    texto: 'text-blue-800',
    icone: 'text-blue-500',
    borda: 'border-blue-200',
    svg: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  aviso: {
    fundo: 'bg-amber-50',
    texto: 'text-amber-800',
    icone: 'text-amber-500',
    borda: 'border-amber-200',
    svg: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
  },
};

function ItemToast({ item, aoRemover }: { item: Item; aoRemover: () => void }) {
  const c = CONFIG[item.tipo];

  useEffect(() => {
    const t = setTimeout(aoRemover, 4500);
    return () => clearTimeout(t);
  }, [aoRemover]);

  return (
    <div
      role="alert"
      className={`flex items-start gap-3 rounded-xl border p-4 shadow-lg animate-slide-in ${c.fundo} ${c.borda}`}
    >
      <svg
        className={`mt-0.5 h-5 w-5 flex-shrink-0 ${c.icone}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={c.svg} />
      </svg>
      <p className={`flex-1 text-sm font-medium ${c.texto}`}>{item.mensagem}</p>
      <button
        onClick={aoRemover}
        className={`flex-shrink-0 transition-opacity hover:opacity-60 ${c.icone}`}
        aria-label="Fechar"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export function ProvedorToast({ children }: { children: ReactNode }) {
  const [lista, setLista] = useState<Item[]>([]);

  const toast = useCallback((mensagem: string, tipo: Tipo = 'sucesso') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    setLista((prev) => [...prev, { id, tipo, mensagem }]);
  }, []);

  const remover = useCallback((id: string) => {
    setLista((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-80 flex-col gap-2.5">
        {lista.map((item) => (
          <div key={item.id} className="pointer-events-auto">
            <ItemToast item={item} aoRemover={() => remover(item.id)} />
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast precisa estar dentro de ProvedorToast');
  return ctx.toast;
}
