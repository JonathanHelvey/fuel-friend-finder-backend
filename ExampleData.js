'use strict';

const chromium = require('chrome-aws-lambda')

// aws-sdk is always preinstalled in AWS Lambda in all Node.js runtimes
const S3Client = require("aws-sdk/clients/s3");

// create an S3 client
const s3 = new S3Client({ region: 'us-east-1'	 });

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
   
  //  const footerleft = await page.waitForSelector('body > div > p:nth-child(2)')
  //  console.log('--->: exports.handler -> footerleft', footerleft)
  //  const textContent = await (await footerleft.getProperty('textContent')).jsonValue()
  //  console.log('--->: exports.handler -> textContent', textContent)
  //  data = { textContent }
  const data = await page.screenshot()

   console.log('--->: exports.handler -> data', data)
  }

  catch (err) {
    responseCode = 500;
    console.error('Error getting gas Data', err);
  } 

  const result = await s3
    .upload({
      Bucket: 'gas-price-screenshot-files',
      Key: `${Date.now()}.csv`,
      Body: data,
      ContentType: "application/json",
      ACL: "public-read"
    })
    .promise();

    console.log("RESULT", result)
    console.log("THE END")
    const response = {
      statusCode: responseCode,
      headers: {
        'Access-Control-Allow-Origin': '*', // Required for CORS support to work
      },
      body: JSON.stringify(data, null, 2),
    };
    callback(null, response);
};

///////////

'use strict';

const chromeLambda  = require('chrome-aws-lambda')

// aws-sdk is always preinstalled in AWS Lambda in all Node.js runtimes
const S3Client = require("aws-sdk/clients/s3");

// create an S3 client
const s3 = new S3Client({ region: 'us-east-1'	 });

const defaultViewport = {
  width: 1440,
  height: 1080
};

exports.handler = async (event, context, callback) => {
  console.log('THE START')
  let responseCode = 200;
  let data;

  try {
  // launch a headless browser
  const browser = await chromeLambda.puppeteer.launch({
    args: chromeLambda.args,
    executablePath: await chromeLambda.executablePath,
    defaultViewport 
  });
   
   const page = await browser.newPage();
   await page.goto('www.example.com')
   
  //  const footerleft = await page.waitForSelector('body > div > p:nth-child(2)')
  //  console.log('--->: exports.handler -> footerleft', footerleft)
  //  const textContent = await (await footerleft.getProperty('textContent')).jsonValue()
  //  console.log('--->: exports.handler -> textContent', textContent)
  //  data = { textContent }
  //  console.log('--->: exports.handler -> data', data)

  const data = await page.screenshot()
  }

  catch (err) {
    responseCode = 500;
    console.error('Error getting gas Data', err);
  } 

  const result = await s3
    .upload({
      Bucket: 'gas-price-screenshot-files',
      Key: `${Date.now()}.png`,
      Body: JSON.stringify(data),
      ContentType: "image/png",
      ACL: "public-read"
    })
    .promise();

    console.log("RESULT", result)
    console.log("THE END")
  // return the uploaded image url
  return { url: result.Location };
  // return data
};