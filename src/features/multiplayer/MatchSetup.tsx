/**
 * Match Setup Container Component
 * Multiplayer maç kurulum ekranı
 */

import { CreateMatchOption } from "./CreateMatchOption";
import { JoinMatchOption } from "./JoinMatchOption";
import { MatchWaitingScreen } from "./MatchWaitingScreen";

interface MatchSetupProps {
  matchCode: string | null;
  opponentReady: boolean;
  onCreateMatch: () => Promise<void>;
  onMatchCodeChange: (code: string | null) => void;
  onJoinMatch: () => Promise<void>;
  onCopyCode: () => void;
  onCheckStatus: () => Promise<void>;
  onStartGame: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function MatchSetup({
  matchCode,
  opponentReady,
  onCreateMatch,
  onMatchCodeChange,
  onJoinMatch,
  onCopyCode,
  onCheckStatus,
  onStartGame,
  onCancel,
  isLoading,
}: MatchSetupProps) {
  if (matchCode) {
    return (
      <MatchWaitingScreen
        matchCode={matchCode}
        opponentReady={opponentReady}
        onCopyCode={onCopyCode}
        onCheckStatus={onCheckStatus}
        onStartGame={onStartGame}
        onCancel={onCancel}
      />
    );
  }

  return (
    <div className="multiplayer-setup">
      <div style={{ display: "contents" }}>
        <CreateMatchOption onCreateMatch={onCreateMatch} isLoading={isLoading} />

        <div className="divider">VEYA</div>

        <JoinMatchOption
          matchCode={matchCode}
          onMatchCodeChange={onMatchCodeChange}
          onJoinMatch={onJoinMatch}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
