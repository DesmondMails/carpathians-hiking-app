import { useRouter } from 'expo-router'

import {
  CreateRouteModalWrapper,
  UploadGpx,
} from '@/src/features/route-creation/components'

export default function RoutesCreationScreen() {
  const router = useRouter()

  const handleClose = () => {
    router.dismiss()
  }

  return (
    <CreateRouteModalWrapper onClose={handleClose}>
      <UploadGpx />
    </CreateRouteModalWrapper>
  )
}
