# 交付驗證紀錄

- 日期：2026-10-25（Asia/Taipei）。
- 建置：`npm run build` 通過；Three.js 與 Tailwind CSS 內嵌，單檔可離線開啟。
- 語法：`node --check src/app.js`、`node --check build.mjs` 通過。
- 瀏覽器：`npm test`，Playwright Chromium，12 組驗證全部通過。
- 尺寸：1440×1000、1280×720、390×844。窄螢幕測試為瀏覽器模擬，非手機實機。
- 驗證範圍：離線啟動、7 單位、良率與進度、建築射線點選、成員分機與郵件連結、拖曳平移、滾輪縮放、全景還原、動畫及暫停、3 封來信、4 種快捷回覆、草稿保留、發信單位定位、完整 Dashboard、兩套資料切換、窄螢幕面板、減少動態偏好。
- 觀測：無 JavaScript 錯誤、無外部 HTTP 請求。
- 截圖：本機 `evidence/01-desktop.png` 至 `11-short-desktop.png`（依內容編號），含 7 處主要互動與各尺寸。
- 原校園專案：未修改，基準 commit 5b7bc36fe154971e016483553b016fae3d155f41。
- 交付：Downloads/3D專案戰情室.html，普通實體檔；與專案 index.html 的 SHA-256 一致。
- SHA-256：`089d60a58901dfd1d99b1eb9470f84aac1736ae129fbc3fdd141c1959113a4a0`。
- 限制：所有資料為範例；未串接後端、即時物流、正式校務或專案系統。郵件驗證涵蓋草稿連結與內容，未實際呼叫使用者郵件軟體或寄信。
