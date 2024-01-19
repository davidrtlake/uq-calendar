const scraperObject = {
  url: "https://www.uq.edu.au/events/calendar_view.php?category_id=16&year=2024&month=&day=01",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    // Wait for the required DOM to be rendered
    await page.waitForSelector("div#show-events");
    // Get the link to all the required books
    let urls = await page.$$eval("ul.events-lists > li", (links) => {
      // Filter out elements that do not contain an 'a' tag
      links = links
        .map((el) => el.querySelector("a"))
        .filter((el) => el !== null)
        .map((el) => el.href);
      return links;
    });
    console.log(urls);

    // Loop through each of those links, open a new page instance and get the relevant data from them
    let pagePromise = (link) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);
        dataObj["bookTitle"] = await newPage.$eval(
          ".product_main > h1",
          (text) => text.textContent
        );
        dataObj["bookPrice"] = await newPage.$eval(
          ".price_color",
          (text) => text.textContent
        );
        dataObj["noAvailable"] = await newPage.$eval(
          ".instock.availability",
          (text) => {
            // Strip new line and tab spaces
            text = text.textContent.replace(/(\r\n\t|\n|\r|\t)/gm, "");
            // Get the number of stock available
            let regexp = /^.*\((.*)\).*$/i;
            let stockAvailable = regexp.exec(text)[1].split(" ")[0];
            return stockAvailable;
          }
        );
        dataObj["imageUrl"] = await newPage.$eval(
          "#product_gallery img",
          (img) => img.src
        );
        dataObj["bookDescription"] = await newPage.$eval(
          "#product_description",
          (div) => div.nextSibling.nextSibling.textContent
        );
        dataObj["upc"] = await newPage.$eval(
          ".table.table-striped > tbody > tr > td",
          (table) => table.textContent
        );
        resolve(dataObj);
        await newPage.close();
      });

    for (link in urls) {
      let currentPageData = await pagePromise(urls[link]);
      // scrapedData.push(currentPageData);
      console.log(currentPageData);
    }
  },
};

module.exports = scraperObject;
