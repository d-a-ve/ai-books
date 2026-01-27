import { cn } from '~/lib/utils';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className, id, ...props }: TextareaProps) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-sm font-medium text-zinc-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'w-full px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 placeholder-zinc-400',
          'focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400',
          'transition-all duration-200 resize-y min-h-[100px]',
          'disabled:bg-zinc-50 disabled:text-zinc-500 disabled:cursor-not-allowed',
          error && 'border-red-500 focus:ring-red-500/10 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
