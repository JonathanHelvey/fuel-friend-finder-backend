'use strict';

const chromium = require('chrome-aws-lambda')

let browser = null
let page = null

exports.handler = async (event, context, callback) => {
  console.log('THE START')
  let responseCode = 200;
  let data;

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
   await page.goto("https://www.example.com", { waitUntil: 'networkidle2' })
   await navigationPromise
   
   const footerleft = await page.waitForSelector('body > div > p:nth-child(2)')
   console.log('--->: exports.handler -> footerleft', footerleft)
   const textContent = await (await footerleft.getProperty('textContent')).jsonValue()
   console.log('--->: exports.handler -> textContent', textContent)
   data = { textContent }

   console.log('--->: exports.handler -> data', data)
  }

  catch (err) {
    responseCode = 500;
    console.error('Error getting gas Data', err);
  } 

    console.log("THE END")
    const response = {
      statusCode: responseCode,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      },
      body: JSON.stringify(data, null, 2),
    };
    console.log("RESPONSE", response)
    callback(null, response);
};