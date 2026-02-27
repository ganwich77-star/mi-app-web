import puppeteer from 'puppeteer';
import fs from 'fs';

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('http://localhost:5175/orlaspujaltefotografia/?demo=true', { waitUntil: 'load' });
    await new Promise(resolve => setTimeout(resolve, 2000));

    const html = await page.content();
    fs.writeFileSync('rendered.html', html);
    console.log("Written to rendered.html");

    await browser.close();
})();
