/**
 * ADMIN PANEL COMPONENT
 * Admin reklamları yönetmek için panel
 */

import React, { useState, useEffect } from "react";
import type { Advertisement } from "../../config/ads.config";
import { 
  loadAllAdvertisementsForAdmin,
  toggleAdvertisement,
  deleteAdvertisement
} from "../../lib/supabase";

interface AdminPanelProps {
  isAdmin: boolean;
  onLogout?: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<"ads" | "analytics" | "users">("ads");
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reklamları yükle
  useEffect(() => {
    loadAdsFromSupabase();
  }, []);

  const loadAdsFromSupabase = async () => {
    setLoading(true);
    setError(null);
    try {
      const ads = await loadAllAdvertisementsForAdmin();
      setAdvertisements(ads as Advertisement[]);
    } catch (err) {
      console.error("Error loading advertisements:", err);
      setError("Reklamlar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAd = async (ad: Advertisement) => {
    if (!ad.id) return;
    
    setLoading(true);
    try {
      const result = await toggleAdvertisement(ad.id, !(ad.active ?? false));
      if (result.success) {
        setAdvertisements(
          advertisements.map((a) =>
            a.id === ad.id ? { ...a, active: !(a.active ?? false) } : a
          )
        );
      } else {
        setError("Reklam durumu değiştirilirken hata oluştu");
      }
    } catch (err) {
      console.error("Error toggling ad:", err);
      setError("Hata: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAd = async (adId: string | undefined) => {
    if (!adId) return;
    
    if (!confirm("Bu reklamı silmek istediğinize emin misiniz?")) return;
    
    setLoading(true);
    try {
      const result = await deleteAdvertisement(adId);
      if (result.success) {
        setAdvertisements(advertisements.filter((a) => a.id !== adId));
      } else {
        setError("Reklam silinirken hata oluştu");
      }
    } catch (err) {
      console.error("Error deleting ad:", err);
      setError("Hata: " + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>⚙️ Admin Paneli</h1>
        <button
          className="btn-admin-logout"
          onClick={() => {
            if (onLogout) onLogout();
          }}
        >
          Çıkış Yap
        </button>
      </div>

      {error && (
        <div className="error-message" style={{ color: "#ff6b6b", padding: "10px", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      {/* TAB MENU */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === "ads" ? "active" : ""}`}
          onClick={() => setActiveTab("ads")}
        >
          📢 Reklamlar ({advertisements.length})
        </button>
        <button
          className={`admin-tab ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          📊 Analitikler
        </button>
        <button
          className={`admin-tab ${activeTab === "users" ? "active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          👥 Kullanıcılar
        </button>
      </div>

      {/* ADS MANAGEMENT */}
      {activeTab === "ads" && (
        <div className="admin-content">
          <div className="admin-section-header">
            <h2>📢 Reklam Yönetimi</h2>
            <button className="btn-admin-primary">+ Yeni Reklam</button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Reklamlar yükleniyor...</p>
            </div>
          ) : advertisements.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Henüz reklam yok</p>
            </div>
          ) : (
            <div className="admin-ads-grid">
              {advertisements.map((ad) => (
                <div key={ad.id} className="admin-ad-card">
                  {/* HEADER */}
                  <div className="admin-ad-header">
                    <div className="admin-ad-title">
                      <h3>{ad.title}</h3>
                      <span className={`admin-priority ${ad.priority}`}>
                        {ad.priority === "high"
                          ? "⭐ Yüksek"
                          : ad.priority === "medium"
                            ? "✨ Orta"
                            : "• Düşük"}
                      </span>
                    </div>
                    <div className="admin-ad-status">
                      <span className={`admin-status-badge ${ad.active ? "active" : "inactive"}`}>
                        {ad.active ? "🟢 Aktif" : "🔴 Pasif"}
                      </span>
                    </div>
                  </div>

                  {/* CONTENT */}
                  <div className="admin-ad-content">
                    <div className="admin-ad-info">
                      <div className="info-row">
                        <span className="label">Sponsor:</span>
                        <span className="value">{ad.sponsor_name}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Başlık:</span>
                        <span className="value">{ad.title}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">CTA:</span>
                        <span className="value">{ad.cta_text}</span>
                      </div>
                      <div className="info-row">
                        <span className="label">Tarih:</span>
                        <span className="value">
                          {new Date(ad.start_date).toLocaleDateString("tr-TR")} -{" "}
                          {new Date(ad.end_date).toLocaleDateString("tr-TR")}
                        </span>
                      </div>
                    </div>

                    {/* ANALYTICS */}
                    <div className="admin-ad-analytics">
                      <div className="stat-mini">
                        <span className="label">👁️ Gösterimler</span>
                        <span className="value">{ad.impressions || 0}</span>
                      </div>
                      <div className="stat-mini">
                        <span className="label">👆 Tıklamalar</span>
                        <span className="value">{ad.clicks || 0}</span>
                      </div>
                      <div className="stat-mini">
                        <span className="label">📊 CTR</span>
                        <span className="value">
                          {ad.impressions ? ((ad.clicks || 0) / ad.impressions * 100).toFixed(2) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="admin-ad-actions">
                    <button
                      className="btn-admin-secondary"
                      onClick={() => handleToggleAd(ad)}
                      title={ad.active ? "Deaktif Et" : "Aktif Et"}
                      disabled={loading}
                    >
                      {ad.active ? "🔴 Deaktif Et" : "🟢 Aktif Et"}
                    </button>
                    <button
                      className="btn-admin-danger"
                      onClick={() => handleDeleteAd(ad.id)}
                      title="Sil"
                      disabled={loading}
                    >
                      🗑️ Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ANALYTICS */}
      {activeTab === "analytics" && (
        <div className="admin-content">
          <h2>📊 Reklam Analitikleri</h2>
          <div className="admin-analytics">
            <div className="stat-card">
              <div className="stat-label">Toplam Gösterimler</div>
              <div className="stat-big-value">
                {advertisements.reduce((sum, ad) => sum + (ad.impressions || 0), 0)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Toplam Tıklamalar</div>
              <div className="stat-big-value">
                {advertisements.reduce((sum, ad) => sum + (ad.clicks || 0), 0)}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Ortalama CTR</div>
              <div className="stat-big-value">
                {advertisements.length > 0
                  ? (
                      (advertisements.reduce((sum, ad) => sum + (ad.clicks || 0), 0) /
                        advertisements.reduce((sum, ad) => sum + (ad.impressions || 0), 0)) *
                      100
                    ).toFixed(2) + "%"
                  : "0%"}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Aktif Reklamlar</div>
              <div className="stat-big-value">
                {advertisements.filter((ad) => ad.active).length}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* USERS */}
      {activeTab === "users" && (
        <div className="admin-content">
          <h2>👥 Kullanıcılar</h2>
          <div style={{ padding: "40px", textAlign: "center", color: "#999" }}>
            <p>Kullanıcı yönetimi sayfası yakında eklenecek</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
