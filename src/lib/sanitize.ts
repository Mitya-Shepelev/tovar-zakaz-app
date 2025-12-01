import sanitizeHtml from "sanitize-html";

// Безопасные HTML теги и атрибуты для контента страниц
const allowedTags = [
  "h1", "h2", "h3", "h4", "h5", "h6",
  "p", "br", "hr",
  "ul", "ol", "li",
  "a", "strong", "em", "b", "i", "u", "s", "strike",
  "blockquote", "code", "pre",
  "table", "thead", "tbody", "tr", "th", "td",
  "img",
  "div", "span",
];

const allowedAttributes = {
  a: ["href", "title", "target", "rel"],
  img: ["src", "alt", "title", "width", "height"],
  "*": ["class", "id"],
};

// Разрешённые схемы URL (запрещаем javascript:, data: и т.д.)
const allowedSchemes = ["http", "https", "mailto"];

export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags,
    allowedAttributes,
    allowedSchemes,
    // Добавляем rel="noopener noreferrer" ко всем внешним ссылкам
    transformTags: {
      a: (tagName, attribs) => {
        return {
          tagName,
          attribs: {
            ...attribs,
            rel: "noopener noreferrer",
            // Открывать внешние ссылки в новой вкладке
            target: attribs.href?.startsWith("http") ? "_blank" : attribs.target,
          },
        };
      },
    },
    // Удаляем пустые теги
    exclusiveFilter: (frame) => {
      return !frame.text?.trim() && ["p", "div", "span"].includes(frame.tag);
    },
  });
}

// Экранирование для текста (без HTML)
export function escapeHtml(text: string): string {
  const htmlEntities: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => htmlEntities[char]);
}
