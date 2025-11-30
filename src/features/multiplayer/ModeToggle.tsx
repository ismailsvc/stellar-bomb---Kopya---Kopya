/**
 * Multiplayer Mode Toggle Component
 * Solo vs Multiplayer modu seçimi
 */

interface MultiplayerModeToggleProps {
  isMultiplayer: boolean;
  onToggle: (isMultiplayer: boolean) => void;
  onPlayClick: () => void;
}

export function MultiplayerModeToggle({
  isMultiplayer,
  onToggle,
  onPlayClick,
}: MultiplayerModeToggleProps) {
  return (
    <div className="multiplayer-mode-toggle">
      <button
        className={`mode-btn ${!isMultiplayer ? "active" : ""}`}
        onClick={() => {
          onPlayClick();
          onToggle(false);
        }}
        title="Solo Oyun Modu"
      >
        👤 Solo Oyun
      </button>
      <button
        className={`mode-btn ${isMultiplayer ? "active" : ""}`}
        onClick={() => {
          onPlayClick();
          onToggle(true);
        }}
        title="Çok Oyunculu 1v1 Modu"
      >
        ⚔️ 1v1 Multiplayer
      </button>
    </div>
  );
}
