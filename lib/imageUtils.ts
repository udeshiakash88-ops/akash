/**
 * Converts various image hosting URLs (like Google Drive) into direct image links
 * that can be used in <img> tags.
 */
export function getDirectImageUrl(url: string | undefined): string {
  if (!url || typeof url !== 'string') return "";

  const trimmedUrl = url.trim();

  // Handle Google Drive links
  if (trimmedUrl.includes("drive.google.com")) {
    let fileId = "";
    
    // Pattern 1: https://drive.google.com/file/d/FILE_ID/view...
    // Pattern 2: https://drive.google.com/open?id=FILE_ID
    // Pattern 3: https://drive.google.com/uc?id=FILE_ID
    
    const dMatch = trimmedUrl.match(/\/d\/([^\/?#]+)/);
    const idParamMatch = trimmedUrl.match(/[?&]id=([^\/?#&]+)/);
    
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    } else if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }

    if (fileId) {
      // thumbnail?id= format is more resilient for high-resolution images 
      // and often bypasses the "virus scan" warning screen which blocks regular 'uc' links.
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
    }
  }

  // Handle other potential hosting links if needed
  
  return trimmedUrl;
}
