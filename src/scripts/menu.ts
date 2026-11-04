/**
 * Mobile navigation: toggles the slide-down panel, keeps aria-expanded and the
 * button label in sync, and closes on Escape, outside click, link click or resize to desktop.
 */
export function initMenu(): void {
  const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
  const menu = document.querySelector<HTMLElement>('[data-menu]');
  const label = toggle?.querySelector<HTMLElement>('[data-menu-label]');
  if (!toggle || !menu) return;

  const desktop = window.matchMedia('(min-width: 1024px)');

  const setOpen = (open: boolean, returnFocus = false): void => {
    toggle.setAttribute('aria-expanded', String(open));
    menu.toggleAttribute('data-open', open);
    const text = open ? toggle.dataset.labelClose : toggle.dataset.labelOpen;
    if (label && text) label.textContent = text;
    if (open) menu.querySelector<HTMLElement>('a')?.focus();
    else if (returnFocus) toggle.focus();
  };

  const isOpen = (): boolean => toggle.getAttribute('aria-expanded') === 'true';

  toggle.addEventListener('click', () => setOpen(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isOpen()) setOpen(false, true);
  });

  document.addEventListener('click', (event) => {
    const target = event.target as Node | null;
    if (isOpen() && target && !menu.contains(target) && !toggle.contains(target)) setOpen(false);
  });

  menu.addEventListener('click', (event) => {
    if ((event.target as HTMLElement | null)?.closest('a')) setOpen(false);
  });

  desktop.addEventListener('change', (event) => {
    if (event.matches) setOpen(false);
  });
}
