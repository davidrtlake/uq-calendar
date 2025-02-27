const mysql = require("mysql2");

const writeToFile = false;

console.log("DB_HOST:", process.env.DB_HOST);
console.log("DB_USER:", process.env.DB_USER);
console.log("DB_PASSWORD:", process.env.DB_PASSWORD);
console.log("DB_NAME:", process.env.DB_NAME);

let scrapedData = require("./data/2025/data.json");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Max connections in pool
  queueLimit: 0,
});

function sendEventsToDB() {
  pool.connect((err) => {
    if (err) return console.error(err.message);
    console.log("Insert events into events table.");
    console.log("Connected to the MySQL server.");
    let eventCols = [
      `end_date`,
      `event_id`,
      `period`,
      `start_date`,
      `title`,
      `url`,
    ];
    // Execute the DELETE query on the events table
    pool.query("DELETE FROM events", (err, result) => {
      if (err) throw err;
      console.log("Events table cleared.");
    });

    let id = 1;
    for (let year of scrapedData) {
      for (let period of year["periods"]) {
        for (let month of period["months"]) {
          for (let day of month["days"]) {
            let sql = `INSERT INTO events (${eventCols.join(
              ", "
            )}) VALUES (?, ?, ?, ?, ?, ?)`;
            let [startDate, endDate] = convertDate(
              day["date"],
              month["name"],
              year["year"]
            );
            let entryData = [
              endDate,
              id++,
              period["name"],
              startDate,
              day["description"],
              day["link"],
            ];
            console.log(`Inserted row ${id - 1}`);
            pool.query(sql, entryData, (err, result) => {
              if (err) throw err;
            });
          }
        }
      }
    }
  });
}

function getEntriesFromDB() {
  pool.query("SELECT * FROM events", (err, result) => {
    if (err) throw err;
    console.log("Requesting data.");
    console.log(result);
  });
}

function sendTagsToDB() {
  pool.connect((err) => {
    if (err) return console.error(err.message);

    console.log("Connected to the MySQL server.");
    let eventCols = [`tag_id`, `title`, `url`],
      count = 0,
      tags = {};

    // First, execute the DELETE query on the events_tags table
    pool.query("DELETE FROM events_tags", (err, result) => {
      if (err) throw err;
      console.log("Events_tags table cleared.");
    });
    // Execute the DELETE query on the tags table
    pool.query("DELETE FROM tags", (err, result) => {
      if (err) throw err;
      console.log("Tags table cleared.");
    });

    for (let entry of scrapedData) {
      for (let tag of entry["Event category(s):"]) {
        tags[tag["tagsText"]] = tag["tagsUrl"];
      }
    }
    for (let tag of Object.keys(tags)) {
      count++;
      let sql = `INSERT INTO tags (${eventCols.join(", ")}) VALUES (?, ?, ?)`;
      let entryData = [count, tag, tags[tag]];
      pool.query(sql, entryData, (err, result) => {
        if (err) throw err;
        console.log(`Inserted rows ${count}/${Object.keys(tags).length}`);
      });
    }
    connectTagsAndEvents();
    pool.end((err) => {
      if (err) return console.error(err.message);
      console.log("Closed the database connection.");
    });
  });
}

function connectTagsAndEvents() {
  pool.connect((err) => {
    if (err) return console.error(err.message);

    console.log("Connecting tags and events tables into events_tags table.");
    console.log("Connected to the MySQL server.");
    // First, execute the DELETE query on the events_tags table
    pool.query("DELETE FROM events_tags", (err, result) => {
      if (err) throw err;
      console.log("Events_tags table cleared.");
    });
    for (let entry of scrapedData) {
      for (let tag of entry["Event category(s):"]) {
        let tagTitle = pool.escape(tag["tagsText"]); // Escape the tag title
        let entryID = pool.escape(entry["id"]);
        let sql = `INSERT INTO events_tags (event_id, tag_id) 
               SELECT e.event_id, t.tag_id 
               FROM events e, tags t 
               WHERE e.event_id = ${entryID} AND t.title = ${tagTitle}`;
        pool.query(sql, (err, result) => {
          if (err) throw err;
          console.log(
            `Inserted rows for ${entryID}/${scrapedData.length} entries.`
          );
        });
      }
    }
    pool.end((err) => {
      if (err) return console.error(err.message);
      console.log("Closed the database connection.");
    });
  });
}

function convertDate(date, month, year) {
  const dateLen = date.length;
  // console.log("");
  // console.log(date, date.length);

  let monthNums = month.replace(/[A-Za-z\s]+/g, "");
  if (monthNums.startsWith("20")) {
    year = monthNums;
  }
  let startMonth = "";
  let endMonth = "";

  for (let l of date) {
    if (startMonth.length < 3) {
      startMonth += l.match(/[A-Za-z]/g) ? l : "";
    } else {
      endMonth += l.match(/[A-Za-z]/g) ? l : "";
    }
  }

  if (endMonth.length === 0) {
    endMonth = startMonth;
  }

  date = date.replace(/[A-Za-z\s]+/g, "").replace(/\u{2013}/gu, "-");
  // console.log(date, date.length);

  let startDate = date.split("-")[0];
  let endDate = date.split("-")[1] || startDate;
  if (startDate.length === 1) {
    startDate = "0".concat(startDate);
  }
  if (endDate.length === 1) {
    endDate = "0".concat(endDate);
  }

  startMonth = convertMonthToNumber(startMonth);
  endMonth = convertMonthToNumber(endMonth);

  // console.log(
  //   startDate,
  //   endDate,
  //   startMonth,
  //   endMonth,
  //   "month",
  //   month,
  //   "year",
  //   year,
  //   "monthNums",
  //   monthNums
  // );

  if (dateLen > 6 && startDate === endDate) {
    throw new Error("Start and end date should be different.");
  } else if (dateLen <= 6 && startDate !== endDate) {
    throw new Error("Start and end date should be the same.");
  }
  if (dateLen > 10 && startMonth === endMonth) {
    throw new Error("Start and end month should be different.");
  }

  startDate = `${year}-${startMonth}-${startDate}`;
  endDate = `${year}-${endMonth}-${endDate}`;
  // console.log(startDate, endDate);

  return [startDate, endDate];
}

function convertMonthToNumber(month) {
  switch (month) {
    case "Jan":
      return "01";
      break;
    case "Feb":
      return "02";
      break;
    case "Mar":
      return "03";
      break;
    case "Apr":
      return "04";
      break;
    case "May":
      return "05";
      break;
    case "Jun":
      return "06";
      break;
    case "Jul":
      return "07";
      break;
    case "Aug":
      return "08";
      break;
    case "Sep":
      return "09";
      break;
    case "Oct":
      return "10";
      break;
    case "Nov":
      return "11";
      break;
    case "Dec":
      return "12";
      break;
    default:
      throw new Error("Invalid month");
      return month;
      break;
  }
}

module.exports = {
  sendEventsToDB,
  getEntriesFromDB,
  sendTagsToDB,
  connectTagsAndEvents,
};
