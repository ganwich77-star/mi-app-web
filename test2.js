import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE ERROR LOG:', msg.text());
        } else {
            console.log('PAGE LOG:', msg.text());
        }
    });
    page.on('pageerror', error => console.log('PAGE EXCEPTION:', error.message));

    await page.goto('http://localhost:5175/orlaspujaltefotografia/?demo=true', { waitUntil: 'load' });

    // Wait for the app to render just in case
    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    console.log("HTML length:", html.length);

    await browser.close();
})();
