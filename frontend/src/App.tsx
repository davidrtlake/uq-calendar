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

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

function App() {
  const [events, setEvents] = useState<Event[]>([]); // State is set of periods to use.
  const [activePeriods, setActivePeriods] = useState<Set<string>>(new Set());
  const [activeYears, setActiveYears] = useState<Set<number>>(new Set());
  const [activeYearPeriods, setActiveYearPeriods] = useState<
    Map<number, Set<string>>
  >(new Map());
  const allYears: number[] = [2025, 2026, 2024, 2023];
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
  const [checkedState, setCheckedState] = useState<Map<number, CheckedYear>>(
    () => {
      const checkboxLayout = new Map<number, CheckedYear>();
      let newChildPeriods: Map<string, boolean>;
      for (let y of allYears) {
        newChildPeriods = new Map<string, boolean>();
        for (let p of allPeriods) {
          newChildPeriods.set(p, true);
        }
        checkboxLayout.set(y, {
          checked: true,
          childPeriods: new Map(newChildPeriods),
        });
      }
      return checkboxLayout;
    }
  );
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

  function checkBoxHandler(p: string, y: number) {
    // Need to bundle it all into a Map of sets in App.tsx
    const newCS = new Map<number, CheckedYear>(checkedState);
    if (p.length === 0) {
      // If year checked/unchecked, then also toggle children.
      // Clone the children.
      const childPeriodsCopy = new Map<string, boolean>(
        newCS.get(y)?.childPeriods
      );
      // Set all the children to parent.
      childPeriodsCopy.forEach((value, key) => {
        console.log(key, !newCS.get(y)?.checked);
        childPeriodsCopy.set(key, !newCS.get(y)?.checked);
      });
      newCS.set(y, {
        checked: !newCS.get(y)?.checked,
        childPeriods: childPeriodsCopy,
      });
    } else {
      // If a child is checked/unchecked.
      // Toggle the child state.
      newCS.get(y)?.childPeriods?.set(p, !newCS.get(y)?.childPeriods?.get(p));

      // Check if all children are ticked or all unticked now.
      const target: number = newCS.get(y)?.childPeriods?.size ?? 0;
      let sum: number = 0;
      newCS.get(y)?.childPeriods?.forEach((value) => {
        value && sum++;
      });
      if (sum === 0 || !newCS.get(y)?.childPeriods?.get(p)) {
        newCS.set(y, {
          checked: false,
          childPeriods: newCS.get(y)?.childPeriods,
        });
      } else if (sum === target) {
        newCS.set(y, {
          checked: true,
          childPeriods: newCS.get(y)?.childPeriods,
        });
      }
    }
    setCheckedState(newCS);
  }

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
            checkHandler={checkBoxHandler}
            checkedState={checkedState}
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
