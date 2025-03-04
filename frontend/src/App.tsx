import { useEffect, useState } from "react";
import "./App.css";
import Day from "./components/Day";

// Define a type for your events
interface Event {
  event_id: number;
  title: string;
  period: string;
  sub_period: string;
  start_date: string;
  end_date: string;
  url: string;
}

function App() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetch("/api/events") // Backend URL
      .then((response) => response.json())
      .then((data: Event[]) => setEvents(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);
  // Just need the year (for leap years) and the day it started on
  return (
    <>
      <div>
        <h1>Events</h1>
        <div className="container">
          {events.map((event) => (
            <div key={event.event_id}>
              <Day
                title={event.title}
                url={event.url}
                start_date={new Date(event.start_date)}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default App;
