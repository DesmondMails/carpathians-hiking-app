import { colors } from '@/src/theme/colors'

import { DraftImageItem, ImageStatusMeta } from '../../../types'

export const getStatusMeta = (
  status: DraftImageItem['status'],
): ImageStatusMeta => {
  switch (status) {
    case 'uploading':
      return {
        label: 'Завантаження',
        backgroundColor: colors.transparentDark,
        textColor: colors.textWhite,
      }
    case 'uploaded':
      return {
        label: 'Готово',
        backgroundColor: colors.primaryLight,
        textColor: colors.primaryDark,
      }
    case 'failed':
      return {
        label: 'Помилка',
        backgroundColor: colors.warning,
        textColor: colors.textWhite,
      }
  }
}
