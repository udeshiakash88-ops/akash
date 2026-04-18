/**
 * Converts various image hosting URLs (like Google Drive) into direct image links
 * that can be used in <img> tags.
 */
export function getDirectImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return "";

  const trimmedUrl = url.trim();

  // Handle Google Drive links
  if (trimmedUrl.includes("drive.google.com") || trimmedUrl.includes("docs.google.com")) {
    // Robust regex to extract ID from various GDrive URL formats:
    // /file/d/ID/..., ?id=ID, /open?id=ID, /folders/ID (rare but possible)
    const idMatch = trimmedUrl.match(/(?:id=|\/d\/|\/folders\/)([a-zA-Z0-9_-]+)/);
    const fileId = idMatch ? idMatch[1] : null;

    if (fileId) {
      // The 'thumbnail' endpoint is much more reliable for hotlinking public GDrive files.
      // it avoids the security-scan redirects that often break uc?id= links.
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1200`;
    }
  }

  // Handle other potential hosting links if needed
  
  return trimmedUrl;
}

/**
 * Returns a best-effort direct cover image URL for public Instagram links.
 */
export function getInstagramCoverUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return '';

  const trimmedUrl = url.trim();
  const match = trimmedUrl.match(/instagram\.com\/(reel|p|tv)\/([a-zA-Z0-9_-]+)/i);
  if (!match) return '';

  const type = match[1].toLowerCase();
  const shortcode = match[2];
  return `https://www.instagram.com/${type}/${shortcode}/media/?size=l`;
}
