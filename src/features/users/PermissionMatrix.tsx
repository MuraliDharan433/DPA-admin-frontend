'use client';

import { Check } from 'lucide-react';
import { PERMISSION_GROUPS, type PermissionKey } from '@/constants/permissions';
import { cn } from '@/utils/cn';

/**
 * Renders every permission as a checkbox grouped by module. `checked` decides the current
 * state per key; `onToggle` receives the key being flipped - the caller decides how that
 * maps to role defaults vs. per-user grant/revoke overrides.
 */
export function PermissionMatrix({
  checked,
  onToggle,
  disabledKeys,
}: {
  checked: (key: PermissionKey) => boolean;
  onToggle: (key: PermissionKey) => void;
  disabledKeys?: PermissionKey[];
}) {
  return (
    <div className="overflow-x-auto rounded-xl border border-black/[0.06]">
      <table className="w-full min-w-[480px] text-sm">
        <tbody className="divide-y divide-black/[0.06]">
          {Object.entries(PERMISSION_GROUPS).map(([group, def]) => (
            <tr key={group}>
              <td className="w-40 px-4 py-3 align-top text-sm font-medium text-ink">{def.label}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-3">
                  {def.actions.map((action) => {
                    const isChecked = checked(action.key);
                    const isDisabled = disabledKeys?.includes(action.key);
                    return (
                      <button
                        type="button"
                        key={action.key}
                        disabled={isDisabled}
                        onClick={() => onToggle(action.key)}
                        className={cn(
                          'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                          isChecked
                            ? 'border-brand-300 bg-brand-50 text-brand-700'
                            : 'border-black/10 text-ink/50 hover:bg-black/[0.03]',
                          isDisabled && 'cursor-not-allowed opacity-50',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-3.5 w-3.5 items-center justify-center rounded border',
                            isChecked ? 'border-brand-600 bg-brand-600' : 'border-black/20 bg-white',
                          )}
                        >
                          {isChecked && <Check className="h-2.5 w-2.5 text-white" />}
                        </span>
                        {action.label}
                      </button>
                    );
                  })}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
