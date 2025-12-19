import { Metadata } from 'next'

// Базовые SEO настройки
export const siteConfig = {
  name: 'Music Room',
  description:
    'Платформа для совместного прослушивания музыки в реальном времени. Создавайте комнаты, слушайте музыку с друзьями и общайтесь в чате.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://music-room.vercel.app',
  ogImage: '/og-image.jpg',
  creator: '@musicroom',
  keywords: [
    'музыка',
    'совместное прослушивание',
    'музыкальная комната',
    'онлайн музыка',
    'чат',
    'плейлист',
    'стриминг',
    'социальная музыка',
    'music room',
    'collaborative listening',
  ],
  authors: [
    {
      name: 'Music Room Team',
      url: 'https://music-room.vercel.app',
    },
  ],
}

// Генерация метаданных для страниц
export function generateMetadata({
  title,
  description,
  image,
  url,
  noIndex = false,
}: {
  title?: string
  description?: string
  image?: string
  url?: string
  noIndex?: boolean
} = {}): Metadata {
  const pageTitle = title ? `${title} | ${siteConfig.name}` : siteConfig.name
  const pageDescription = description || siteConfig.description
  const pageImage = image || siteConfig.ogImage
  const pageUrl = url ? `${siteConfig.url}${url}` : siteConfig.url

  return {
    // Базовый URL для абсолютных путей
    metadataBase: new URL(siteConfig.url),

    title: pageTitle,
    description: pageDescription,
    keywords: siteConfig.keywords,
    authors: siteConfig.authors,
    creator: siteConfig.creator,

    // Open Graph
    openGraph: {
      type: 'website',
      locale: 'ru_RU',
      url: pageUrl,
      title: pageTitle,
      description: pageDescription,
      siteName: siteConfig.name,
      images: [
        {
          url: pageImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDescription,
      images: [pageImage],
      creator: siteConfig.creator,
    },

    // Robots
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // Verification
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
      yandex: process.env.YANDEX_VERIFICATION,
    },

    // Canonical URL
    alternates: {
      canonical: pageUrl,
    },

    // Additional meta tags
    other: {
      'theme-color': '#8B5CF6',
      'color-scheme': 'dark light',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'default',
      'apple-mobile-web-app-title': siteConfig.name,
      'application-name': siteConfig.name,
      'msapplication-TileColor': '#8B5CF6',
      'msapplication-config': '/browserconfig.xml',
    },
  }
}

// JSON-LD структурированные данные
export function generateJsonLd(
  type: 'website' | 'organization' | 'webapp' = 'website'
) {
  const baseData = {
    '@context': 'https://schema.org',
    '@type':
      type === 'website'
        ? 'WebSite'
        : type === 'organization'
          ? 'Organization'
          : 'WebApplication',
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  }

  if (type === 'website') {
    return {
      ...baseData,
      potentialAction: {
        '@type': 'SearchAction',
        target: `${siteConfig.url}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    }
  }

  if (type === 'organization') {
    return {
      ...baseData,
      logo: `${siteConfig.url}/icons/icon-512x512.png`,
      sameAs: [
        // Добавьте ссылки на социальные сети
      ],
    }
  }

  if (type === 'webapp') {
    return {
      ...baseData,
      applicationCategory: 'MusicApplication',
      operatingSystem: 'Web Browser',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
    }
  }

  return baseData
}

// Breadcrumbs для навигации
export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${siteConfig.url}${item.url}`,
    })),
  }
}

// FAQ Schema для страниц с вопросами
export function generateFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }
}

// Хук для динамического обновления мета-тегов
export function useSEO() {
  const updateTitle = (title: string) => {
    document.title = `${title} | ${siteConfig.name}`
  }

  const updateDescription = (description: string) => {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', description)
    }
  }

  const updateCanonical = (url: string) => {
    const canonical = document.querySelector('link[rel="canonical"]')
    if (canonical) {
      canonical.setAttribute('href', `${siteConfig.url}${url}`)
    }
  }

  return { updateTitle, updateDescription, updateCanonical }
}
