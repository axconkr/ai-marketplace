import { useEffect, useRef } from 'react';

type KeyboardShortcut = {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  metaKey?: boolean;
  callback: () => void;
};

/**
 * Hook to register keyboard shortcuts
 */
export function useKeyboardShortcut(shortcuts: KeyboardShortcut[]) {
  const callbacksRef = useRef(shortcuts);

  useEffect(() => {
    callbacksRef.current = shortcuts;
  }, [shortcuts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInputActive =
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        activeElement?.hasAttribute('contenteditable');

      callbacksRef.current.forEach((shortcut) => {
        const keyMatches = event.key === shortcut.key;
        const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
        const shiftMatches = shortcut.shiftKey
          ? event.shiftKey
          : !event.shiftKey;
        const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;

        if (keyMatches && ctrlMatches && shiftMatches && metaMatches) {
          // Allow shortcuts even when input is active for specific keys like '/'
          if (shortcut.key === '/' && !isInputActive) {
            event.preventDefault();
            shortcut.callback();
          } else if (!isInputActive) {
            event.preventDefault();
            shortcut.callback();
          }
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
}
