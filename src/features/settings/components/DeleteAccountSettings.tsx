import { useState, useCallback } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AlertTriangle, CheckCircle } from 'lucide-react'
import { Modal } from '../../../components/ui/Modal'
import { useAuth } from '../../auth/useAuth'

export function DeleteAccountSettings() {
  const { t } = useTranslation()
  const { deleteAccount } = useAuth()

  const [showModal, setShowModal] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleted, setDeleted] = useState(false)

  const openModal = () => {
    setShowModal(true)
    setConfirmText('')
    setError(null)
  }

  const closeModal = useCallback(() => {
    if (!loading && !deleted) setShowModal(false)
  }, [loading, deleted])

  const handleDelete = async () => {
    setLoading(true)
    setError(null)
    try {
      await deleteAccount()
      setDeleted(true)
      setTimeout(() => {
        window.location.href = '/'
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('settings.deleteAccount.error'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Danger Zone card */}
      <section className="bg-error-container/10 border border-error/20 rounded-md overflow-hidden">
        <div className="px-6 py-4 bg-error-container/15 border-b border-error/20">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-error shrink-0" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-error">
              {t('settings.deleteAccount.heading')}
            </h2>
          </div>
        </div>
        <div className="p-6">
          <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
            {t('settings.deleteAccount.description')}
          </p>
          <button
            onClick={openModal}
            className="inline-flex items-center justify-center min-h-[44px] px-4 text-sm font-medium text-error bg-transparent border border-error/40 rounded-md transition-colors hover:bg-error hover:text-on-error hover:border-error"
          >
            {t('settings.deleteAccount.button')}
          </button>
        </div>
      </section>

      {/* Confirmation modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={deleted ? undefined : t('settings.deleteAccount.modalTitle')}
        footer={
          deleted ? undefined : (
            <>
              <button
                onClick={closeModal}
                disabled={loading}
                className="flex-1 min-h-[44px] text-sm font-medium text-on-surface bg-transparent border border-outline-variant rounded-md transition-colors hover:bg-surface-container-high"
              >
                {t('common.cancel')}
              </button>
              <button
                disabled={confirmText !== 'DELETE' || loading}
                onClick={handleDelete}
                className="flex-1 min-h-[44px] text-sm font-medium text-on-error bg-error rounded-md transition-colors hover:bg-error/90 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? t('settings.deleteAccount.deleting') : t('settings.deleteAccount.deleteConfirm')}
              </button>
            </>
          )
        }
      >
        {deleted ? (
          <>
            {/* Success state */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
              <CheckCircle size={24} className="text-secondary" />
            </div>
            <h2 className="text-lg font-semibold text-on-surface text-center">
              {t('settings.deleteAccount.successTitle')}
            </h2>
            <p className="mt-2 text-sm text-on-surface-variant text-center leading-relaxed">
              {t('settings.deleteAccount.successDescription')}
            </p>
            <p className="mt-4 text-xs text-on-surface-variant text-center">
              {t('settings.deleteAccount.redirecting')}
            </p>
          </>
        ) : (
          <>
            {/* Icon */}
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error-container/20">
              <AlertTriangle size={24} className="text-error" />
            </div>

            <p className="mt-2 text-sm text-on-surface-variant text-center leading-relaxed">
              {t('settings.deleteAccount.modalDescription')}
            </p>

            {/* Bullet list */}
            <ul className="mt-3 space-y-1.5 text-[13px] text-on-surface-variant">
              {(['bulletProfile', 'bulletReports', 'bulletWatchlists', 'bulletSubscription'] as const).map((key) => (
                <li key={key} className="flex items-start gap-2">
                  <span className="text-error mt-0.5">&#x2022;</span>
                  {t(`settings.deleteAccount.${key}`)}
                </li>
              ))}
            </ul>

            {/* Confirm input */}
            <div className="mt-5">
              <label
                htmlFor="delete-confirm"
                className="block text-[13px] font-medium text-on-surface mb-1.5"
              >
                <Trans i18nKey="settings.deleteAccount.confirmLabel" components={{ strong: <strong /> }} />
              </label>
              <input
                id="delete-confirm"
                type="text"
                autoComplete="off"
                autoFocus
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full min-h-[44px] px-3 text-base md:text-sm text-on-surface bg-surface-container-low border border-outline-variant rounded-md outline-none transition-all focus:border-error focus:ring-[3px] focus:ring-error/20"
                placeholder={t('settings.deleteAccount.confirmPlaceholder')}
              />
            </div>

            {/* Error */}
            {error && (
              <div role="alert" className="mt-3 rounded-md bg-error-container/20 px-3 py-2 text-sm text-error">
                {error}
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  )
}
