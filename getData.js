'use strict';
// TODO: Add Linter.
const chromium = require('chrome-aws-lambda');

let browser = null;
let page = null;

exports.handler = async (event, context, callback) => {
  let { state } =  event.queryStringParameters;
  let { city } =  event.queryStringParameters;
  let data;
  let responseCode = 200;

  const url = `https://www.gasbuddy.com/gasprices/${state}/${city}`;
  const url2 = `https://www.gasbuddy.com/gasprices/${state}`;

  try {
    browser = await chromium.puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless
  })

    page = await browser.newPage()
    const navigationPromise = page.waitForNavigation()
    await page.setViewport({ width: 1920, height: 1001 })

    if(!city) {
      await page.goto(url2, { waitUntil: 'networkidle2' })
    } else {
      await page.goto(url, { waitUntil: 'networkidle2' })
    }
    
    await navigationPromise

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
        // TODO: Is there a better to parse String?
        gasJson.address = gasElement.innerText.replace(/\s+/g, ' ').trim().replace("reviews)", "").replace("(", "").slice(14, -24); 
        gasJson.city = gasElement.querySelector('div.visible-xs').innerText
        if(gasElement.querySelector('strong.price')){
            gasJson.price = gasElement.querySelector('strong.price').innerText;
        }
      } catch (exception) {
        console.log('Error Grabing Data');
      }
      gasStations.push(gasJson);
    });
    return gasStations;
  });  

  data = gasData

} catch (err) {
    responseCode = 500;
    console.error('Error grabbing gas data', err);
} finally {
    await page.close()
    await browser.close()
}

    console.log("THE END")
    const response = {
      statusCode: responseCode,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      },
      body: JSON.stringify({data}, null, 2),
    };
    console.log("RESPONSE", response)
    callback(null, response);
};