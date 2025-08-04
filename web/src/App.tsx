import { createContext, createRef, RefObject, useEffect, useMemo, useRef, useState } from "react"
import styles from "./styles/App.module.css"
import Year from "./components/Year"
import NestedCheckbox from "./components/NestedCheckbox"
import QuickNavigation from "./components/QuickNavigation"
import SearchBar from "./components/SearchBar"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faBarsStaggered, faEye, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons"
import { ALL_PERIOD_NAMES, ALL_YEAR_NAMES, DAYS_OF_WEEK, MONTH_NAMES, SUMMER_SEMESTER_NAMES } from "./constants/date"
import { events } from "./constants/events"
import { WEEK_LABELS } from "./constants/weeks"

// Define a type for your events
export interface Event {
  event_id: number
  title: string
  period: string
  sub_period: string
  start_date: Date
  end_date: Date
  event_type: string
  url: string
}

interface CheckedYear {
  checked: boolean
  childPeriods: Map<string, boolean> | undefined
}

interface CalendarContextValue {
  monthRefs: Map<string, RefObject<HTMLDivElement>>
  weekRefs: Map<string, RefObject<HTMLDivElement>>
  eventIdToRow: Map<number, number>
  scrollToMonth(year: string, month: string): void
  scrollToWeek(year: string, month: string, week: string): void
  scrollToEvent(y: string, m: string, eventId: number): void
}

export const CalendarContext = createContext<CalendarContextValue | null>(null)

function App() {
  console.log("---RELOADING-APP---")
  const [widthLevel, setWidthLevel] = useState(0)
  const [showSearch, setShowSearch] = useState(false)
  const [showCats, setShowCats] = useState(false) // Meow.
  const [showQuickNav, setShowQuickNav] = useState(false)

  //choose the screen size
  const handleResize = () => {
    // console.log(window.innerWidth, window);
    if (window.innerWidth <= 502) {
      // Hide Category selector and quick nav.
      setWidthLevel(4)
    } else if (window.innerWidth <= 700) {
      // Hide Category selector and quick nav.
      setWidthLevel(3)
    } else if (window.innerWidth <= 1022) {
      // Hide Category selector and quick nav.
      setWidthLevel(2)
    } else if (window.innerWidth <= 1213) {
      // Hide search bar.
      setWidthLevel(1)
    } else {
      // Normal desktop view.
      setWidthLevel(0)
    }
  }

  const [checkedState, setCheckedState] = useState<Map<string, CheckedYear>>(() => {
    const checkboxLayout = new Map<string, CheckedYear>()
    let newChildPeriods: Map<string, boolean>
    for (let i = 0; i < ALL_YEAR_NAMES.length; i++) {
      newChildPeriods = new Map<string, boolean>()
      for (const p of ALL_PERIOD_NAMES) {
        newChildPeriods.set(p, true)
      }
      checkboxLayout.set(ALL_YEAR_NAMES[i], {
        checked: true,
        childPeriods: new Map(newChildPeriods)
      })
      checkboxLayout.set(SUMMER_SEMESTER_NAMES[i], {
        checked: true,
        childPeriods: new Map()
      })
    }
    return checkboxLayout
  })
  const [highlightedEvents, setHighlightedEvents] = useState<Map<number, boolean>>(() => {
    return new Map(events.map((e) => [e.event_id, false]))
  })
  const labels: Record<string, Record<string, string[]>> = WEEK_LABELS

  const monthRefs = useMemo(() => {
    return ALL_YEAR_NAMES.concat(["2027"]).reduce((map, year) => {
      MONTH_NAMES.forEach((month) => {
        map.set(`${year}-${month}`, createRef<HTMLDivElement>())
      })
      return map
    }, new Map<string, RefObject<HTMLDivElement>>())
  }, [ALL_YEAR_NAMES.concat(["2027"])])

  const weekRefs = useMemo(() => {
    return ALL_YEAR_NAMES.concat(["2027"]).reduce((map, year) => {
      MONTH_NAMES.forEach((month) => {
        Array.from(Array(6).keys()).forEach((row) => {
          map.set(`${year}-${month}-${row}`, createRef<HTMLDivElement>())
        })
      })
      return map
    }, new Map<string, RefObject<HTMLDivElement>>())
  }, [ALL_YEAR_NAMES.concat(["2027"])])

  const scrollToMonth = (year: string, month: string) => {
    if (!ALL_YEAR_NAMES.includes(year)) {
      return
    }
    monthRefs.get(`${year}-${month}`)?.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
      inline: "center"
    })
  }
  const scrollToWeek = (year: string, month: string, row: string) => {
    if (!ALL_YEAR_NAMES.includes(year)) {
      return
    }
    weekRefs.get(`${year}-${month}-${row}`)?.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    })
  }
  const scrollToEvent = (year: string, month: string, eventId: number) => {
    if (!ALL_YEAR_NAMES.includes(year)) {
      return
    }
    weekRefs.get(`${year}-${month}-${eventIdToRow.get(eventId)}`)?.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    })
  }

  const eventIdToRow = new Map<number, number>()

  const todayRef = useRef<HTMLDivElement>(null)

  // Handles any checkbox clicks => updates checkedState and therefore shown events.
  function checkBoxHandler(p: string, y: string, _currWeek: string) {
    // Need to bundle it all into a Map of sets in App.tsx
    const newCheckedState = new Map<string, CheckedYear>(checkedState)
    if (p.length == 0) {
      // If year checked/unchecked, then also toggle children.
      // Clone the children.
      const childPeriodsCopy = new Map<string, boolean>(newCheckedState.get(y)?.childPeriods)
      // Set all the children to parent.
      childPeriodsCopy.forEach((_, key) => {
        childPeriodsCopy.set(key, !newCheckedState.get(y)?.checked)
      })
      newCheckedState.set(y, {
        checked: !newCheckedState.get(y)?.checked,
        childPeriods: childPeriodsCopy
      })
    } else {
      // If a child is checked/unchecked.
      // Toggle the child state.
      newCheckedState.get(y)?.childPeriods?.set(p, !newCheckedState.get(y)?.childPeriods?.get(p))

      // Check if all children are ticked or all unticked now.
      const target: number = newCheckedState.get(y)?.childPeriods?.size ?? 0
      let sum: number = 0
      newCheckedState.get(y)?.childPeriods?.forEach((value) => {
        value && sum++
      })
      if (sum == 0 || !newCheckedState.get(y)?.childPeriods?.get(p)) {
        newCheckedState.set(y, {
          checked: false,
          childPeriods: newCheckedState.get(y)?.childPeriods
        })
      } else if (sum == target) {
        newCheckedState.set(y, {
          checked: true,
          childPeriods: newCheckedState.get(y)?.childPeriods
        })
      }
    }

    setCheckedState(newCheckedState)
  }

  function handleHighlightEvents(eIDsToHighlight: Set<number>) {
    setHighlightedEvents(new Map(events.map((e) => [e.event_id, eIDsToHighlight.has(e.event_id)])))
  }

  function scrollToToday() {
    todayRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    })
  }

  // Gets event data from API.
  // useEffect(() => {
  // fetch("/api/events") // Backend URL
  //   .then((response) => response.json())
  //   .then((data: Event[]) => {
  //     const formattedData = data.map((row) => {
  //       return {
  //         ...row,
  //         start_date: new Date(row.start_date),
  //         end_date: new Date(row.end_date),
  //       };
  //     });
  //     console.log("Setting Events");
  //     setEvents(formattedData);
  //   })
  //   .catch((error) => console.error("Error fetching data:", error));
  // }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize)
    handleResize()
    setTimeout(scrollToToday, 500) // Hacky but it works.
  }, [])

  return (
    <CalendarContext.Provider value={{ monthRefs, weekRefs, eventIdToRow, scrollToMonth, scrollToWeek, scrollToEvent }}>
      <div className={styles.bodyFlexContainer}>
        <div
          className={styles.sidebar}
          style={{
            paddingRight: widthLevel <= 1 ? "1%" : "0px",
            width: widthLevel <= 1 ? "17vw" : "0vw"
          }}
        >
          {widthLevel <= 1 ? (
            <NestedCheckbox checkHandler={checkBoxHandler} checkedState={checkedState} />
          ) : (
            <>
              <div
                style={{
                  position: "fixed",
                  display: showCats ? "block" : "none",
                  zIndex: "5000",
                  backgroundColor: "rgba(47, 3, 61, 1)",
                  // minWidth: "40%",
                  borderRight: "1px solid gray",
                  borderBottom: "1px solid gray",
                  borderRadius: "0px 0px 10px 0px",
                  top: "111px",
                  fontSize: "2vh",
                  padding: "10px",
                  paddingRight: "0px"
                }}
              >
                <NestedCheckbox checkHandler={checkBoxHandler} checkedState={checkedState} />
              </div>
              <div
                style={{
                  position: "fixed",
                  display: showCats ? "block" : "none",
                  zIndex: "4999",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  top: "111px",
                  width: "100%",
                  height: "100%"
                }}
                onClick={() => setShowCats(false)}
              />
            </>
          )}
        </div>
        <div style={{ maxWidth: "1300px" }}>
          {widthLevel == 0 ? (
            <div
              style={{
                position: "sticky",
                top: "20px",
                zIndex: "3006",
                textAlign: "right",
                display: "flex",
                flexDirection: "row",
                justifyContent: "flex-end",
                alignItems: "center"
              }}
            >
              <SearchBar
                events={events.filter((e) => {
                  // Filter invisible events.
                  if (e.period.startsWith("Summer")) {
                    return checkedState.get(e.period)?.checked ?? false
                  } else {
                    return checkedState.get(`${e.start_date.getFullYear()}`)!.childPeriods!.get(e.period)
                  }
                })}
                handleHighlightEvents={handleHighlightEvents}
              />
            </div>
          ) : (
            <>
              <div
                style={{
                  position: "sticky",
                  top: "20px",
                  zIndex: "3006",
                  textAlign: "right",
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "flex-end",
                  alignItems: "center"
                }}
              >
                {widthLevel > 1 ? (
                  <button
                    onClick={() => {
                      setShowCats(!showCats)
                      setShowQuickNav(false)
                    }}
                    style={{
                      backgroundColor: showCats ? "rgba(68, 29, 81, 1)" : "rgba(47, 3, 61, 1)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      fontSize: "1.2em",
                      marginRight: "auto",
                      marginLeft: "6px"
                    }}
                  >
                    <FontAwesomeIcon icon={faEye} />
                  </button>
                ) : (
                  ""
                )}
                <button
                  onClick={() => {
                    setShowSearch(!showSearch)
                  }}
                  style={{
                    backgroundColor: showSearch ? "rgba(68, 29, 81, 1)" : "rgba(47, 3, 61, 1)",
                    border: "1px solid rgba(255, 255, 255, 0.4)",
                    fontSize: "1.2em"
                  }}
                >
                  <FontAwesomeIcon icon={faMagnifyingGlass} />
                </button>
                {widthLevel > 1 ? (
                  <button
                    onClick={() => {
                      setShowQuickNav(!showQuickNav)
                      setShowCats(false)
                    }}
                    style={{
                      backgroundColor: showQuickNav ? "rgba(68, 29, 81, 1)" : "rgba(47, 3, 61, 1)",
                      border: "1px solid rgba(255, 255, 255, 0.4)",
                      fontSize: "1.2em",
                      margin: "0px 6px 0px 6px"
                    }}
                  >
                    <FontAwesomeIcon icon={faBarsStaggered} />
                  </button>
                ) : (
                  ""
                )}
              </div>
              <div
                style={{
                  display: showSearch ? "flex" : "none",
                  transition: "display 4s 1s",
                  position: "sticky",
                  top: "111px",
                  zIndex: "3006",
                  textAlign: "right",
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "rgb(47, 3, 61)",
                  borderBottom: "1px solid gray"
                }}
              >
                <SearchBar
                  events={events.filter((e) => {
                    // Filter invisible events.
                    if (e.period.startsWith("Summer")) {
                      return checkedState.get(e.period)?.checked ?? false
                    } else {
                      return checkedState.get(`${e.start_date.getFullYear()}`)!.childPeriods!.get(e.period)
                    }
                  })}
                  handleHighlightEvents={handleHighlightEvents}
                />
              </div>
            </>
          )}
          <div
            className="container"
            style={{
              top: "5.05rem",
              position: "sticky",
              zIndex: "3005",
              backgroundColor: "#2f033d",
              paddingTop: "0.3rem"
            }}
          >
            <div id="wk-label">WK</div>
            {DAYS_OF_WEEK.map((day, i) => (
              <div
                key={i}
                style={{
                  borderBottom: "1px solid rgba(255, 255, 255, 0.56)",
                  paddingInlineStart: "0.1rem"
                }}
              >
                {day}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "grid",
              position: "sticky",
              top: "90vh",
              zIndex: "3006",
              justifyContent: "end"
            }}
          >
            <button
              onClick={() => scrollToToday()}
              style={{
                backgroundColor: "#2f033d",
                marginRight: "15px"
              }}
            >
              Jump to today
            </button>
          </div>
          {ALL_YEAR_NAMES.map((y, i) => {
            const year: number = parseInt(y)
            const newYearsDay = new Date(`${year}-01-01`)
            const currDay: number = newYearsDay.getDay()
            return (
              <Year
                key={i}
                year={year}
                currDay={currDay}
                todayRef={todayRef}
                events={events
                  .filter(
                    // Only get fields for selected year.
                    (row) => row.start_date.getFullYear() == year || row.end_date.getFullYear() == year
                  )
                  .map((row) => {
                    // Crop any overflowing start or end dates.
                    return {
                      ...row,
                      start_date:
                        row.start_date.getFullYear() == year
                          ? row.start_date
                          : new Date(`Janurary 01, ${year} 00:00:00`),
                      end_date:
                        row.end_date.getFullYear() == year ? row.end_date : new Date(`December 31, ${year} 00:00:00`)
                    }
                  })
                  .filter((e) => {
                    // filter here
                    if (e.period.startsWith("Summer")) {
                      return checkedState.get(e.period)?.checked ?? false
                    } else {
                      return checkedState.get(`${e.start_date.getFullYear()}`)!.childPeriods!.get(e.period)
                    }
                  })}
                highlightedEvents={highlightedEvents}
                yearLabels={labels[y]}
                widthLevel={widthLevel}
              />
            )
          })}
        </div>
        <div className={styles.sidebar} style={{ paddingLeft: widthLevel <= 1 ? "1%" : "0px" }}>
          {widthLevel <= 1 ? (
            <QuickNavigation />
          ) : (
            <>
              <div
                style={{
                  position: "fixed",
                  display: showQuickNav ? "block" : "none",
                  zIndex: "5000",
                  backgroundColor: "rgba(47, 3, 61, 1)",
                  borderLeft: "1px solid gray",
                  borderBottom: "1px solid gray",
                  borderRadius: "0px 0px 0px 10px",
                  minWidth: "15%",
                  top: "111px",
                  right: "0px",
                  fontSize: "2vh",
                  padding: "2vh"
                }}
              >
                <QuickNavigation />
              </div>
              <div
                style={{
                  position: "fixed",
                  display: showQuickNav ? "block" : "none",
                  zIndex: "4999",
                  backgroundColor: "rgba(0, 0, 0, 0.4)",
                  top: "111px",
                  right: "0px",
                  width: "100%",
                  height: "100%"
                }}
                onClick={() => setShowQuickNav(false)}
              />
            </>
          )}
        </div>
      </div>
    </CalendarContext.Provider>
  )
}

export default App
