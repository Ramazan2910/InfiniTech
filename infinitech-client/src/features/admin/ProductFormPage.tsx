import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Upload } from 'lucide-react';
import { useGetProductQuery, useCreateProductMutation, useUpdateProductMutation, useGetCategoriesQuery } from '../../api/productsApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const schema = z.object({
  name:          z.string().min(2),
  description:   z.string().min(5),
  sku:           z.string().min(2),
  categoryId:    z.string().min(1, 'Выберите категорию'),
  condition:     z.enum(['0', '1']),
  price:         z.string().regex(/^\d+(\.\d{1,2})?$/, 'Некорректная цена'),
  stockQuantity: z.string().regex(/^\d+$/, 'Только целое число'),
});
type FormData = z.infer<typeof schema>;

export function ProductFormPage() {
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { data: product } = useGetProductQuery(id!, { skip: !isEdit });
  const { data: categories } = useGetCategoriesQuery();
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (product && isEdit) {
      reset({
        name: product.name, description: product.description, sku: product.sku,
        categoryId: String(product.categoryId), condition: product.condition === 'New' ? '0' : '1',
        price: String(product.price), stockQuantity: String(product.stockQuantity),
      });
      if (product.imagePath) setPreview(`/uploads/${product.imagePath}`);
    }
  }, [product, isEdit, reset]);

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setImageFile(file); setPreview(URL.createObjectURL(file)); }
  };

  const onSubmit = async (data: FormData) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    try {
      if (isEdit) {
        await updateProduct({ id: id!, body: fd }).unwrap();
        toast.success('Товар обновлён');
      } else {
        await createProduct(fd).unwrap();
        toast.success('Товар добавлен');
      }
      navigate('/admin/products');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error ?? 'Ошибка');
    }
  };

  const isLoading = creating || updating;

  return (
    <div className="max-w-2xl">
      <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-sm text-muted hover:text-navy transition">
        <ArrowLeft size={16} /> Назад
      </button>
      <h1 className="mb-6 font-display text-2xl font-bold text-text">
        {isEdit ? 'Редактировать товар' : 'Добавить товар'}
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-card bg-surface p-6 shadow-card space-y-4">
          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-text mb-2">Изображение</label>
            {preview && <img src={preview} alt="Preview" className="mb-3 h-32 w-32 rounded-card object-cover border border-border" />}
            <label className="flex items-center gap-2 cursor-pointer text-sm text-blue hover:text-blue-light">
              <Upload size={16} /> Загрузить изображение
              <input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={onImageChange} className="hidden" />
            </label>
          </div>

          <Input label="Название" {...register('name')} error={errors.name?.message} />
          <div>
            <label className="block text-sm font-medium text-text mb-1">Описание</label>
            <textarea {...register('description')} rows={4}
              className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue resize-none" />
            {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input label="SKU" {...register('sku')} error={errors.sku?.message} />
            <div>
              <label className="block text-sm font-medium text-text mb-1">Категория</label>
              <select {...register('categoryId')}
                className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue">
                <option value="">Выберите...</option>
                {categories?.map((c) => <option key={c.id} value={String(c.id)}>{c.iconEmoji} {c.name}</option>)}
              </select>
              {errors.categoryId && <p className="text-xs text-danger">{errors.categoryId.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-text mb-1">Состояние</label>
              <select {...register('condition')}
                className="w-full rounded-btn border border-border px-3 py-2.5 text-sm outline-none focus:border-blue">
                <option value="0">Новый</option>
                <option value="1">Б/У</option>
              </select>
            </div>
            <Input label="Цена (₼)" type="number" step="0.01" {...register('price')} error={errors.price?.message} />
            <Input label="Склад (шт.)" type="number" {...register('stockQuantity')} error={errors.stockQuantity?.message} />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>Отмена</Button>
          <Button type="submit" loading={isLoading} className="flex-1">
            {isEdit ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
}
