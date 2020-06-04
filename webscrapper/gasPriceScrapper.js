
const chromium = require('chrome-aws-lambda')
let browser = null
let page = null
// const $ = require('cheerio');
// const url = 'https://www.gasbuddy.com/gasprices/Kentucky/Walton';

const gasPriceScrapper = async (city, state) => {
  // const url = `https://www.gasbuddy.com/gasprices/${state}/${city}`;
  // const browser = await chormium.puppeteer.launch({ headless: true });
  // const page = await browser.newPage();
  // await page.setViewport({ width: 1920, height: 1001 });
  // await page.goto(url);
  browser = await chromium.puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless
})

  page = await browser.newPage();

  const navigationPromise = page.waitForNavigation()
  await page.goto(`https://www.gasbuddy.com/gasprices/${state}/${city}`, { waitUntil: 'networkidle2' })
  await page.setViewport({ width: 1920, height: 1001 })
  await navigationPromise

  // get gas details
  const gasData = await page.evaluate(() => {
    const gasStations = [];
    // get the gas elements
    const gasElms = document.querySelectorAll('tr.accordion-toggle');
    // get the gas data
    gasElms.forEach((gasElement) => {
      const gasJson = {};
      try {
        gasJson.name = gasElement.querySelector('strong').innerText;
        gasJson.price = gasElement.querySelector('div.gb-price').innerText;
        // gasJson.location = gasElement.innerText; // parse string.
        // if(gasElement.querySelector('strong.price')){
        //     gasJson.price = gasElement.querySelector('strong.price').innerText;
        // }
      } catch (exception) {
        console.log('Error Grabing Data');
      }
      gasStations.push(gasJson);
    });
    return gasStations;
  });
  return gasData
  console.dir(gasData);
};

module.exports = gasPriceScrapper;
