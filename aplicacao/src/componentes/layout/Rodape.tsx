export function Rodape() {
  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-3">
      <p className="text-center text-xs text-slate-400">
        Desenvolvido por{' '}
        <span className="font-semibold text-slate-500">Plagard Systems</span>{' '}
        &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
