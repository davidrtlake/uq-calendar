const scraperObject = {
  url: "https://about.uq.edu.au/academic-calendar",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    // Navigate to the selected page
    await page.goto(this.url);
    let scrapedData = [];

    // Wait for the required DOM to be rendered
    await page.waitForSelector("div.uq-accordion");

    // Capture console logs from page.evaluate()
    page.on("console", (msg) => console.log("PAGE LOG:", msg.text()));

    const getYearData = async (year) => {
      return await page.evaluate((targetYear) => {
        let periods = [];
        // Find all h2 elements
        const h2Elements = [...document.querySelectorAll("h2, h3")];

        // Find the h2 that matches the target text
        const targetH2 = h2Elements.find(
          (h2) => h2.textContent.trim() === targetYear
        );
        if (!targetH2) return [];

        let contentWrapper = targetH2.nextElementSibling;
        while (contentWrapper.nodeName !== "DIV")
          contentWrapper = contentWrapper.nextElementSibling;

        // console.log("1", contentWrapper.nodeName);
        // console.log("2", contentWrapper.className);
        // console.log(
        //   [...contentWrapper.classList].forEach((cls) =>
        //     console.log("Class:", cls)
        //   )
        // );

        if (
          !contentWrapper ||
          !contentWrapper.classList.contains("uq-accordion")
        )
          return [];

        // console.log(
        //   [...contentWrapper.querySelectorAll("h3")].forEach((nd) =>
        //     console.log("Period:", nd.nodeName, nd.textContent)
        //   )
        // );

        for (let p of contentWrapper.querySelectorAll("h3")) {
          // Iterating over periods.
          let period = {
            name: p.textContent.trim().replace(/\u{2013}/gu, "-"),
            months: [],
          };
          // console.log("P");
          // console.log(p.nodeName, p.textContent);
          for (let m of [
            ...p.parentNode.nextElementSibling.childNodes[0].children,
          ]) {
            // Iterating over months.
            if (m.nodeName === "H4") {
              // Check if month name or list of days.
              let month = { name: m.textContent.trim(), days: [] };
              period["months"].push(month);
            } else if (m.nodeName === "UL") {
              for (let li of m.children) {
                let [date, desc, link] = ["", "", ""];
                for (let word of li.childNodes) {
                  switch (word.nodeName) {
                    case "STRONG":
                      date = date.concat(word.textContent.trim());
                      break;
                    case "A":
                      link = link.concat(word.href.trim());
                    case "#text":
                      desc = desc.concat(word.textContent.trim());
                      break;
                    default:
                      throw new Error("Unseen element in day found.");
                  }
                }
                if (!date.length || !desc.length) {
                  throw new Error("Date or description missing.");
                }
                desc = desc.normalize("NFC");
                while (desc.length && !desc.charAt(0).match(/[a-z]/i)) {
                  desc = desc.slice(1);
                }
                let day = {
                  date: date.normalize("NFC"),
                  description: desc,
                  link: link.normalize("NFC"),
                };
                period["months"][period["months"].length - 1]["days"].push(day);
              }
            }
          }
          periods.push(period);
        }
        return periods;
      }, year);
    };

    const years = await page.$$eval(
      "#block-uq-standard-theme-content > article > div > div.page__middle.page__middle--contained.grid > div > section > article > div > div > h2, h3",
      (years) => {
        // Filter out elements that do not contain an 'a' tag
        years = years
          .map((el) => el.textContent)
          .filter((el) => el.startsWith("20"));
        return years;
      }
    );

    // console.log(years);

    for (let year of years) {
      scrapedData.push({ year: year, periods: await getYearData(year) });
    }

    await page.close();
    return scrapedData;
  },
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = scraperObject;
