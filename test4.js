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

    await page.goto('http://localhost:5173/orlaspujaltefotografia/?demo=true', { waitUntil: 'load' });

    await new Promise(resolve => setTimeout(resolve, 3000));

    const html = await page.content();
    console.log("HTML length:", html.length);
    if (html.includes('Pack Digital Combo') || html.includes('Pack VIP Graduation')) {
        console.log("PACKS RENDERED");
    } else {
        console.log("PACKS NOT RENDERED", html.indexOf("Pack Digital"));
    }

    await browser.close();
})();
