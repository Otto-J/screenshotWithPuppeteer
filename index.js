const Koa = require("koa");
const Router = require("koa-router");
const app = new Koa();
const router = new Router();
const pupp = require("puppeteer");
const device = require("puppeteer/DeviceDescriptors");
const iPhone6 = device["iPhone 6"];
const fs = require("fs");
const path = require("path");

const koaBody = require("koa-body");

async function start(url1) {
    const browser = await pupp.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await screenshot(page, browser, url1);
    await browser.close();
}
async function screenshot(page, browser, url1) {
    await page.emulate(iPhone6);
    await page.goto(url1, {
        waitUntil: "networkidle2"
    });
    const title = await page.title();
    await removeDOM(page);
    await autoScroll(page);
    await page.screenshot({
        path: `./dist/img/a.png`,
        fullPage: true
    });
}
async function removeDOM(page) {
    await page.addStyleTag({
        path: "./src/remove.css"
    });
}
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 200;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;
                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 200);
        });
    });
}
router.post("/img", koaBody(), async function(ctx) {
    var url = ctx.request.body.url;
    await start(url);
    ctx.response.type = "image/png";
    ctx.response.body = fs.readFileSync("./dist/img/a.png");
});
router.get("/", ctx => {
    ctx.response.type = "html";
    ctx.response.body = fs.createReadStream("./index.html");
});
app.use(router.routes());
app.listen(3006);
console.log("port listen 3006...");
