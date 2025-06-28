import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
}

const defaultSEOProps = {
  title: 'Nairobi Verified - Trusted Marketplace in Nairobi CBD',
  description: 'Shop with confidence from verified merchants in Nairobi CBD. Every merchant has a physical location you can visit. Secure payments, quality products, local support.',
  keywords: 'Nairobi marketplace, verified merchants, CBD shopping, Kenya e-commerce, trusted sellers, flash sales, local business',
  image: '/opengraph-image.svg',
  url: 'https://nairobi-verified.onrender.com',
  type: 'website'
};

const SEO: React.FC<SEOProps> = ({
  title = defaultSEOProps.title,
  description = defaultSEOProps.description,
  keywords = defaultSEOProps.keywords,
  image = defaultSEOProps.image,
  url = defaultSEOProps.url,
  type = defaultSEOProps.type
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content="Nairobi Verified" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Nairobi Verified" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;