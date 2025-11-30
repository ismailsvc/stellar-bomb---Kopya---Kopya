import { useState } from "react";
import { maskAddress } from "../utils";
import type { UserProfile } from "../types";
import { WalletSelectionModal } from "./WalletSelectionModal";

interface AccountSwitcherProps {
  currentWallet: string | null;
  savedWallets: string[];
  profiles: Record<string, UserProfile>;
  onSwitchAccount: (wallet: string) => void;
  onAddAccount: () => void;
  onRemoveAccount: (wallet: string) => void;
}

export function AccountSwitcher({
  currentWallet,
  savedWallets,
  profiles,
  onSwitchAccount,
  onAddAccount,
  onRemoveAccount,
}: AccountSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  const currentProfile = currentWallet ? profiles[currentWallet] : null;

  const handleAddAccount = async () => {
    try {
      await onAddAccount();
      setShowWalletModal(false);
      setIsOpen(false);
    } catch (err) {
      console.error("Hesap ekleme hatası:", err);
    }
  };

  const handleSelectWallet = (wallet: string) => {
    onSwitchAccount(wallet);
    setIsOpen(false);
  };

  return (
    <div className="account-switcher">
      {/* Current Account Display */}
      <div
        className="account-current"
        onClick={() => setIsOpen(!isOpen)}
        title={currentWallet || "No account"}
      >
        <div className="account-avatar">
          {currentProfile?.avatar ? currentProfile.avatar : "👨‍💻"}
        </div>
        <span className="account-name">
          {currentProfile?.username || "Guest"}
        </span>
        <span className="account-address">
          {currentWallet ? maskAddress(currentWallet) : "Not connected"}
        </span>
        <span className={`account-toggle ${isOpen ? "open" : ""}`}>▼</span>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="account-dropdown">
          {/* Saved Accounts */}
          {savedWallets.length > 0 && (
            <div className="account-list">
              <div className="account-list-header">📋 Kayıtlı Hesaplar</div>
              {savedWallets.map((wallet) => {
                const profile = profiles[wallet];
                const isActive = wallet === currentWallet;

                return (
                  <div
                    key={wallet}
                    className={`account-item ${isActive ? "active" : ""}`}
                  >
                    <div
                      className="account-item-info"
                      onClick={() => handleSelectWallet(wallet)}
                    >
                      <div className="account-item-avatar">
                        {profile?.avatar ? profile.avatar : "👨‍💻"}
                      </div>
                      <div className="account-item-details">
                        <div className="account-item-name">
                          {profile?.username || "Oyuncu"}
                        </div>
                        <div className="account-item-address">
                          {maskAddress(wallet)}
                        </div>
                      </div>
                      {isActive && <span className="active-badge">✓</span>}
                    </div>

                    {/* Remove Button (show only for non-active accounts) */}
                    {!isActive && (
                      <button
                        className="account-remove-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAccount(wallet);
                        }}
                        title="Hesabı Kaldır"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Divider */}
          {savedWallets.length > 0 && (
            <div className="account-divider" />
          )}

          {/* Add New Account Button */}
          <button
            className="account-add-btn"
            onClick={() => setShowWalletModal(true)}
          >
            ➕ Yeni Hesap Ekle
          </button>
        </div>
      )}

      {/* Overlay - Close dropdown when clicked */}
      {isOpen && (
        <div
          className="account-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Wallet Selection Modal */}
      <WalletSelectionModal
        isOpen={showWalletModal}
        onClose={() => setShowWalletModal(false)}
        onSelect={handleSelectWallet}
        onConnectNew={handleAddAccount}
        savedWallets={savedWallets}
        profiles={profiles}
      />
    </div>
  );
}
