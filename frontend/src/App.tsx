import { useEffect, useState } from "react";
import "./App.css";
import Year from "./components/Year";
import NestedCheckbox from "./components/NestedCheckbox";

// Define a type for your events
interface Event {
  event_id: number;
  title: string;
  period: string;
  sub_period: string;
  start_date: Date;
  end_date: Date;
  url: string;
}

function App() {
  const [events, setEvents] = useState<Event[]>([]); // State is set of periods to use.
  const [activePeriods, setActivePeriods] = useState<Set<string>>(new Set());
  const [activeYears, setActiveYears] = useState<Set<number>>(new Set());
  const allPeriods: string[] = [
    "Semester 1",
    "Semester 2",
    "Summer Semester (2025-26)",
    "Research quarters",
    "Teaching periods",
    "Summer Semester (2026-27)",
    "Summer Semester (2024-25)",
    "Summer Semester (2023-24)",
  ]; // Maybe replace this with something automatic (state) / just use activePeriods.
  const allYears: number[] = [2025, 2026, 2024, 2023];
  const year: number = 2025;
  let currDay: number = 3;

  function checkHandler(p: string, y: number) {
    console.log(p, y);
    if (!y) {
      const newAP: Set<string> = new Set(activePeriods);
      if (activePeriods.has(p)) {
        newAP.delete(p);
      } else {
        newAP.add(p);
      }
      setActivePeriods(newAP);
    } else {
      const newAY: Set<number> = new Set(activeYears);
      if (activeYears.has(y)) {
        newAY.delete(y);
      } else {
        newAY.add(y);
      }
      setActiveYears(newAY);
    }
  }

  // useEffect(() => {
  //   console.log("Caught update.", activePeriods);
  //   setEvents((prevEvents) =>
  //     prevEvents.filter((e) => activePeriods.has(e.period))
  //   );
  // }, [activePeriods]);

  useEffect(() => {
    // Gets data
    fetch("/api/events") // Backend URL
      .then((response) => response.json())
      .then((data: Event[]) => {
        const newActivePeriods: Set<string> = new Set<string>();
        const newActiveYears: Set<number> = new Set<number>();
        const formattedData = data
          .map((row) => {
            newActivePeriods.add(row.period);
            return {
              ...row,
              start_date: new Date(row.start_date), // Convert Date to ISO string
              end_date: new Date(row.end_date),
            };
          })
          .filter(
            (row) =>
              row.start_date.getFullYear() === year ||
              row.end_date.getFullYear() === year
          )
          .map((row) => {
            newActiveYears.add(row.start_date.getFullYear());
            return {
              ...row,
              start_date:
                row.start_date.getFullYear() === year
                  ? row.start_date
                  : new Date(`Janurary 01, ${year} 00:00:00`),
              end_date:
                row.end_date.getFullYear() === year
                  ? row.end_date
                  : new Date(`December 31, ${year} 00:00:00`),
            };
          });
        console.log("Setting Active Periods");
        setActivePeriods(newActivePeriods);
        console.log("Setting Active Years");
        setActiveYears(newActiveYears);
        console.log("Setting Events");
        setEvents(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []); // This will all go in App.tsx and be passed to year.tsx component.

  return (
    <>
      <div className="body-flex-container">
        <div className="period-selector">
          <NestedCheckbox
            allYears={allYears}
            allPeriods={allPeriods}
            checkHandler={checkHandler}
          />
        </div>
        <div style={{ maxWidth: "1500px" }}>
          <Year
            year={year}
            currDay={currDay}
            events={events.filter(
              (e) =>
                activePeriods.has(e.period) &&
                activeYears.has(e.start_date.getFullYear())
            )}
          />
        </div>
      </div>
    </>
  );
}

export default App;
