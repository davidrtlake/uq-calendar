const browserObject = require("./browser");
const scraperController = require("./pageController");
const dataController = require("./dataController");

//Start the browser and create a browser instance
let browserInstance = browserObject.startBrowser();

// Pass the browser instance to the scraper controller
// scraperController(browserInstance);

// dataController.connectTagsAndEvents();
// dataController.sendEventsToDB();
dataController.getEntriesFromDB();
