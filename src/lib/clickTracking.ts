export type ClickEvent = {
  id: string;
  label: string;
  target: string;
  page: string;
  timestamp: string;
};

const storageKey = 'securemediahaven-click-events';
const maxEvents = 500;

const readEvents = (): ClickEvent[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) as ClickEvent[] : [];
  } catch {
    return [];
  }
};

const saveEvents = (events: ClickEvent[]) => {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(events.slice(0, maxEvents)));
  } catch {
    // Analytics should never interrupt the visitor's action.
  }
};

export const getClickEvents = () => readEvents();

export const startClickTracking = () => {
  if (typeof document === 'undefined') return () => undefined;

  const handleClick = (event: MouseEvent) => {
    const element = (event.target as HTMLElement | null)?.closest<HTMLElement>('a, button');
    if (!element || window.location.pathname === '/admin' || element.hasAttribute('data-no-track')) return;

    const label = element.getAttribute('aria-label') || element.textContent?.trim().replace(/\s+/g, ' ') || 'Untitled action';
    const href = element instanceof HTMLAnchorElement ? element.getAttribute('href') : null;
    const nextEvent: ClickEvent = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      label: label.slice(0, 80),
      target: href || element.tagName.toLowerCase(),
      page: window.location.pathname,
      timestamp: new Date().toISOString(),
    };

    saveEvents([nextEvent, ...readEvents()]);
  };

  document.addEventListener('click', handleClick);
  return () => document.removeEventListener('click', handleClick);
};