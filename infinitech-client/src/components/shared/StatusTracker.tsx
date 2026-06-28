import { Check } from 'lucide-react';
import type { TicketStatus } from '../../types';

const STEPS: { status: TicketStatus; label: string }[] = [
  { status: 'WaitingForMaster', label: 'Принята' },
  { status: 'Diagnosis',        label: 'Диагностика' },
  { status: 'PriceApproval',   label: 'Цена' },
  { status: 'InRepair',        label: 'Ремонт' },
  { status: 'ReadyForPickup',  label: 'Готово' },
  { status: 'Completed',       label: 'Выдано' },
];

const ORDER: TicketStatus[] = STEPS.map(s => s.status);

export function StatusTracker({ status }: { status: TicketStatus }) {
  if (status === 'Cancelled') {
    return (
      <div className="rounded-card bg-red-50 p-4 text-center text-sm font-medium text-danger">
        Заявка отменена
      </div>
    );
  }

  const currentIdx = ORDER.indexOf(status);

  return (
    <div className="flex items-start gap-0">
      {STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        return (
          <div key={step.status} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {idx > 0 && (
                <div className={`h-0.5 flex-1 transition-colors ${done || active ? 'bg-blue' : 'bg-border'}`} />
              )}
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors
                ${done  ? 'border-blue bg-blue text-white'
                : active ? 'border-blue bg-white text-blue'
                : 'border-border bg-white text-muted'}`}>
                {done ? <Check size={14} /> : idx + 1}
              </div>
              {idx < STEPS.length - 1 && (
                <div className={`h-0.5 flex-1 transition-colors ${done ? 'bg-blue' : 'bg-border'}`} />
              )}
            </div>
            <span className={`mt-1.5 text-center text-xs leading-tight
              ${active ? 'font-semibold text-blue' : done ? 'text-blue' : 'text-muted'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
