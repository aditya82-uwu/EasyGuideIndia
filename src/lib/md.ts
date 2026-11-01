// Tiny inline-markdown renderer for FAQ answers: escapes HTML, then handles links and bold/italic.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export const inline = (md: string) =>
  esc(md)
    .replace(/\[([^\]]+)\]\((\/[^)\s]*|https?:\/\/[^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[\s(])_([^_]+)_(?=[\s).,]|$)/g, '$1<em>$2</em>');

// Plain text for schema.org answers: drop link and emphasis markup.
export const plain = (md: string) =>
  md.replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/\*\*([^*]+)\*\*/g, '$1').replace(/(^|[\s(])_([^_]+)_/g, '$1$2');
