import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Preconnect to domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        
        {/* Preload critical fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        
        {/* Add meta tags for better SEO */}
        <meta name="description" content="Nairobi Verified - Discover trusted vendors in Nairobi CBD" />
        <meta name="theme-color" content="#ea580c" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}