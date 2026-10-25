# 專案小宇宙｜3D 專案戰情室

以竹光國中 3D 校園專案的程序化模型、材質快取、柔和光影與射線點選方式為設計基礎，另建的等距視角專案管理原型。三個分區、七個協作單位，把進度、問題與資源放進同一座微縮城市。

## 開啟

直接以 Chrome、Edge 或 Safari 開啟 `index.html`，不需要伺服器、CDN 或網路。Three.js 與編譯後的 Tailwind CSS 已內嵌在同一檔案；所有 3D 模型以程式幾何體生成，沒有外部圖片、字型或模型。

## 功能與操作

- 正交等距相機：滑鼠左鍵拖曳平移、滾輪縮放；觸控拖曳與雙指縮放。工具列可縮放、回全景、暫停動畫；系統偏好減少動態時預設暫停。地圖取得焦點後可用方向鍵平移、+/− 縮放、Home 回全景。
- 點建築、機台或浮動標籤查看窗口、進度、良率、卡點、下一步、成員。也能從底部「協作單位」以鍵盤選取，無須操作 3D。
- 成員展開分機與郵件聯絡。所有人員、分機與 `example.com` 信箱皆為虛構。
- 來信有 4 種快捷回覆，自動填入收件人與草稿；可定位發信單位，地圖以綠圈高亮。草稿在本次開啟期間保留，重新載入清除。
- 「開啟郵件草稿」使用系統 `mailto:`，需設定預設郵件軟體；此頁不會實際寄出郵件。
- Dashboard：健康度、優先處理三件事、階段時間軸、交付狀態矩陣、缺料與在途表。
- 內建製造及校園兩套資料，切換時同步更新地圖、警示燈、HUD、來信及報告。
- 視覺動態為示意，車船位置不代表真實運輸追蹤。沒有登入、後端或即時資料串接。
- 整體進度與通過率取七單位的算術平均；健康度 = 平均進度 × 60% + 平均通過率 × 40%。優先事項依卡關、需協作、順利推進排序，同狀態以進度低者優先。

## 開發與驗證

```sh
npm ci
npm run build
npm test
```

建置需求：Node.js 22、npm。驗證需求：uv 與 Playwright 的 Chromium（若未安裝，執行 `uv run --with playwright python -m playwright install chromium`）。

- `src/shell.html`：介面結構。
- `src/styles.css`：Tailwind 輸入與介面樣式。
- `src/app.js`：場景、範例資料與互動。
- `build.mjs`：編譯、打包並內嵌成單一 `index.html`。
- `tests/smoke.py`：離線 file://、桌面與窄螢幕瀏覽器操作驗證。
- `evidence/`：本機測試截圖及摘要，不納入版控。

## 與原校園專案的關係

參考專案：`zgjh-3d-campus`，參考基準 commit `5b7bc36fe154971e016483553b016fae3d155f41`。採用其 `src/scene/building.js` 方塊建模、材質快取、陰影及 `src/main.js` 射線點選設計，針對戰情室重新實作。此專案不是原校園地圖的複製品，沒有帶入校園真實地理配置、個人資料或任何憑證，原專案未修改。

## 技術與致謝

- Three.js 0.186.1，MIT 授權；授權內容見 `THIRD_PARTY_NOTICES.md`。
- Tailwind CSS 4.1.18，MIT 授權；採 CLI 編譯後內嵌。
- 使用正交相機與 OrbitControls 平移縮放；[Three.js 官方文件](https://threejs.org/docs/)。
- [Tailwind CSS CLI 官方文件](https://tailwindcss.com/docs/installation/tailwind-cli)。
