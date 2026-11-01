import { MetadataRoute } from 'next';
import { globalMacCmsClient } from '@/server/maccms/macCmsClient';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.APP_PUBLIC_BASE_URL || 'https://ruda-movie.local';

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/category`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  try {
    const moviesRes = await globalMacCmsClient.getMovies({ page: 1 });
    const movieRoutes: MetadataRoute.Sitemap = (moviesRes.list || []).map((m) => ({
      url: `${baseUrl}/movie/${m.id}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...movieRoutes];
  } catch {
    return staticRoutes;
  }
}
