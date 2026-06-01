import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type ThemePreference = 'light' | 'dark' | 'system';

const options: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'Auto', icon: Monitor }
];

function resolveTheme(preference: ThemePreference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  return preference;
}

function applyTheme(preference: ThemePreference) {
  const resolved = resolveTheme(preference);
  document.documentElement.classList.toggle('dark', resolved === 'dark');
  document.documentElement.dataset.themePreference = preference;
  window.localStorage.setItem('theme-preference', preference);
}

export default function ThemeToggle() {
  const [preference, setPreference] = useState<ThemePreference>('system');

  useEffect(() => {
    const stored = (window.localStorage.getItem('theme-preference') as ThemePreference | null) ?? 'system';
    setPreference(stored);
    applyTheme(stored);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const current = (window.localStorage.getItem('theme-preference') as ThemePreference | null) ?? 'system';
      if (current === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5 shadow-sm sm:gap-1 sm:p-1">
      {options.map((option) => {
        const Icon = option.icon;

        return (
          <Button
            key={option.value}
            type="button"
            variant={preference === option.value ? 'secondary' : 'ghost'}
            size="sm"
            className={cn(
              'h-7 rounded-md px-1.5 text-xs sm:px-3',
              preference === option.value && 'bg-secondary'
            )}
            onClick={() => {
              setPreference(option.value);
              applyTheme(option.value);
            }}
          >
            <Icon className="size-3.5" />
            <span className="sr-only sm:not-sr-only">{option.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
