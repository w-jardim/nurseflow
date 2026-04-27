const TAGS_PERMITIDAS = new Set([
  'A',
  'B',
  'BR',
  'DIV',
  'EM',
  'H2',
  'H3',
  'I',
  'LI',
  'OL',
  'P',
  'STRONG',
  'U',
  'UL',
]);

const ATRIBUTOS_PERMITIDOS: Record<string, Set<string>> = {
  A: new Set(['href', 'rel', 'target']),
};

function urlSegura(valor: string) {
  try {
    const url = new URL(valor, window.location.origin);
    return ['http:', 'https:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function limparNo(no: Node, documento: Document): Node | null {
  if (no.nodeType === Node.TEXT_NODE) {
    return documento.createTextNode(no.textContent ?? '');
  }

  if (no.nodeType !== Node.ELEMENT_NODE) {
    return null;
  }

  const elemento = no as HTMLElement;
  const tag = elemento.tagName;

  if (!TAGS_PERMITIDAS.has(tag)) {
    const fragmento = documento.createDocumentFragment();
    elemento.childNodes.forEach((filho) => {
      const limpo = limparNo(filho, documento);
      if (limpo) fragmento.appendChild(limpo);
    });
    return fragmento;
  }

  const novo = documento.createElement(tag.toLowerCase());
  const atributosPermitidos = ATRIBUTOS_PERMITIDOS[tag] ?? new Set<string>();

  Array.from(elemento.attributes).forEach((atributo) => {
    if (!atributosPermitidos.has(atributo.name)) return;
    if (tag === 'A' && atributo.name === 'href' && !urlSegura(atributo.value)) return;
    novo.setAttribute(atributo.name, atributo.value);
  });

  if (tag === 'A') {
    novo.setAttribute('target', '_blank');
    novo.setAttribute('rel', 'noreferrer');
  }

  elemento.childNodes.forEach((filho) => {
    const limpo = limparNo(filho, documento);
    if (limpo) novo.appendChild(limpo);
  });

  return novo;
}

export function sanitizarHtmlBasico(html: string) {
  if (!html.trim()) return '';

  const parser = new DOMParser();
  const documento = parser.parseFromString(html, 'text/html');
  const fragmento = document.createDocumentFragment();

  documento.body.childNodes.forEach((no) => {
    const limpo = limparNo(no, document);
    if (limpo) fragmento.appendChild(limpo);
  });

  const recipiente = document.createElement('div');
  recipiente.appendChild(fragmento);
  return recipiente.innerHTML;
}
