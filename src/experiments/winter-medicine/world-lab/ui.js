export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#039;",
}[character]));

export const formatValue = (value) => {
  if (typeof value === "number") return Number(value).toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  return escapeHtml(value);
};

export const json = (value) => escapeHtml(JSON.stringify(value, null, 2));

export const requireElement = (id) => {
  const element = document.getElementById(id);
  if (!element) throw new Error(`Missing required UI element #${id}`);
  return element;
};
