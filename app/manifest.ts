import { MetadataRoute } from 'next'

export const dynamic = 'force-static'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tambola Housie Hub',
    short_name: 'Tambola',
    description: 'The ultimate platform to host, manage, and play Tambola.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    scope: '/',
    background_color: '#ffffff',
    theme_color: '#db2777', // Matches the secondary/pink brand color
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/apple-touch-icon.svg',
        sizes: '180x180',
        type: 'image/svg+xml',
      },
    ],
  }
}
