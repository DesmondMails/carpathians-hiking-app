import { useHomepageStore } from '../store/homepage.store'

export const useHomepage = () => {
  const homepageData = useHomepageStore((state) => state.homepageData)
  const isLoading = useHomepageStore((state) => state.isLoading)
  const homepageError = useHomepageStore((state) => state.homepageError)
  const loadHomePageData = useHomepageStore((state) => state.loadHomePageData)
  const reloadHomePageData = useHomepageStore(
    (state) => state.reloadHomePageData
  )

  return {
    homepageData,
    isLoading,
    homepageError,
    loadHomePageData,
    reloadHomePageData,
  }
}
