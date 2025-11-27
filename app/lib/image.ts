export function getImageUrl(image: string) {
  if (image.startsWith('http')) {
    return image;
  }

  return `${import.meta.env.VITE_FILE_CDN_URL}/${image}`;
}
