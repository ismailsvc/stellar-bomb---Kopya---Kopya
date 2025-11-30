import { useState } from "react";
import { maskAddress } from "../utils";
import type { UserProfile } from "../types";

interface WalletSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (wallet: string) => void;
  onConnectNew: () => void;
  savedWallets: string[];
  profiles: Record<string, UserProfile>;
}

export function WalletSelectionModal({
  isOpen,
  onClose,
  onSelect,
  onConnectNew,
  savedWallets,
  profiles,
}: WalletSelectionModalProps) {
  const [isConnecting, setIsConnecting] = useState(false);

  if (!isOpen) return null;

  const handleConnectNew = async () => {
    setIsConnecting(true);
    try {
      await onConnectNew();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content wallet-selection-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💳 Hesap Seç veya Ekle</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Saved Wallets */}
          {savedWallets.length > 0 && (
            <div className="wallet-section">
              <h3 className="wallet-section-title">📋 Kayıtlı Hesaplar</h3>
              <div className="wallet-list">
                {savedWallets.map((wallet) => {
                  const profile = profiles[wallet];
                  return (
                    <button
                      key={wallet}
                      className="wallet-item"
                      onClick={() => {
                        onSelect(wallet);
                        onClose();
                      }}
                    >
                      <span className="wallet-avatar">
                        {profile?.avatar ? profile.avatar : "👨‍💻"}
                      </span>
                      <div className="wallet-item-details">
                        <div className="wallet-name">
                          {profile?.username || "Oyuncu"}
                        </div>
                        <div className="wallet-address">
                          {maskAddress(wallet)}
                        </div>
                      </div>
                      <span className="wallet-arrow">→</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Divider */}
          {savedWallets.length > 0 && (
            <div className="wallet-divider">
              <span>veya</span>
            </div>
          )}

          {/* Add New Wallet */}
          <div className="wallet-section">
            <h3 className="wallet-section-title">➕ Yeni Hesap</h3>
            <p className="wallet-description">
              Freighter cüzdanınızdan başka bir hesapla bağlanmak için aşağıdaki butona tıklayın.
              Freighter'da hesap seçici penceresi açılacak.
            </p>
            <button
              className="btn btn-primary wallet-connect-btn"
              onClick={handleConnectNew}
              disabled={isConnecting}
            >
              {isConnecting ? "⏳ Bağlanıyor..." : "🔗 Freighter'a Bağlan"}
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}
