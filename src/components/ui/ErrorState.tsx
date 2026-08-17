import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

export function ErrorState({
  message = "Something went wrong while loading this data.",
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div role="alert" className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
        <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden />
      </div>
      <div>
        <p className="font-display text-sm font-semibold text-ink">Couldn&apos;t load data</p>
        <p className="mt-1 max-w-sm text-sm text-ink/50">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}
