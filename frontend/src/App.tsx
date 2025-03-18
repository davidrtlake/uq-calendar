import { useEffect, useRef, useState } from "react";
import "./App.css";
import Year from "./components/Year";
import NestedCheckbox from "./components/NestedCheckbox";
import QuickNavigation from "./components/QuickNavigation";
import data from "./assets/week_labels.json";

// Define a type for your events
export interface Event {
  event_id: number;
  title: string;
  period: string;
  sub_period: string;
  start_date: Date;
  end_date: Date;
  event_type: string;
  url: string;
}

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

function App() {
  console.log("---RELOADING-APP---");
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
  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const daysOfTheWeek: string[] = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
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
  const labels: object = data;
  // This idea is taken from https://react.dev/learn/manipulating-the-dom-with-refs#example-scrolling-to-an-element
  const monthRefs: Map<
    string,
    React.MutableRefObject<Map<string, HTMLDivElement> | null>
  > = new Map();
  allYears.map((y) => {
    monthRefs.set(y, useRef<Map<string, HTMLDivElement> | null>(null));
  });
  const today: Date = new Date();

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

  // Handling clicking in navigation bar.
  function navigationHandler(m: string, y: string) {
    // console.log("Scrolling to", m, y);
    const map = getMap(y);
    const node = map.get(m)!;
    node.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "center",
    });
  }

  // Gets the map of refs for the year y.
  function getMap(y: string): Map<string, HTMLDivElement> {
    if (!monthRefs.get(y)!.current) {
      monthRefs.get(y)!.current = new Map();
    }
    return monthRefs.get(y)!.current!;
  }

  // Gets event data from API.
  useEffect(() => {
    fetch("/api/events") // Backend URL
      .then((response) => response.json())
      .then((data: Event[]) => {
        const formattedData = data.map((row) => {
          return {
            ...row,
            start_date: new Date(row.start_date),
            end_date: new Date(row.end_date),
          };
        });
        console.log("Setting Events");
        setEvents(formattedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // useEffect(() => {
  //   navigationHandler(monthNames[today.getMonth()], `${today.getFullYear()}`); //Wait until components have loaded.
  //   console.log(
  //     "Scrolling to today",
  //     monthNames[today.getMonth()],
  //     `${today.getFullYear()}`
  //   );
  // }, []);

  useEffect(() => {
    setTimeout(
      navigationHandler,
      500,
      monthNames[today.getMonth()],
      `${today.getFullYear()}`
    ); // Hacky but it works.
  }, []);

  return (
    <>
      <div className="body-flex-container">
        <div className="sidebar" style={{ paddingRight: "1%" }}>
          <NestedCheckbox
            allYears={allYears}
            allPeriods={allPeriods}
            allSummerSemesters={allSummerSemesters}
            monthRefs={monthRefs}
            checkHandler={checkBoxHandler}
            checkedState={checkedState}
          />
        </div>
        <div style={{ maxWidth: "1300px" }}>
          <div
            className="container"
            style={{
              top: "5.05rem",
              position: "sticky",
              zIndex: "3005",
              backgroundColor: "#2f033d",
              paddingTop: "0.3rem",
            }}
          >
            <div
              style={{
                width: "30px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.56)",
                paddingInlineStart: "0.1rem",
              }}
            >
              WK
            </div>
            {daysOfTheWeek.map((day, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.56)",
                  paddingInlineStart: "0.1rem",
                }}
              >
                {day}
              </div>
            ))}
          </div>
          {allYears.map((y, i) => {
            const year: number = parseInt(y);
            const newYearsDay = new Date(`${year}-01-01`);
            let currDay: number = newYearsDay.getDay();
            return (
              <Year
                key={i}
                year={year}
                currDay={currDay}
                monthNames={monthNames}
                getMap={getMap}
                events={events
                  .filter(
                    // Only get fields for selected year.
                    (row) =>
                      row.start_date.getFullYear() === year ||
                      row.end_date.getFullYear() === year
                  )
                  .map((row) => {
                    // Crop any overflowing start or end dates.
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
                  })
                  .filter((e) => {
                    // filter here
                    if (e.period.startsWith("Summer")) {
                      return checkedState.get(e.period)?.checked ?? false;
                    } else {
                      return checkedState
                        .get(`${e.start_date.getFullYear()}`)!
                        .childPeriods!.get(e.period);
                    }
                  })}
                yearLabels={labels[y as keyof Object]}
              />
            );
          })}
        </div>
        <div className="sidebar" style={{ paddingLeft: "2%" }}>
          <QuickNavigation
            allYears={allYears}
            monthNames={monthNames}
            monthRefs={monthRefs}
            navigationHandler={navigationHandler}
            checkedState={checkedState}
          />
        </div>
      </div>
    </>
  );
}

export default App;
