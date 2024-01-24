const pageScraper = require("./pageScraper");
const fs = require("fs");

async function scrapeAll(browserInstance) {
  let browser;
  try {
    browser = await browserInstance;
    let scrapedData = await pageScraper.scraper(browser);
    await browser.close();

    const fileName = "data_3";

    fs.writeFile(
      fileName + ".json",
      JSON.stringify(scrapedData),
      "utf8",
      function (err) {
        if (err) {
          return console.log(err);
        }
        console.log(
          `The data has been scraped and saved successfully! View it at './${fileName}.json'`
        );
      }
    );
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
