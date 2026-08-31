// Inserts Cloudinary's automatic-format + automatic-quality transform
// (f_auto,q_auto) into an existing Cloudinary delivery URL, and optionally
// caps the width so we're not shipping a full-resolution upload for a
// 56px thumbnail. f_auto serves AVIF/WebP to browsers that support it and
// falls back to JPEG automatically — same idea as the manual AVIF/WebP
// comparison, but Cloudinary picks the best format per-browser for us.
//
// Safe no-op for anything that isn't a Cloudinary URL (e.g. the static
// Unsplash category thumb, or a menu item saved without an image), so this
// can wrap every image src in the app without special-casing callers.
export function optimizedImage(url, { width } = {}) {
  if (!url || typeof url !== 'string') return url;

  const marker = '/upload/';
  const idx = url.indexOf(marker);
  if (!isCloudinaryUrl(url) || idx === -1) return url;

  const transforms = ['f_auto', 'q_auto'];
  if (width) transforms.push(`w_${Math.round(width)}`);

  const insertAt = idx + marker.length;
  return url.slice(0, insertAt) + transforms.join(',') + '/' + url.slice(insertAt);
}

function isCloudinaryUrl(url) {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com/');
}