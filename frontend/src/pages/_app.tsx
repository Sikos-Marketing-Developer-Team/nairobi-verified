import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import preloadCriticalImages from '../utils/preloadImages'

// Performance monitoring function
const reportWebVitals = ({ id, name, label, value }: any) => {
  // You can send the metrics to your analytics service here
  console.log(name, value)
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  // Add page transition progress indicator and preload critical images
  useEffect(() => {
    // Preload critical images for better performance
    preloadCriticalImages().catch(err => {
      console.warn('Failed to preload some images:', err);
    });
    
    const handleStart = () => {
      // Show loading indicator
      document.body.classList.add('loading')
    }
    const handleComplete = () => {
      // Hide loading indicator
      document.body.classList.remove('loading')
    }

    router.events.on('routeChangeStart', handleStart)
    router.events.on('routeChangeComplete', handleComplete)
    router.events.on('routeChangeError', handleComplete)

    return () => {
      router.events.off('routeChangeStart', handleStart)
      router.events.off('routeChangeComplete', handleComplete)
      router.events.off('routeChangeError', handleComplete)
    }
  }, [router])

  return <Component {...pageProps} />
}

// Export the performance monitoring function
export { reportWebVitals }