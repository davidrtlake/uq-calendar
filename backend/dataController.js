const mysql = require("mysql2");

const writeToFile = false;

let scrapedData = require("./data_3.json");

let con = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

function sendEventsToDB() {
  con.connect((err) => {
    if (err) return console.error(err.message);
    console.log("Insert events into events table.");
    console.log("Connected to the MySQL server.");
    let eventCols = [
      `event_id`,
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
    // First, execute the DELETE query on the events_tags table
    con.query("DELETE FROM events_tags", (err, result) => {
      if (err) throw err;
      console.log("Events_tags table cleared.");
    });
    // Execute the DELETE query on the events table
    con.query("DELETE FROM events", (err, result) => {
      if (err) throw err;
      console.log("Events table cleared.");
    });

    for (let entry of scrapedData) {
      let sql = `INSERT INTO events (${eventCols.join(
        ", "
      )}) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      let [startDate, endDate, time] = convertDateAndTime(
        entry["Date:"],
        entry["Time:"]
      );
      let entryData = [
        entry["id"],
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
        console.log(`Inserted rows ${entry["id"]}/${scrapedData.length}`);
      });
    }
    connectTagsAndEvents();
    con.end((err) => {
      if (err) return console.error(err.message);
      console.log("Closed the database connection.");
    });
  });
}

function sendTagsToDB() {
  con.connect((err) => {
    if (err) return console.error(err.message);

    console.log("Connected to the MySQL server.");
    let eventCols = [`tag_id`, `title`, `url`],
      count = 0,
      tags = {};

    // First, execute the DELETE query on the events_tags table
    con.query("DELETE FROM events_tags", (err, result) => {
      if (err) throw err;
      console.log("Events_tags table cleared.");
    });
    // Execute the DELETE query on the tags table
    con.query("DELETE FROM tags", (err, result) => {
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
      con.query(sql, entryData, (err, result) => {
        if (err) throw err;
        console.log(`Inserted rows ${count}/${Object.keys(tags).length}`);
      });
    }
    connectTagsAndEvents();
    con.end((err) => {
      if (err) return console.error(err.message);
      console.log("Closed the database connection.");
    });
  });
}

function connectTagsAndEvents() {
  con.connect((err) => {
    if (err) return console.error(err.message);

    console.log("Connecting tags and events tables into events_tags table.");
    console.log("Connected to the MySQL server.");
    // First, execute the DELETE query on the events_tags table
    con.query("DELETE FROM events_tags", (err, result) => {
      if (err) throw err;
      console.log("Events_tags table cleared.");
    });
    for (let entry of scrapedData) {
      for (let tag of entry["Event category(s):"]) {
        let tagTitle = con.escape(tag["tagsText"]); // Escape the tag title
        let entryID = con.escape(entry["id"]);
        let sql = `INSERT INTO events_tags (event_id, tag_id) 
               SELECT e.event_id, t.tag_id 
               FROM events e, tags t 
               WHERE e.event_id = ${entryID} AND t.title = ${tagTitle}`;
        con.query(sql, (err, result) => {
          if (err) throw err;
          console.log(
            `Inserted rows for ${entryID}/${scrapedData.length} entries.`
          );
        });
      }
    }
    con.end((err) => {
      if (err) return console.error(err.message);
      console.log("Closed the database connection.");
    });
  });
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

module.exports = { sendEventsToDB, sendTagsToDB, connectTagsAndEvents };
