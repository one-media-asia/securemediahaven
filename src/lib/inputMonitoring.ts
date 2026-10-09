export type TypedInputEvent = {
  id: string;
  page: string;
  field: string;
  label: string;
  value: string;
  timestamp: string;
};

export const INPUT_LOG_KEY = 'securemediahaven-input-activity-v2';
export const INPUT_CONSENT_KEY = 'securemediahaven-input-consent';
const MAX_LOG_ENTRIES = 200;
let memoryEntries: TypedInputEvent[] = [];

const getLocalStorage = () => {
  try {
    return typeof localStorage === 'undefined' ? undefined : localStorage;
  } catch {
    return undefined;
  }
};

try {
  getLocalStorage()?.removeItem('securemediahaven-input-activity');
} catch {
  // Ignore unavailable storage.
}

const readStorage = (): TypedInputEvent[] => {
  try {
    const raw = getLocalStorage()?.getItem(INPUT_LOG_KEY);
    if (raw) {
      memoryEntries = JSON.parse(raw) as TypedInputEvent[];
    }
  } catch {
    return memoryEntries;
  }

  return memoryEntries;
};

const writeStorage = (entries: TypedInputEvent[]) => {
  memoryEntries = entries;
  try {
    getLocalStorage()?.setItem(INPUT_LOG_KEY, JSON.stringify(entries));
  } catch {
    // Keep the in-memory copy available when storage is unavailable.
  }
};

export const getInputActivity = () => readStorage();

export const getInputMonitoringConsent = (): boolean | null => {
  try {
    const value = getLocalStorage()?.getItem(INPUT_CONSENT_KEY);
    return value === 'true' ? true : value === 'false' ? false : null;
  } catch {
    return null;
  }
};

export const hasInputMonitoringConsent = () => getInputMonitoringConsent() === true;

export const setInputMonitoringConsent = (consent: boolean) => {
  try {
    getLocalStorage()?.setItem(INPUT_CONSENT_KEY, String(consent));
  } catch {
    return;
  }
};

export const clearInputActivity = () => {
  writeStorage([]);
};

export const captureInputActivity = ({
  page,
  field,
  label,
  value,
}: {
  page: string;
  field: string;
  label: string;
  value: string;
}) => {
  const entries = readStorage();
  const nextEntry: TypedInputEvent = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    page,
    field,
    label: label || field,
    value: value.slice(0, 240),
    timestamp: new Date().toISOString(),
  };

  const updated = [nextEntry, ...entries].slice(0, MAX_LOG_ENTRIES);
  writeStorage(updated);
  return updated;
};

const getFieldName = (element: HTMLElement) => {
  const name = element.getAttribute('name') || element.getAttribute('id') || 'untitled-field';
  const label = element.getAttribute('aria-label') || element.getAttribute('placeholder') || name;
  return { field: name, label };
};

const isSensitiveField = (element: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
  const fieldDetails = [
    element.type,
    element.name,
    element.id,
    element.getAttribute('autocomplete'),
    element.getAttribute('aria-label'),
    element.getAttribute('placeholder'),
    Array.from(element.labels ?? [], (label) => label.textContent ?? '').join(' '),
  ].join(' ').toLowerCase();

  return /password|email|user.?name|user.?id|login|account|phone|telephone|address|birth|dob|search|query|card|cvv|cvc|security.?code|secret|token|auth|otp|one.?time.?code|ssn|social.?security/.test(fieldDetails)
    || element.autocomplete === 'current-password'
    || element.autocomplete === 'new-password';
};

let monitoringStarted = false;

export const startInputMonitoring = () => {
  if (typeof document === 'undefined' || monitoringStarted) {
    return undefined;
  }

  monitoringStarted = true;

  const onInput = (event: Event) => {
    const target = event.target as HTMLElement | null;
    if (!(target instanceof HTMLTextAreaElement || target instanceof HTMLInputElement && target.type === 'text')) {
      return;
    }
    if (!hasInputMonitoringConsent() || isSensitiveField(target)) {
      return;
    }

    const value = target.value ?? '';
    if (!value.trim()) {
      return;
    }

    const { field, label } = getFieldName(target);
    captureInputActivity({
      page: window.location.pathname || '/',
      field,
      label,
      value,
    });
  };

  document.addEventListener('input', onInput);

  return () => {
    monitoringStarted = false;
    document.removeEventListener('input', onInput);
  };
};
