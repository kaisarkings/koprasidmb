/**
 * Helper to compress and read uploaded image files as Base64 Data URL.
 * Optimizes image resolution for fast local storage and seamless display.
 */
export const compressAndReadFileAsDataURL = (file: File, maxSize = 400): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File harus berupa gambar (JPG, PNG, GIF, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          resolve(dataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error('Gagal memproses file gambar.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Gagal membaca file dari perangkat.'));
    reader.readAsDataURL(file);
  });
};
