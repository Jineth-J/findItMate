import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
interface FormErrorBannerProps {
  errors: string[];
  onDismiss?: () => void;
  className?: string;
}
export function FormErrorBanner({
  errors,
  onDismiss,
  className = ''
}: FormErrorBannerProps) {
  if (!errors || errors.length === 0) return null;
  return <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-amber-900 mb-1">
          Please correct the following issues:
        </h4>
        <ul className="list-disc list-inside text-sm text-amber-800 space-y-1">
          {errors.map((error, index) => <li key={index}>{error}</li>)}
        </ul>
      </div>
      {onDismiss && <button onClick={onDismiss} className="text-amber-500 hover:text-amber-700 transition-colors" type="button">
          <X className="h-5 w-5" />
        </button>}
    </div>;
}