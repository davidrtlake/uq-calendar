const pageScraper = require("./pageScraper");
const mysql = require("mysql2");
const fs = require("fs");

const writeToFile = false;
const sendToServer = true;

let scrapedData = require("./data2.json");

let con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

async function scrapeAll(browserInstance) {
  let browser;
  try {
    // browser = await browserInstance;
    // let scrapedData = await pageScraper.scraper(browser);
    // await browser.close();
    sendToServer &&
      con.connect((err) => {
        if (err) return console.error(err.message);

        console.log("Connected to the MySQL server.");
        let sql;
        let eventCols = [
          `contact_email`,
          `contact_name`,
          `contact_phone`,
          `description`,
          `end_date`,
          `org_unit`,
          `org_unit_url`,
          `start_date`,
          `time`,
          `title`,
          `url`,
        ];
        let entryData, startDate, endDate, time;
        for (let entry of scrapedData) {
          sql = `INSERT INTO events (${eventCols.join(
            ", "
          )}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
          [startDate, endDate, time] = convertDateAndTime(
            entry["Date:"],
            entry["Time:"]
          );
          entryData = [
            entry["Email:"],
            entry["Name:"],
            entry["Phone:"],
            entry["Full Description:"],
            endDate,
            entry["Org.Unit:"]["org_unit"],
            entry["Org.Unit:"]["org_unit_url"],
            startDate,
            time,
            entry["title"],
            entry["URL:"],
          ];
          con.query(sql, entryData, (err, result) => {
            if (err) throw err;
            console.log("Number of records inserted: " + result.affectedRows);
          });
        }
        con.end((err) => {
          if (err) return console.error(err.message);
          console.log("Close the database connection.");
        });
      });

    writeToFile &&
      fs.writeFile(
        "data2.json",
        JSON.stringify(scrapedData),
        "utf8",
        function (err) {
          if (err) {
            return console.log(err);
          }
          console.log(
            "The data has been scraped and saved successfully! View it at './data2.json'"
          );
        }
      );
  } catch (err) {
    console.log("Could not resolve the browser instance => ", err);
  }
}

function convertDateAndTime(date, time) {
  let startDate = date.split("-")[0];
  let endDate = date.split("-")[1] || startDate;
  startDate = startDate.split(",")[1].split(" ");
  endDate = endDate.split(",")[1].split(" ");
  startDate = `${startDate[2]}-${convertMonthToNumber(startDate[1])}-${
    startDate[0]
  }`;
  endDate = `${endDate[2]}-${convertMonthToNumber(endDate[1])}-${endDate[0]}`;
  if (time.toLowerCase() === "all day") {
    time = "00:00";
  } else {
    time = time.slice(0, -3);
    time = time.length < 5 ? "0" + time : time;
  }
  return [startDate, endDate, time];
}

function convertMonthToNumber(month) {
  switch (month) {
    case "January":
      return "01";
      break;
    case "February":
      return "02";
      break;
    case "March":
      return "03";
      break;
    case "April":
      return "04";
      break;
    case "May":
      return "05";
      break;
    case "June":
      return "06";
      break;
    case "July":
      return "07";
      break;
    case "August":
      return "08";
      break;
    case "September":
      return "09";
      break;
    case "October":
      return "10";
      break;
    case "November":
      return "11";
      break;
    case "December":
      return "12";
      break;
    default:
      return month;
      break;
  }
}

module.exports = (browserInstance) => scrapeAll(browserInstance);
