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
  const allYears: string[] = ["2023", "2024", "2025", "2026"];
  const allSummerSemesters: string[] = [
    "Summer Semester (2023-24)",
    "Summer Semester (2024-25)",
    "Summer Semester (2025-26)",
    "Summer Semester (2026-27)",
  ];
  const allPeriods: string[] = [
    "Semester 1",
    "Semester 2",
    "Research quarters",
    "Teaching periods",
  ]; // Maybe replace this with something automatic (state) / just use activePeriods.
  const [checkedState, setCheckedState] = useState<Map<string, CheckedYear>>(
    () => {
      const checkboxLayout = new Map<string, CheckedYear>();
      let newChildPeriods: Map<string, boolean>;
      for (let i = 0; i < allYears.length; i++) {
        newChildPeriods = new Map<string, boolean>();
        for (let p of allPeriods) {
          newChildPeriods.set(p, true);
        }
        checkboxLayout.set(allYears[i], {
          checked: true,
          childPeriods: new Map(newChildPeriods),
        });
        checkboxLayout.set(allSummerSemesters[i], {
          checked: true,
          childPeriods: new Map(),
        });
      }
      return checkboxLayout;
    }
  );
  const today = new Date();
  const year: number = today.getFullYear();
  const newYearsDay = new Date(`${year}-01-01`);
  let currDay: number = newYearsDay.getDay();

  // Handles any checkbox clicks => updates checkedState and therefore shown events.
  function checkBoxHandler(p: string, y: string) {
    // Need to bundle it all into a Map of sets in App.tsx
    const newCS = new Map<string, CheckedYear>(checkedState);
    if (p.length === 0) {
      // If year checked/unchecked, then also toggle children.
      // Clone the children.
      const childPeriodsCopy = new Map<string, boolean>(
        newCS.get(y)?.childPeriods
      );
      // Set all the children to parent.
      childPeriodsCopy.forEach((_, key) => {
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

  // Gets event data from API.
  useEffect(() => {
    fetch("/api/events") // Backend URL
      .then((response) => response.json())
      .then((data: Event[]) => {
        const formattedData = data
          .map((row) => {
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
            allSummerSemesters={allSummerSemesters}
            checkHandler={checkBoxHandler}
            checkedState={checkedState}
          />
        </div>
        <div style={{ maxWidth: "1500px" }}>
          <Year
            year={year}
            currDay={currDay}
            events={events.filter((e) => {
              if (e.period.startsWith("Summer")) {
                return checkedState.get(e.period)?.checked ?? false;
              } else {
                return (
                  checkedState
                    .get(`${e.start_date.getFullYear()}`)
                    ?.childPeriods?.get(e.period) ?? false
                );
              }
            })}
          />
        </div>
      </div>
    </>
  );
}

export default App;
