import React from "react";
import "./BombModel.css";

interface BombModelProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
}

export const BombModel: React.FC<BombModelProps> = ({
  size = "medium",
  animated = true,
}) => {
  return (
    <div className={`bomb-model ${size} ${animated ? "animated" : ""}`}>
      <div className="bomb-emoji">💣</div>
    </div>
  );
};

export default BombModel;
