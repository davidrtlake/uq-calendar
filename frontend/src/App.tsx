import { useEffect, useState } from "react";
import "./App.css";

// Define a type for your events
interface Event {
  event_id: number;
  title: string;
  period: string;
  start_date: object;
  end_date: object;
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

  return (
    <>
      <div>
        <h1>Events</h1>
        <ul>
          {events.map((event) => (
            <li key={event.event_id}>{event.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default App;
