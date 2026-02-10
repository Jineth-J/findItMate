import React from 'react';
import { Check, Circle } from 'lucide-react';
import { getPasswordRequirements } from '../utils/validation';
interface PasswordRequirementsProps {
  password: string;
}
export function PasswordRequirements({
  password
}: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password);
  return <div className="mt-3 space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
      <p className="text-xs font-semibold text-gray-500 mb-2">
        Password must contain:
      </p>
      {requirements.map((req) => <div key={req.id} className="flex items-center gap-2 text-xs transition-colors duration-300">
          {req.met ? <Check className="h-3.5 w-3.5 text-green-600 flex-shrink-0" /> : <Circle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />}
          <span className={req.met ? 'text-green-700 font-medium' : 'text-gray-500'}>
            {req.label}
          </span>
        </div>)}
    </div>;
}