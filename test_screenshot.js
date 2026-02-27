import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.setViewport({ width: 1280, height: 800 });
    await page.goto('http://localhost:5173/orlaspujaltefotografia/?demo=true', { waitUntil: 'load' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    await page.screenshot({ path: '/Users/pujaltefotografia/.gemini/antigravity/brain/68f86bd2-359e-4b30-95ee-ad6e5aa023a4/screenshot_demo.png' });
    console.log("Screenshot saved.");

    await browser.close();
})();
