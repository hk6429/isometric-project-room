"""Exercise the delivered file, including offline rendering and real pointer events."""
from pathlib import Path
import json
from urllib.parse import unquote
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'evidence'
OUT.mkdir(exist_ok=True)
checks = []

def passed(name):
    checks.append(name)
    print('PASS:', name, flush=True)

def center(locator):
    r = locator.bounding_box()
    return r['x'] + r['width']/2, r['y'] + r['height']/2

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={'width':1440, 'height':1000}, device_scale_factor=1, offline=True)
    page = context.new_page()
    errors, external = [], []
    page.on('pageerror', lambda e: errors.append(str(e)))
    page.on('request', lambda r: external.append(r.url) if r.url.startswith(('https:', 'http:')) else None)
    page.goto((ROOT / 'index.html').as_uri())
    page.wait_for_load_state('networkidle')
    expect(page.locator('#world')).to_have_attribute('data-ready', 'true')
    expect(page.locator('#overallProgress')).to_have_text('76%')
    expect(page.locator('#overallYield')).to_have_text('97.0%')
    assert page.locator('.map-label').count() == 7
    assert not external
    passed('file:// 離線啟動、7 個單位、進度與良率正確，無外部請求')
    page.screenshot(path=str(OUT / '01-desktop.png'))
    # Click the actual 3D building below its projected HTML label.
    label = page.locator('.map-label[data-unit="rd"]')
    r = label.bounding_box()
    page.mouse.click(r['x']+r['width']/2, r['y']+r['height']+36)
    expect(page.locator('#drawer')).to_be_visible()
    expect(page.locator('#drawerTitle')).to_have_text('研發設計中心')
    passed('射線點選實體 3D 建築可開啟正確詳情')
    page.locator('[data-member]').first.click()
    expect(page.locator('#contactDetail')).to_contain_text('分機：301')
    assert page.locator('#contactDetail a').get_attribute('href').startswith('mailto:rd@example.com?subject=')
    page.screenshot(path=str(OUT / '02-unit-detail.png'))
    passed('窗口、進度、卡點、下一步、成員分機與 mailto 聯絡')
    page.locator('#closeDrawer').click()
    page.locator('#homeButton').click()
    before = center(page.locator('.map-label[data-unit="rd"]'))
    rect = page.locator('#world').bounding_box()
    x,y = rect['x']+rect['width']*.55, rect['y']+rect['height']*.85
    page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+65,y+35,steps=8);page.mouse.up()
    page.wait_for_timeout(120)
    after = center(page.locator('.map-label[data-unit="rd"]'))
    assert abs(after[0]-before[0]) > 30 and not page.locator('#drawer').is_visible()
    page.mouse.wheel(0,-300)
    page.wait_for_timeout(150)
    zoomed = center(page.locator('.map-label[data-unit="rd"]'))
    assert abs(zoomed[0]-after[0])+abs(zoomed[1]-after[1]) > 3
    page.locator('#resetView').click()
    page.wait_for_timeout(80)
    reset = center(page.locator('.map-label[data-unit="rd"]'))
    assert abs(reset[0]-before[0])+abs(reset[1]-before[1]) < 2
    passed('拖曳平移、滾輪縮放、回全景，拖曳不誤觸詳情')
    moving1 = page.locator('#world').screenshot()
    page.wait_for_timeout(180)
    moving2 = page.locator('#world').screenshot()
    assert moving1 != moving2
    page.locator('#pauseMotion').click()
    page.wait_for_timeout(100)
    paused1 = page.locator('#world').screenshot()
    page.wait_for_timeout(160)
    paused2 = page.locator('#world').screenshot()
    assert paused1 == paused2
    page.locator('#pauseMotion').click()
    passed('車船與資訊流持續動畫，暫停後畫面保持不動')
    page.locator('#notifications').click()
    expect(page.locator('#mailDialog')).to_be_visible()
    assert page.locator('.mail-item').count() == 3
    assert page.locator('[data-reply]').count() == 4
    bodies = []
    for i in range(4):
        page.locator(f'[data-reply="{i}"]').click()
        expect(page.locator('#replyTo')).to_have_value('supply@example.com')
        body = page.locator('#replyDraft').input_value()
        assert '周專員您好' in body and len(body) > 50
        bodies.append(body)
    assert len(set(bodies)) == 4
    page.locator('#replyDraft').fill('手動補充：下午確認，先保留這份草稿。')
    page.locator('[data-mail="1"]').click()
    expect(page.locator('#replyDraft')).to_have_value('')
    page.locator('[data-mail="0"]').click()
    expect(page.locator('#replyDraft')).to_have_value('手動補充：下午確認，先保留這份草稿。')
    page.evaluate("""() => { const originalClick=HTMLAnchorElement.prototype.click; HTMLAnchorElement.prototype.click=function(){if(this.href.startsWith('mailto:'))window.capturedMailto=this.href;else originalClick.call(this);}; }""")
    page.locator('#openEmail').click()
    href = unquote(page.evaluate('window.capturedMailto'))
    assert 'supply@example.com' in href and '手動補充：下午確認' in href and 'subject=Re:' in href
    page.screenshot(path=str(OUT / '03-mail.png'))
    passed('3 封來信、4 種快捷草稿、收件人、手動修改保留及郵件草稿內容')
    page.locator('#locateSender').click()
    expect(page.locator('#mailDialog')).not_to_be_visible()
    expect(page.locator('.map-label[data-unit="supply"]')).to_have_class('map-label selected')
    page.wait_for_timeout(100)
    page.screenshot(path=str(OUT / '04-sender-location.png'))
    passed('來信定位會關閉 Modal，將發信單位移到中央並高亮')
    page.locator('#dashboardButton').click()
    expect(page.locator('.health-score')).to_have_text('84 / 100')
    assert page.locator('.urgent-row').count() == 3
    assert page.locator('.phase').count() == 4
    tables = page.locator('#dashboardContent table')
    assert tables.nth(0).locator('tbody tr').count() == 7
    assert tables.nth(1).locator('tbody tr').count() == 3
    page.screenshot(path=str(OUT / '05-dashboard.png'))
    tables.nth(1).scroll_into_view_if_needed()
    page.screenshot(path=str(OUT / '06-resource-tracking.png'))
    page.locator('[data-report-unit="ops2"]').first.click()
    expect(page.locator('#dashboard')).not_to_be_visible()
    expect(page.locator('#drawerTitle')).to_have_text('02 精密加工')
    passed('健康度公式、急件 3 件、時間軸 4 段、7 列矩陣、3 列物料與報告跳轉')
    page.locator('#closeDrawer').click()
    page.locator('#switchData').click()
    expect(page.locator('#projectName')).to_have_text('竹光・智慧校園計畫')
    expect(page.locator('#overallProgress')).to_have_text('79%')
    expect(page.locator('#overallYield')).to_have_text('96.4%')
    expect(page.locator('#blockerCount')).to_have_text('1 件')
    assert page.locator('.map-label[data-state="blocked"]').count() == 1
    page.locator('#mailButton').click()
    expect(page.locator('#mailBody')).to_contain_text('試教網路出現死角')
    page.locator('[data-reply="0"]').click()
    expect(page.locator('#replyTo')).to_have_value('quality@example.com')
    page.keyboard.press('Escape')
    page.locator('#dashboardButton').click()
    expect(page.locator('#dashboardTitle')).to_have_text('竹光・智慧校園計畫')
    expect(page.locator('.health-score')).to_have_text('86 / 100')
    expect(page.locator('#dashboardContent')).to_contain_text('平板充電車')
    page.keyboard.press('Escape')
    page.locator('#unitsButton').click()
    expect(page.locator('#unitsDialog')).to_be_visible()
    assert page.locator('.unit-item').count() == 7
    page.locator('.unit-item').first.click()
    expect(page.locator('#drawerTitle')).to_have_text('01 數位共備教室')
    page.locator('#closeDrawer').click()
    page.locator('#homeButton').click()
    page.screenshot(path=str(OUT / '07-campus-scenario.png'))
    passed('校園數據切換同步 HUD、標籤、警示、來信、Dashboard 及協作單位')
    page.set_viewport_size({'width':1280,'height':720})
    page.wait_for_timeout(100)
    focus=page.locator('.focus-card').bounding_box(); footer=page.locator('.bottom-bar').bounding_box()
    assert focus['y']+focus['height'] <= footer['y']
    page.screenshot(path=str(OUT / '11-short-desktop.png'))
    passed('1280×720 短螢幕側欄不被底部工具列遮擋')
    # Narrow viewport and reduced motion, using the identical standalone artifact.
    mobile = browser.new_context(viewport={'width':390,'height':844}, is_mobile=True, has_touch=True, offline=True, reduced_motion='reduce')
    mp = mobile.new_page()
    mp.on('pageerror', lambda e: errors.append(str(e)))
    mp.goto((ROOT / 'index.html').as_uri());mp.wait_for_load_state('networkidle')
    expect(mp.locator('#world')).to_have_attribute('data-ready','true')
    expect(mp.locator('#pauseMotion')).to_have_attribute('aria-pressed','true')
    assert mp.evaluate('document.documentElement.scrollWidth <= innerWidth')
    hud = mp.locator('.hud').bounding_box(); vp = mp.locator('#viewport').bounding_box()
    assert hud['y']+hud['height'] <= vp['y']+2
    mp.screenshot(path=str(OUT / '08-mobile.png'))
    for button in ['unitsButton','mailButton','dashboardButton']:
        mp.locator('#'+button).click()
        active = mp.locator('dialog[open]')
        expect(active).to_be_visible()
        r=active.bounding_box()
        assert r['x']>=0 and r['x']+r['width']<=391
        if button=='mailButton':
            mp.locator('[data-reply="0"]').click()
            expect(mp.locator('#replyTo')).to_have_value('supply@example.com')
            mp.screenshot(path=str(OUT / '09-mobile-mail.png'))
        if button=='dashboardButton':
            mp.screenshot(path=str(OUT / '10-mobile-dashboard.png'))
        mp.keyboard.press('Escape')
    passed('390×844 窄螢幕無橫向溢出，三面板可開關、快捷回覆與減少動態偏好')
    assert not errors, errors
    assert not external, external
    passed('全程無 JavaScript 錯誤、無外部網路請求')
    (OUT/'results.json').write_text(json.dumps({'checks':checks,'count':len(checks),'errors':errors,'external_requests':external,'artifact_bytes':(ROOT/'index.html').stat().st_size},ensure_ascii=False,indent=2))
    browser.close()
print(f'{len(checks)} 組驗證通過',flush=True)
