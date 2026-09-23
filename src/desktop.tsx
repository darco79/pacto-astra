import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { GameApp } from "@/components/game/GameApp";
import "./styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("No está el contenedor del juego.");

createRoot(root).render(
  <StrictMode>
    <GameApp />
  </StrictMode>,
);
