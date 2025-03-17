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
        const myTimetableURL = "https://my.uq.edu.au/node/212/3#3"; // Subject to change.
        let periods = [];
        const charMap = {
          "\u200B": "",
          "\u2013": "-",
          "\u00A0": " ",
        };
        // Clean the text of ambiguous characters.
        const cleanText = (inputText) => {
          return inputText
            .trim()
            .replace(/[\u200B\u2013\u00A0]/g, (match) => charMap[match]);
        };
        // Get the event type based on the description string.
        // A lot of different cases have to be considered as wording changes a lot.
        const getDayType = (description) => {
          description = description.toLowerCase();
          if (
            description.includes("public holiday") ||
            description.includes("show holiday")
          ) {
            return "Public holiday";
          } else if (description.includes("examination")) {
            return "Examination period";
          } else if (
            description.includes("start") ||
            description.includes("first date") || // Cute.
            (description.includes("enrolments") &&
              description.includes("open")) ||
            description.includes("opens") ||
            description.includes("commence") ||
            description.includes("classes resume")
          ) {
            return "Starting date";
          } else if (
            (description.includes("end") &&
              !description.includes("end of sem")) ||
            description.includes("last date") ||
            description.includes("last day") ||
            description.includes("due") ||
            description.includes("last chance") ||
            description.includes("closes")
          ) {
            return "Closing date";
          } else if (description.includes("graduation")) {
            return "Graduation period";
          } else if (description.includes("finalisation of grades")) {
            return "Finalisation of grades";
          } else {
            return null;
          }
        };
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

        if (
          !contentWrapper ||
          !contentWrapper.classList.contains("uq-accordion")
        )
          return [];

        for (let p of contentWrapper.querySelectorAll("h3")) {
          // Iterating over periods.
          let period = {
            name: cleanText(p.textContent),
            months: [],
          };
          for (let m of [
            ...p.parentNode.nextElementSibling.childNodes[0].children,
          ]) {
            // Iterating over months.
            if (m.nodeName === "H4") {
              // Check if month name or list of days.
              let month = { name: cleanText(m.textContent), days: [] };
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
                  // Keep chopping off first character until it's a letter.
                  desc = desc.slice(1);
                }
                desc = cleanText(desc);
                if (
                  link === "" &&
                  desc.toLowerCase().includes("my timetable")
                ) {
                  link = myTimetableURL;
                }
                let day = {
                  date: cleanText(date),
                  description: desc,
                  dayType: getDayType(desc),
                  link: cleanText(link),
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
