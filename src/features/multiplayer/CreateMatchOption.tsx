/**
 * Create Match UI Component
 * Yeni multiplayer maçı oluşturma
 */

interface CreateMatchProps {
  onCreateMatch: () => Promise<void>;
  isLoading?: boolean;
}

export function CreateMatchOption({ onCreateMatch, isLoading }: CreateMatchProps) {
  return (
    <div className="multiplayer-option">
      <h3>🎯 Yeni Maç Oluştur</h3>
      <p>Bir maç oluştur ve rakibini davet et</p>
      <button
        className="btn-primary"
        title="Yeni Multiplayer Maçı Oluştur"
        onClick={onCreateMatch}
        disabled={isLoading}
      >
        {isLoading ? "⏳ Oluşturuluyor..." : "✨ Maç Oluştur"}
      </button>
    </div>
  );
}
