/**
 * Extracts the logo/favicon URL from the provided HTML content of a page.
 * Searches through common HTML elements (favicon links, Open Graph, Twitter meta, img tags)
 * and returns the first matching absolute logo URL.
 * @param {string} url - The base URL of the page, used to resolve relative logo URLs.
 * @param {string} html_response - The raw HTML content of the page to parse.
 * @returns {Promise<string>} A promise that resolves to the absolute logo URL, or "null" if not found.
 */
export async function extract_logo(url, html_response) {
  const html = html_response;

  // Parse the HTML content
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Look for common elements that might contain the logo
  const logoSelectors = [
    'link[rel="shortcut icon"]',
    'link[rel="icon"]',
    'link[rel="apple-touch-icon"]',
    'meta[property="og:image"]',
    'meta[name="twitter:image"]',
    'img[src*="logo"]',
  ];

  for (const selector of logoSelectors) {
    const element = doc.querySelector(selector);
    if (element) {
      const logoUrl = element.getAttribute('href') || element.getAttribute('content') || element.getAttribute('src');
      if (logoUrl) {
        // If the logo URL is relative, convert it to an absolute URL
        const absoluteLogoUrl = new URL(logoUrl, url).href;
        return absoluteLogoUrl;
      }
    }
  }
  return "null";
}

/**
 * Extracts the first letter of the second-to-last domain segment from a URL.
 * For example, for "https://www.google.com/search", it returns "g" (from "google").
 * @param {string} url - The URL string to extract the domain letter from.
 * @returns {string} The first letter of the primary domain name, or an empty string if not found.
 */
export function get_domain_first_letter(url) {
  let slash = false
  let letter = ""
  let last_letter = ""
  let last_char = ""

  for (let x = 0; x < url.length; x++) {
    let char = url.charAt(x)

    if (slash == true && last_char == "/" && letter == "") {
      letter = char
    }

    if (slash == true && last_char == ".") {
      last_letter = letter
      letter = char
    }

    if (slash == true && last_char != "/" && (char == "/" || char == "?")) {
      break;
    }

    if (char == "/") {
      slash = true
      x += 1
    }

    last_char = char
  }
  return last_letter;
}

/**
 * Validates whether the given string is a valid URL.
 * @param {string} url - The URL string to validate.
 * @returns {boolean} True if the string matches a valid URL pattern, false otherwise.
 */
export function validate_url(url) {
  var expression =
    /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  if (url.match(regex)) {
    return true
  } else {
    return false
  }
}
