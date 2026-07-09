import { useAppModals } from '@/features/app-modals'
import { ComposerModal } from '@/features/composer'
import { ConnectPlatformModal } from '@/features/connect-platform'
import { UpgradePlanModal } from '@/features/upgrade-plan'
import { ErrorBoundary } from '@/shared/ui'

/**
 * Хост глобальных модалок кабинета — единственное место, где UI-состояние
 * app-modals (Redux) связывается с модалками-фичами. Сами фичи получают
 * состояние пропсами и не знают про соседний слайс (границы FSD).
 *
 * Новая глобальная модалка = вариант в appModalsSlice + строка здесь;
 * AppLayout при этом не меняется.
 */
export function AppModals() {
  const { composer, closeComposer, connectPlatform, closeConnectPlatform, upgrade, closeUpgrade } =
    useAppModals()

  // Каждая рисковая модалка — в своей границе ошибок (fallback=null): падение
  // рендера одной не роняет соседние модалки и оболочку кабинета.
  return (
    <>
      <ErrorBoundary fallback={null}>
        <ComposerModal opened={composer.opened} postId={composer.postId} onClose={closeComposer} />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <ConnectPlatformModal
          opened={connectPlatform.opened}
          networkId={connectPlatform.networkId}
          onClose={closeConnectPlatform}
        />
      </ErrorBoundary>
      <ErrorBoundary fallback={null}>
        <UpgradePlanModal opened={upgrade.opened} onClose={closeUpgrade} />
      </ErrorBoundary>
    </>
  )
}
