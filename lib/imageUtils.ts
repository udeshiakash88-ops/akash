/**
 * Converts various image hosting URLs (like Google Drive) into direct image links
 * that can be used in <img> tags.
 */
export function getDirectImageUrl(url: string | undefined): string {
  if (!url) return "";

  // Handle Google Drive links
  if (url.includes("drive.google.com")) {
    let fileId = "";
    
    // Pattern 1: https://drive.google.com/file/d/FILE_ID/view
    const driveFileMatch = url.match(/\/file\/d\/([^\/?]+)/);
    if (driveFileMatch && driveFileMatch[1]) {
      fileId = driveFileMatch[1];
    } 
    // Pattern 2: https://drive.google.com/open?id=FILE_ID
    else {
      const urlObj = new URL(url);
      fileId = urlObj.searchParams.get("id") || "";
    }

    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }

  // Add other hosting service conversions here if needed
  
  return url;
}
