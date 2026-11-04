export const MAX_FILE_BYTES = 100 * 1024;

const BML_TYPES = [{ description: 'Programa BMLang', accept: { 'text/plain': ['.bml'] } }];

export const hasBmlExtension = (name) => /\.bml$/i.test(name);

export const withBmlExtension = (name) => (hasBmlExtension(name) ? name : `${name.replace(/\.[^./\\]*$/, '')}.bml`);

/** Valida y lee un File elegido por el usuario. Lanza Error con mensaje para la UI. */
export async function readBmlFile(file) {
  if (!hasBmlExtension(file.name)) throw new Error(`"${file.name}" no es un archivo .bml`);
  if (file.size > MAX_FILE_BYTES) throw new Error(`"${file.name}" supera el límite de 100 KB`);
  return file.text();
}

function downloadBlob(data, name, type = 'text/plain;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Guarda usando File System Access API si existe (reutiliza `handle` para guardar
 * en el mismo archivo), o descarga por Blob como respaldo.
 * @returns {Promise<{ name: string, handle: FileSystemFileHandle|null } | null>} null si se canceló
 */
export async function saveBmlFile(text, suggestedName, handle) {
  const name = withBmlExtension(suggestedName || 'programa.bml');

  if (handle || window.showSaveFilePicker) {
    try {
      const target = handle ?? (await window.showSaveFilePicker({ suggestedName: name, types: BML_TYPES }));
      if (!hasBmlExtension(target.name)) throw new Error('El archivo debe tener extensión .bml');
      const writable = await target.createWritable();
      await writable.write(text);
      await writable.close();
      return { name: target.name, handle: target };
    } catch (err) {
      if (err.name === 'AbortError') return null;
      if (err.message?.includes('.bml')) throw err;
      // SecurityError, NotAllowedError, etc.: se recurre a la descarga.
    }
  }

  downloadBlob(text, name);
  return { name, handle: null };
}

/** Descarga el ejecutable que devuelve /api/build (base64). */
export function downloadBinary(base64, name) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  downloadBlob(bytes, name, 'application/octet-stream');
}
