const express = require("express");
const cors = require("cors");
const dataController = require("./dataController");

const app = express();

// Enable CORS so frontend can access backend
app.use(cors());
app.use(express.json()); // Allow JSON requests

app.get("/api/events", async (req, res) => {
  try {
    const events = await dataController.getEntriesFromDB(); // Await the database query
    res.json(events); // Send the data as JSON
  } catch (error) {
    console.error("❌ Error fetching events:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
