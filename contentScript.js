async function extract_logo(url, html_response) {
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
        console.log('Logo found:', absoluteLogoUrl);
        return absoluteLogoUrl;
      }
    }
  }

  console.log('Logo not found');
  return null;
}

function get_domain_first_letter(url) {
  let slash = false
  let letter = ""
  let last_letter = ""
  let last_char = ""

  for (let x = 0; x < url.length; x++) {
    let char = url.charAt(x)

    console.log(char)

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

export { extract_logo, get_domain_first_letter }