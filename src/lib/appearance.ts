export const SYSTEM_BACKGROUND_KEY = 'agri-system-background-image';
export const SYSTEM_BACKGROUND_UPDATED_EVENT = 'agri-system-background-updated';

export const DEFAULT_SYSTEM_BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2500&auto=format&fit=crop';

export const getSystemBackgroundImage = () =>
  localStorage.getItem(SYSTEM_BACKGROUND_KEY) || DEFAULT_SYSTEM_BACKGROUND_IMAGE;

export const saveSystemBackgroundImage = (imageUrl: string) => {
  localStorage.setItem(SYSTEM_BACKGROUND_KEY, imageUrl);
  window.dispatchEvent(new Event(SYSTEM_BACKGROUND_UPDATED_EVENT));
};

export const resetSystemBackgroundImage = () => {
  localStorage.removeItem(SYSTEM_BACKGROUND_KEY);
  window.dispatchEvent(new Event(SYSTEM_BACKGROUND_UPDATED_EVENT));
};
