/**
 * Join Match UI Component
 * Mevcut multiplayer maçına katılma
 */

interface JoinMatchProps {
  matchCode: string | null;
  onMatchCodeChange: (code: string | null) => void;
  onJoinMatch: () => Promise<void>;
  isLoading?: boolean;
}

export function JoinMatchOption({
  matchCode,
  onMatchCodeChange,
  onJoinMatch,
  isLoading,
}: JoinMatchProps) {
  return (
    <div className="multiplayer-option">
      <h3>🔗 Maça Katıl</h3>
      <p>Rakibinin Match Code'unu kullan</p>
      <input
        type="text"
        placeholder="Match Code (örn: ABC123XYZ)"
        value={matchCode || ""}
        onChange={(e) => onMatchCodeChange(e.target.value || null)}
        className="match-code-input"
        maxLength={10}
      />
      <button
        className="btn-primary"
        onClick={onJoinMatch}
        disabled={isLoading || !matchCode}
      >
        {isLoading ? "⏳ Katılınıyor..." : "🎮 Maça Katıl"}
      </button>
    </div>
  );
}
