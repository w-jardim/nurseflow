export function Esqueleto({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function LinhaEsqueleto({ linhas = 1 }: { linhas?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: linhas }).map((_, i) => (
        <div
          key={i}
          className={`h-3.5 animate-pulse rounded bg-slate-200 ${i === linhas - 1 && linhas > 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
}

export function CartaoEsqueleto() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <Esqueleto className="mb-4 h-4 w-1/3" />
      <Esqueleto className="mb-3 h-7 w-2/3" />
      <LinhaEsqueleto linhas={2} />
    </div>
  );
}
