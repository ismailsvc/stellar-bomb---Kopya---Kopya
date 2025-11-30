/**
 * AD MANAGER SERVICE
 * Reklam yönetimi ve takibi
 */

import type { Advertisement } from "../config/ads.config";
import { AD_TRACKING } from "../config/ads.config";

export interface AdAnalytics {
  ad_id: string;
  impressions: number;
  clicks: number;
  ctr: number; // Click-through rate
  timestamp: string;
}

class AdManager {
  private ads: Advertisement[] = [];
  private analytics: Map<string, AdAnalytics> = new Map();

  constructor() {
    this.loadAnalytics();
  }

  /**
   * Tüm aktif reklamları getir
   */
  getActiveAds(): Advertisement[] {
    const now = new Date().toISOString();
    return this.ads.filter(
      (ad) =>
        ad.active &&
        new Date(ad.start_date) <= new Date(now) &&
        new Date(ad.end_date) >= new Date(now)
    );
  }

  /**
   * Belirli placement'a ait reklamları getir
   */
  getAdsByPlacement(placementId: string): Advertisement[] {
    return this.getActiveAds().filter((ad) =>
      ad.placement_ids.includes(placementId)
    );
  }

  /**
   * Priority'ye göre reklam seç
   */
  selectAdByPriority(placementId: string): Advertisement | null {
    const ads = this.getAdsByPlacement(placementId);
    if (ads.length === 0) return null;

    // Priority sırasına göre (high -> medium -> low)
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const sorted = ads.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
    );

    return sorted[0];
  }

  /**
   * Random reklam seç (rotation için)
   */
  selectRandomAd(placementId: string): Advertisement | null {
    const ads = this.getAdsByPlacement(placementId);
    if (ads.length === 0) return null;
    return ads[Math.floor(Math.random() * ads.length)];
  }

  /**
   * Impression kayıt et
   */
  recordImpression(adId: string): void {
    if (!AD_TRACKING.LOG_IMPRESSIONS) return;

    const analytics = this.analytics.get(adId) || {
      ad_id: adId,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      timestamp: new Date().toISOString(),
    };

    analytics.impressions++;
    this.updateCTR(analytics);
    this.analytics.set(adId, analytics);
    this.saveAnalytics();
  }

  /**
   * Click kayıt et
   */
  recordClick(adId: string): void {
    if (!AD_TRACKING.LOG_CLICKS) return;

    const analytics = this.analytics.get(adId) || {
      ad_id: adId,
      impressions: 0,
      clicks: 0,
      ctr: 0,
      timestamp: new Date().toISOString(),
    };

    analytics.clicks++;
    this.updateCTR(analytics);
    this.analytics.set(adId, analytics);
    this.saveAnalytics();
  }

  /**
   * CTR (Click-Through Rate) hesapla
   */
  private updateCTR(analytics: AdAnalytics): void {
    if (analytics.impressions === 0) {
      analytics.ctr = 0;
    } else {
      analytics.ctr = (analytics.clicks / analytics.impressions) * 100;
    }
  }

  /**
   * Analytics kayıt et
   */
  private saveAnalytics(): void {
    const data = Array.from(this.analytics.values());
    localStorage.setItem(AD_TRACKING.STORAGE_KEY, JSON.stringify(data));
  }

  /**
   * Analytics yükle
   */
  private loadAnalytics(): void {
    try {
      const data = localStorage.getItem(AD_TRACKING.STORAGE_KEY);
      if (data) {
        const analytics = JSON.parse(data) as AdAnalytics[];
        analytics.forEach((a) => this.analytics.set(a.ad_id, a));
      }
    } catch (error) {
      console.error("Failed to load ad analytics:", error);
    }
  }

  /**
   * Tüm analytics'i getir
   */
  getAnalytics(): AdAnalytics[] {
    return Array.from(this.analytics.values());
  }

  /**
   * Belirli ad'in analytics'ini getir
   */
  getAdAnalytics(adId: string): AdAnalytics | null {
    return this.analytics.get(adId) || null;
  }

  /**
   * Reklamlar yükle (Supabase'den veya default)
   */
  async loadAds(ads: Advertisement[]): Promise<void> {
    this.ads = ads;
  }

  /**
   * Analytics'i sıfırla
   */
  resetAnalytics(): void {
    this.analytics.clear();
    localStorage.removeItem(AD_TRACKING.STORAGE_KEY);
  }
}

export const adManager = new AdManager();
