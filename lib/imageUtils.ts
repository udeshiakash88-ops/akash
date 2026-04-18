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
    
    // Improved regex to handle various potential endings or suffixes
    const dMatch = trimmedUrl.match(/\/d\/([a-zA-Z0-9_-]+)/);
    const idParamMatch = trimmedUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    
    if (dMatch && dMatch[1]) {
      fileId = dMatch[1];
    } else if (idParamMatch && idParamMatch[1]) {
      fileId = idParamMatch[1];
    }

    if (fileId) {
      // The lh3.googleusercontent.com/d/ format is often more reliable for 
      // direct image loading in web apps than the thumbnail or uc endpoints.
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Handle other potential hosting links if needed
  
  return trimmedUrl;
}
