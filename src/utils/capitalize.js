/**
 * capitalize.js
 * Los slugs/categorías se guardan en minúscula en la BD ('basketball');
 * la UI los muestra capitalizados ('Basketball').
 */
export function capitalize (value = '') {
  const text = String(value)
  return text.charAt(0).toUpperCase() + text.slice(1)
}
