import { useState, useCallback } from 'react';

type ToastType = 'default' | 'success' | 'error' | 'warning';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  type?: ToastType;
  duration?: number;
}

const toastQueue: Toast[] = [];
const listeners: ((toasts: Toast[]) => void)[] = [];

let toastId = 0;

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = (++toastId).toString();
  const newToast: Toast = {
    ...toast,
    id,
  };
  
  toastQueue.push(newToast);
  
  // Auto-remove after duration
  setTimeout(() => {
    removeToast(id);
  }, toast.duration || 5000);
  
  listeners.forEach(listener => listener([...toastQueue]));
};

const removeToast = (id: string) => {
  const index = toastQueue.findIndex(toast => toast.id === id);
  if (index > -1) {
    toastQueue.splice(index, 1);
    listeners.forEach(listener => listener([...toastQueue]));
  }
};

export const toast = {
  success: (message: string, options?: Partial<Toast>) => {
    addToast({
      title: 'Success',
      description: message,
      type: 'success',
      ...options,
    });
  },
  error: (message: string, options?: Partial<Toast>) => {
    addToast({
      title: 'Error',
      description: message,
      type: 'error',
      ...options,
    });
  },
  warning: (message: string, options?: Partial<Toast>) => {
    addToast({
      title: 'Warning',
      description: message,
      type: 'warning',
      ...options,
    });
  },
  default: (message: string, options?: Partial<Toast>) => {
    addToast({
      description: message,
      type: 'default',
      ...options,
    });
  },
};

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([...toastQueue]);

  const handleToastsChange = useCallback((newToasts: Toast[]) => {
    setToasts(newToasts);
  }, []);

  useState(() => {
    listeners.push(handleToastsChange);
    return () => {
      const index = listeners.indexOf(handleToastsChange);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  });

  return {
    toasts,
    toast: addToast,
    dismiss: removeToast,
  };
};
