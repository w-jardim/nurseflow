export function Rodape() {
  return (
    <footer className="border-t border-slate-100 bg-white px-6 py-2.5">
      <p className="text-center text-xs text-slate-400">
        Desenvolvido por <span className="font-medium text-slate-500">Plagard Systems</span>{' '}
        &copy; {new Date().getFullYear()}
      </p>
    </footer>
  );
}
