export type PublishStatus = 'Pending' | 'Published' | 'Failed';

export interface LandingPageJob {
  id: string;
  listingId: string;
  platform: 'Lofty';
  pageUrl?: string;
  analyticsId: string;
  pixelId: string;
  popupDelaySeconds: number;
  publishStatus: PublishStatus;
  createdAt: Date;
  updatedAt: Date;
}
