/**
 * ADVERTISEMENT BANNER COMPONENT
 * Reklamları göstermek için yeniden kullanılabilir component
 */

import React, { useState, useEffect } from "react";
import type { Advertisement } from "../../config/ads.config";
import { AD_ROTATION } from "../../config/ads.config";
import { adManager } from "../../services/adManager";

interface AdBannerProps {
  placement: string; // placement ID
  type?: "banner" | "spotlight" | "notification";
  autoRotate?: boolean;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  placement,
  type = "banner",
  autoRotate = true,
}) => {
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const [rotationTimer, setRotationTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  const rotationTime = placement.includes("header")
    ? AD_ROTATION.HEADER
    : placement.includes("leaderboard")
      ? AD_ROTATION.LEADERBOARD
      : AD_ROTATION.SIDEBAR;

  useEffect(() => {
    // İlk reklamı seç
    const ad = adManager.selectRandomAd(placement);
    if (ad) {
      setCurrentAd(ad);
      adManager.recordImpression(ad.id);
    }

    // Auto rotation ayarla
    if (autoRotate && rotationTime) {
      const timer = setInterval(() => {
        const nextAd = adManager.selectRandomAd(placement);
        if (nextAd) {
          setCurrentAd(nextAd);
          adManager.recordImpression(nextAd.id);
        }
      }, rotationTime);

      setRotationTimer(timer);
    }

    return () => {
      if (rotationTimer) clearInterval(rotationTimer);
    };
  }, [placement, autoRotate, rotationTime]);

  if (!currentAd) {
    return null; // Reklam yoksa gösterme
  }

  const handleClick = () => {
    adManager.recordClick(currentAd.id);
    window.open(currentAd.cta_url, "_blank");
  };

  const bannerClassNames = {
    banner: "ad-banner",
    spotlight: "ad-spotlight",
    notification: "ad-notification",
  };

  return (
    <div className={`${bannerClassNames[type]} ad-container`}>
      <div className="ad-content">
        {currentAd.image_url && (
          <img src={currentAd.image_url} alt={currentAd.title} className="ad-image" />
        )}

        <div className="ad-text">
          <div className="ad-sponsor">
            {currentAd.sponsor_logo && (
              <img
                src={currentAd.sponsor_logo}
                alt={currentAd.sponsor_name}
                className="sponsor-logo"
              />
            )}
            <span className="sponsor-name">{currentAd.sponsor_name}</span>
          </div>

          <h3 className="ad-title">{currentAd.title}</h3>
          <p className="ad-description">{currentAd.description}</p>
        </div>

        <button className="ad-cta" onClick={handleClick}>
          {currentAd.cta_text}
        </button>
      </div>

      {/* Priority indicator */}
      <div className={`ad-priority-badge priority-${currentAd.priority}`}>
        {currentAd.priority === "high"
          ? "⭐"
          : currentAd.priority === "medium"
            ? "✨"
            : "•"}
      </div>

      {/* Analytics indicator */}
      <div className="ad-analytics" title="Impressions / Clicks">
        {currentAd.impressions || 0}👁️ / {currentAd.clicks || 0}👆
      </div>
    </div>
  );
};

export default AdBanner;
