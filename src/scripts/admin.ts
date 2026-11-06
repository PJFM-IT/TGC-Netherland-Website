/**
 * Small helpers for the /admin forms:
 * - shrinks large photos in the browser before upload (phone photos are often 5–10 MB;
 *   the server accepts up to 4 MB) and shows a preview,
 * - asks for confirmation before deleting,
 * - shows "Saving…" while a form is being sent.
 */

const MAX_BYTES = 3.8 * 1024 * 1024;

async function shrink(file: File, maxWidth: number): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  if (scale === 1 && file.size <= MAX_BYTES) return file;

  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  for (const quality of [0.9, 0.8, 0.7, 0.6]) {
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
    if (blob && blob.size <= MAX_BYTES) {
      return new File([blob], file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
    }
  }
  return file; // the server will report that it is too large
}

document.querySelectorAll<HTMLInputElement>('input[type="file"][data-max-width]').forEach((input) => {
  const preview = input.closest('.field')?.querySelector<HTMLImageElement>('[data-preview]');
  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const smaller = await shrink(file, Number(input.dataset.maxWidth));
      if (smaller !== file) {
        const list = new DataTransfer();
        list.items.add(smaller);
        input.files = list.files;
      }
      if (preview) {
        preview.src = URL.createObjectURL(smaller);
        preview.hidden = false;
      }
    } catch {
      // Unusual format the browser can't read: send the original and let the server decide.
    }
  });
});

document.querySelectorAll<HTMLFormElement>('form[data-confirm]').forEach((form) => {
  form.addEventListener('submit', (event) => {
    if (!window.confirm(form.dataset.confirm ?? 'Are you sure?')) event.preventDefault();
  });
});

document.querySelectorAll<HTMLFormElement>('form[data-upload-form]').forEach((form) => {
  form.addEventListener('submit', () => {
    const button = form.querySelector<HTMLButtonElement>('[data-submit]');
    if (button) {
      button.disabled = true;
      button.textContent = 'Saving…';
    }
  });
});
