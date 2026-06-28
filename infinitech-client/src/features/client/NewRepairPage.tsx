import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTicketMutation } from '../../api/ticketsApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  deviceType:         z.string().min(1, 'Выберите тип'),
  deviceBrand:        z.string().min(1, 'Укажите бренд'),
  deviceModel:        z.string().min(1, 'Укажите модель'),
  serialNumber:       z.string().optional(),
  problemDescription: z.string().min(10, 'Минимум 10 символов'),
});
type FormData = z.infer<typeof schema>;

const DEVICE_TYPES = ['Laptop', 'Desktop', 'Phone', 'Tablet', 'Printer', 'Monitor', 'Console', 'SmartWatch', 'Other'];
const TYPE_LABELS: Record<string, string> = {
  Laptop: 'Ноутбук', Desktop: 'Компьютер', Phone: 'Телефон', Tablet: 'Планшет',
  Printer: 'Принтер', Monitor: 'Монитор', Console: 'Консоль', SmartWatch: 'Смарт-часы', Other: 'Другое',
};

export function NewRepairPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [photos, setPhotos] = useState<File[]>([]);
  const [createTicket, { isLoading }] = useCreateTicketMutation();
  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const values = watch();

  const onSubmit = async (data: FormData) => {
    if (step < 3) { setStep(step + 1); return; }
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
    photos.forEach((f) => fd.append('photos', f));
    try {
      const ticket = await createTicket(fd).unwrap();
      toast.success('Заявка создана!');
      navigate(`/client/repairs/${ticket.id}`);
    } catch {
      toast.error('Ошибка создания заявки');
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="mb-2 font-display text-2xl font-bold text-text">Новая заявка на ремонт</h1>

      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold
              ${step >= s ? 'bg-blue text-white' : 'bg-border text-muted'}`}>{s}</div>
            {s < 3 && <div className={`h-0.5 w-12 ${step > s ? 'bg-blue' : 'bg-border'}`} />}
          </div>
        ))}
        <span className="ml-2 text-sm text-muted">
          {step === 1 ? 'Устройство' : step === 2 ? 'Проблема и фото' : 'Подтверждение'}
        </span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <div className="rounded-card bg-surface p-6 shadow-card space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Тип устройства</label>
              <select {...register('deviceType')}
                className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue">
                <option value="">Выберите...</option>
                {DEVICE_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABELS[t]}</option>)}
              </select>
              {errors.deviceType && <p className="text-xs text-danger mt-1">{errors.deviceType.message}</p>}
            </div>
            <Input label="Бренд" placeholder="ASUS, HP, Apple..." {...register('deviceBrand')} error={errors.deviceBrand?.message} />
            <Input label="Модель" placeholder="ZenBook 14, MacBook Pro..." {...register('deviceModel')} error={errors.deviceModel?.message} />
            <Input label="Серийный номер (необяз.)" {...register('serialNumber')} />
          </div>
        )}

        {step === 2 && (
          <div className="rounded-card bg-surface p-6 shadow-card space-y-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Описание проблемы</label>
              <textarea {...register('problemDescription')} rows={5}
                placeholder="Опишите проблему подробно..."
                className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue resize-none" />
              {errors.problemDescription && <p className="text-xs text-danger">{errors.problemDescription.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text mb-1">Фотографии (до 5)</label>
              <input type="file" accept=".jpg,.jpeg,.png,.webp" multiple
                onChange={(e) => setPhotos(Array.from(e.target.files ?? []).slice(0, 5))}
                className="w-full text-sm text-muted" />
              {photos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {photos.map((f, i) => (
                    <span key={i} className="rounded-chip bg-bg border border-border px-2 py-0.5 text-xs text-muted">{f.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-card bg-surface p-6 shadow-card space-y-3">
            <h2 className="font-display font-semibold text-text">Проверьте данные</h2>
            {[
              ['Тип', TYPE_LABELS[values.deviceType] ?? values.deviceType],
              ['Бренд', values.deviceBrand],
              ['Модель', values.deviceModel],
              ['Серийный номер', values.serialNumber ?? '—'],
              ['Описание', values.problemDescription],
              ['Фото', photos.length ? `${photos.length} файл(ов)` : 'Нет'],
            ].map(([label, val]) => (
              <div key={label} className="flex gap-4 text-sm">
                <span className="w-32 shrink-0 text-muted">{label}</span>
                <span className="text-text">{val}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={() => setStep(step - 1)}>Назад</Button>
          )}
          <Button type="submit" loading={isLoading} className="flex-1">
            {step < 3 ? 'Далее' : 'Создать заявку'}
          </Button>
        </div>
      </form>
    </div>
  );
}
