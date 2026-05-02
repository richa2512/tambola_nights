import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Tambola Housie Hub',
    short_name: 'Tambola',
    description: 'The ultimate platform to host, manage, and play Tambola.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#db2777', // Matches the secondary/pink brand color
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
