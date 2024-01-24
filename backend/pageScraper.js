const scraperObject = {
  url: "https://www.uq.edu.au/events/calendar_view.php?category_id=16&year=2024&month=&day=01",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    let scrapedData = [];
    // Wait for the required DOM to be rendered
    await page.waitForSelector("div#show-events");
    // Get the link to all the calender events
    let urls = await page.$$eval("ul.events-lists > li", (links) => {
      // Filter out elements that do not contain an 'a' tag
      links = links
        .map((el) => el.querySelector("a"))
        .filter((el) => el !== null)
        .map((el) => el.href);
      return links;
    });

    // Loop through each of those links, open a new page instance and get the relevant data from them
    let pagePromise = (link, count) =>
      new Promise(async (resolve, reject) => {
        let dataObj = {};
        let newPage = await browser.newPage();
        await newPage.goto(link);
        dataObj["id"] = parseInt(count) + 1;
        dataObj["title"] = await newPage.$eval(
          "#page-head > h1",
          (text) => text.textContent
        );
        // Get the description titles
        let descriptionTitles = await newPage.$$eval(
          ".event-details > dl",
          (text) => {
            const texts = [];
            for (const item of text) {
              for (const j of item.querySelectorAll("dt").values()) {
                texts.push(
                  j.textContent.replace(
                    /(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm,
                    ""
                  )
                );
              }
            }
            return texts;
          }
        );
        // Get the corresponding descriptions
        let descriptions = await newPage.$$eval(
          ".event-details > dl",
          (text) => {
            const texts = [];
            for (const item of text) {
              for (const j of item.querySelectorAll("dd").values()) {
                if (j.firstChild.nodeName === "A") {
                  // For email link
                  texts.push(j.querySelector("a").href);
                } else if (j.className === "tags") {
                  // For the event categories
                  let tags = [];
                  for (const listItem of j.querySelectorAll("li")) {
                    tags.push({
                      tagsUrl: listItem.querySelector("a").href,
                      tagsText: listItem.textContent.replace(
                        /(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm,
                        ""
                      ),
                    });
                  }
                  texts.push(tags);
                } else if (
                  // For the contact email
                  j.querySelector("a") !== null &&
                  j.firstChild.nodeName === "#text"
                ) {
                  texts.push({
                    org_unit: j.textContent.replace(
                      /(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm,
                      ""
                    ),
                    org_unit_url: j.querySelector("a").href,
                  });
                } else {
                  // For everything else
                  texts.push(
                    j.textContent.replace(
                      /(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm,
                      ""
                    )
                  );
                }
              }
            }
            return texts;
          }
        );
        // console.log(descriptions);
        if (descriptionTitles.length === descriptions.length) {
          for (let i = 0; i < descriptionTitles.length; i++) {
            dataObj[descriptionTitles[i]] = descriptions[i];
          }
        } else {
          console.log("Titles and desciptions are not the same length!");
        }
        resolve(dataObj);
        await newPage.close();
      });

    for (link in urls) {
      console.log(`Navigating to ${urls[link]}...`);
      let currentPageData = await pagePromise(urls[link], link);
      sleep(2000);
      scrapedData.push(currentPageData);
      // break;
    }
    await page.close();
    return scrapedData;
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = scraperObject;
