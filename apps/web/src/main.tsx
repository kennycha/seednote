import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./app.tsx";
import { registerSW } from "virtual:pwa-register";

// PWA 서비스 워커 등록
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm("새로운 업데이트가 있습니다. 새로고침하시겠습니까?")) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log("오프라인에서 사용할 수 있습니다.");
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
