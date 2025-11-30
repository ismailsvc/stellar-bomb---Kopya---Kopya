/**
 * Match Waiting UI Component
 * Rakip bekleme ekranı ve maç kodu gösterimi
 */

interface MatchWaitingProps {
  matchCode: string;
  opponentReady: boolean;
  onCopyCode: () => void;
  onCheckStatus: () => Promise<void>;
  onStartGame: () => void;
  onCancel: () => void;
  isCheckingStatus?: boolean;
}

export function MatchWaitingScreen({
  matchCode,
  opponentReady,
  onCopyCode,
  onCheckStatus,
  onStartGame,
  onCancel,
  isCheckingStatus,
}: MatchWaitingProps) {
  return (
    <div className="match-waiting">
      <h3>⏳ Rakip Bekleniyor...</h3>
      <div className="match-code-display">{matchCode}</div>
      <p>Bu kodu rakibinle paylaş:</p>

      <button className="btn-secondary" title="Maç Kodunu Kopyala" onClick={onCopyCode}>
        📋 Kodu Kopyala
      </button>

      <button
        className="btn-secondary"
        title="Rakip Durumunu Kontrol Et"
        onClick={onCheckStatus}
        disabled={isCheckingStatus}
        style={{ marginTop: "12px" }}
      >
        {isCheckingStatus ? "🔄 Kontrol Ediliyor..." : "🔄 Durumu Kontrol Et"}
      </button>

      {opponentReady ? (
        <div className="opponent-joined">
          <div style={{ color: "#00ff88", fontWeight: "bold", marginTop: "16px" }}>
            ✓ Rakip bağlandı!
          </div>
          <button
            className="btn-main"
            title="Oyunu Başlat"
            onClick={onStartGame}
            style={{ marginTop: "16px" }}
          >
            🎮 Oyunu Başlat
          </button>
        </div>
      ) : (
        <div className="waiting-spinner"></div>
      )}

      <button
        className="btn-cancel"
        title="Maçı İptal Et"
        onClick={onCancel}
        style={{ marginTop: "16px" }}
      >
        ✕ İptal
      </button>
    </div>
  );
}
