/**
 * HTML Sanitization Utility
 * Protects against XSS attacks by sanitizing HTML content
 */

import DOMPurify from "dompurify";

/**
 * Sanitize HTML string to prevent XSS attacks
 * @param {string} html - Raw HTML string
 * @param {Object} options - DOMPurify configuration options
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHtml = (html, options = {}) => {
  if (!html || typeof html !== "string") {
    return "";
  }

  const defaultOptions = {
    ALLOWED_TAGS: [
      "b",
      "i",
      "u",
      "em",
      "strong",
      "a",
      "p",
      "br",
      "span",
      "div",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "table",
      "thead",
      "tbody",
      "tr",
      "th",
      "td",
      "img",
      "blockquote",
      "code",
      "pre",
    ],
    ALLOWED_ATTR: [
      "href",
      "target",
      "rel",
      "class",
      "id",
      "style",
      "src",
      "alt",
      "title",
      "width",
      "height",
    ],
    ALLOW_DATA_ATTR: false,
    ...options,
  };

  return DOMPurify.sanitize(html, defaultOptions);
};

/**
 * Sanitize HTML with stricter rules (only basic formatting)
 * @param {string} html - Raw HTML string
 * @returns {string} - Sanitized HTML string
 */
export const sanitizeHtmlStrict = (html) => {
  return sanitizeHtml(html, {
    ALLOWED_TAGS: ["b", "i", "u", "em", "strong", "br", "p"],
    ALLOWED_ATTR: [],
  });
};

/**
 * Strip all HTML tags and return plain text
 * @param {string} html - Raw HTML string
 * @returns {string} - Plain text
 */
export const stripHtml = (html) => {
  if (!html || typeof html !== "string") {
    return "";
  }
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
};

/**
 * React component wrapper for rendering sanitized HTML
 * Use this instead of dangerouslySetInnerHTML
 */
export const createMarkup = (html, options) => {
  return { __html: sanitizeHtml(html, options) };
};

export default {
  sanitizeHtml,
  sanitizeHtmlStrict,
  stripHtml,
  createMarkup,
};
