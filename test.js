import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));

    await page.goto('http://localhost:5173/orlaspujaltefotografia/?view=master', { waitUntil: 'load' });

    const html = await page.content();
    console.log("HTML length:", html.length);
    if (html.includes('MasterPanel') || html.includes('Centro de Control')) {
        console.log("MasterPanel is in the DOM!");
    } else {
        console.log("NOT FOUND IN DOM!");
    }

    await browser.close();
})();
