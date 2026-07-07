import { useAppModals } from '@/features/app-modals'
import { ComposerModal } from '@/features/composer'
import { ConnectPlatformModal } from '@/features/connect-platform'
import { UpgradePlanModal } from '@/features/upgrade-plan'

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

  return (
    <>
      <ComposerModal opened={composer.opened} postId={composer.postId} onClose={closeComposer} />
      <ConnectPlatformModal opened={connectPlatform.opened} onClose={closeConnectPlatform} />
      <UpgradePlanModal opened={upgrade.opened} onClose={closeUpgrade} />
    </>
  )
}
