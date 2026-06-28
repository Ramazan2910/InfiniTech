import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/i18n';
import { useAppSelector } from '../../app/hooks';
import { useChangePasswordMutation } from '../../api/authApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

const LANGUAGES = [
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export function SettingsPage() {
  const { t } = useTranslation();
  const user = useAppSelector((s) => s.auth.user);
  const currentLang = i18n.language;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [changePassword, { isLoading: changing }] = useChangePasswordMutation();

  const handleLangChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await changePassword({ currentPassword, newPassword }).unwrap();
      toast.success(t('settings.passwordChanged'));
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: unknown) {
      const e = err as { data?: { error?: string } };
      toast.error(e?.data?.error ?? t('common.error'));
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-bold text-text">{t('settings.title')}</h1>

      {/* Profile info (read-only) */}
      <div className="rounded-card bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-display text-base font-semibold text-text">{t('settings.profile')}</h2>
        <dl className="space-y-2 text-sm">
          {[
            [t('auth.firstName'), user?.firstName],
            [t('auth.lastName'), user?.lastName],
            ['Email', user?.email],
            ['Role', user?.role],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between">
              <dt className="text-muted">{label}</dt>
              <dd className="font-medium text-text">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Language */}
      <div className="rounded-card bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-display text-base font-semibold text-text">{t('settings.language')}</h2>
        <div className="flex gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLangChange(lang.code)}
              className={`flex items-center gap-2 rounded-btn border px-4 py-2 text-sm font-medium transition
                ${currentLang === lang.code
                  ? 'border-blue bg-blue text-white'
                  : 'border-border text-text hover:border-navy'}`}
            >
              <span>{lang.flag}</span> {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Change password */}
      <div className="rounded-card bg-surface p-6 shadow-card">
        <h2 className="mb-4 font-display text-base font-semibold text-text">{t('settings.password')}</h2>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <Input
            label={t('settings.currentPassword')} type="password"
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input
            label={t('settings.newPassword')} type="password"
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            required minLength={8}
          />
          <Button type="submit" loading={changing}>{t('settings.changePassword')}</Button>
        </form>
      </div>
    </div>
  );
}
