/**
 * Progressive enhancement for the contact form.
 * - "formspree" mode: submits with fetch and shows an inline status (falls back to a normal POST without JS).
 * - "mailto" mode: opens the visitor's email app with subject and body filled in.
 */
export function initContactForms(): void {
  document.querySelectorAll<HTMLFormElement>('form[data-contact-form]').forEach((form) => {
    const status = form.querySelector<HTMLElement>('[data-status]');
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');

    const setStatus = (message: string, state: 'pending' | 'success' | 'error'): void => {
      if (!status) return;
      status.textContent = message;
      status.dataset.state = state;
    };

    form.addEventListener('submit', async (event) => {
      if (!form.checkValidity()) return;
      event.preventDefault();
      const data = new FormData(form);

      if (form.dataset.mode === 'mailto') {
        const name = String(data.get('name') ?? '');
        const email = String(data.get('email') ?? '');
        const message = String(data.get('message') ?? '');
        const subject = (form.dataset.subject ?? 'Website message from {name}').replace('{name}', name);
        const body = `${message}\n\n— ${name} (${email})`;
        window.location.href = `mailto:${form.dataset.email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        return;
      }

      if (submit) submit.disabled = true;
      setStatus(form.dataset.sending ?? '', 'pending');
      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error(`Formspree responded ${response.status}`);
        form.reset();
        setStatus(form.dataset.success ?? '', 'success');
      } catch {
        setStatus(form.dataset.error ?? '', 'error');
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });
}
