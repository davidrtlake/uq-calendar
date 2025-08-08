import { createContext, createRef, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  childPeriods: Map<string, boolean>
}

interface CalendarContextValue {
  monthRefs: Map<string, RefObject<HTMLDivElement>>
  weekRefs: Map<string, RefObject<HTMLDivElement>>
  eventIdToRow: Map<number, number>
  highlightedEvents: Set<number>
  setHighlightedEvents: React.Dispatch<React.SetStateAction<Set<number>>>
  scrollToMonth(year: string, month: string): void
  scrollToWeek(year: string, month: string, week: string): void
  scrollToEvent(y: string, m: string, eventId: number): void
}

export const CalendarContext = createContext<CalendarContextValue | null>(null)

function App() {
  console.log("---RELOADING-APP---")
  const [showSearch, setShowSearch] = useState(false)
  const [showCats, setShowCats] = useState(false) // Meow.
  const [showQuickNav, setShowQuickNav] = useState(false)
  const [highlightedEvents, setHighlightedEvents] = useState(new Set<number>())

  const [checkedState, setCheckedState] = useState<Map<string, CheckedYear>>(() => {
    const checkboxLayout = new Map<string, CheckedYear>()
    for (let i = 0; i < ALL_YEAR_NAMES.length; i++) {
      const newChildPeriods = new Map<string, boolean>()
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

  const monthRefs = useMemo(() => {
    return [...ALL_YEAR_NAMES, "2027"].reduce((map, year) => {
      MONTH_NAMES.forEach((month) => {
        map.set(`${year}-${month}`, createRef<HTMLDivElement>())
      })
      return map
    }, new Map<string, RefObject<HTMLDivElement>>())
  }, [])

  const weekRefs = useMemo(() => {
    return [...ALL_YEAR_NAMES, "2027"].reduce((map, year) => {
      MONTH_NAMES.forEach((month) => {
        Array.from({ length: 6 }, (_, row) => {
          map.set(`${year}-${month}-${row}`, createRef<HTMLDivElement>())
        })
      })
      return map
    }, new Map<string, RefObject<HTMLDivElement>>())
  }, [])

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

  const checkBoxHandler = useCallback((year: string, period?: string) => {
    setCheckedState((prev) => {
      const next = new Map(prev)
      const entry = prev.get(year)!
      if (!entry) return prev
      const newChildPeriods = new Map(entry.childPeriods)
      let newChecked: boolean

      if (period) {
        newChildPeriods.set(period, !newChildPeriods.get(period)!)
        newChecked = Array.from(newChildPeriods.values()).every((v) => v)
      } else {
        newChecked = !entry.checked
        newChildPeriods.forEach((_, key) => newChildPeriods.set(key, newChecked))
      }

      next.set(year, {
        checked: newChecked,
        childPeriods: newChildPeriods
      })
      return next
    })
  }, [])

  function scrollToToday() {
    console.log("Scrolling to today")

    todayRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center"
    })
  }

  useEffect(() => {
    setTimeout(scrollToToday, 500)
  }, [])

  return (
    <CalendarContext.Provider
      value={{
        monthRefs,
        weekRefs,
        eventIdToRow,
        highlightedEvents,
        setHighlightedEvents,
        scrollToMonth,
        scrollToWeek,
        scrollToEvent
      }}
    >
      <div className={styles.bodyFlexContainer}>
        <aside className={styles.sidebarLeft}>
          <NestedCheckbox checkHandler={checkBoxHandler} checkedState={checkedState} />
        </aside>
        {showCats && (
          <>
            <div className={styles.toggleMenuLeft}>
              <NestedCheckbox checkHandler={checkBoxHandler} checkedState={checkedState} />
            </div>
            <div className={styles.overlay} onClick={() => setShowCats(false)} />
          </>
        )}
        <main className={styles.mainContent}>
          <header className={styles.toolbar}>
            <SearchBar
              events={events.filter((e) => {
                // Filter invisible events.
                if (e.period.startsWith("Summer")) {
                  return checkedState.get(e.period)?.checked ?? false
                } else {
                  return checkedState.get(`${e.start_date.getFullYear()}`)!.childPeriods!.get(e.period)
                }
              })}
            />
          </header>
          <header className={styles.mobileToolbar}>
            <button className={styles.toggleBtnLeft} onClick={() => setShowCats((v) => !v)}>
              <FontAwesomeIcon icon={faEye} />
            </button>
            <button className={styles.toggleBtn} onClick={() => setShowSearch((v) => !v)}>
              <FontAwesomeIcon icon={faMagnifyingGlass} />
            </button>

            <button className={styles.toggleBtnRight} onClick={() => setShowQuickNav((v) => !v)}>
              <FontAwesomeIcon icon={faBarsStaggered} />
            </button>
          </header>
          {showQuickNav && (
            <>
              <div className={styles.toggleMenuRight}>
                <QuickNavigation />
              </div>
              <div className={styles.overlay} onClick={() => setShowQuickNav(false)} />
            </>
          )}
          {showSearch && (
            <div className={styles.searchWrapper}>
              <SearchBar
                events={events.filter((e) => {
                  // Filter invisible events.
                  if (e.period.startsWith("Summer")) {
                    return checkedState.get(e.period)?.checked ?? false
                  } else {
                    return checkedState.get(`${e.start_date.getFullYear()}`)!.childPeriods!.get(e.period)
                  }
                })}
              />
            </div>
          )}

          <div className={styles.weekLabelContainer}>
            <div className={styles.wkLabel}>WK</div>
            {DAYS_OF_WEEK.map((day, i) => (
              <div key={i} className={styles.dayLabel}>
                {day}
              </div>
            ))}
          </div>

          <div className={styles.jumpWrapper}>
            <button className={styles.jumpButton} onClick={scrollToToday}>
              Jump to today
            </button>
          </div>

          {ALL_YEAR_NAMES.map((y, i) => (
            <Year
              key={i}
              year={parseInt(y)}
              currDay={new Date(`${y}-01-01`).getDay()}
              todayRef={todayRef}
              events={events
                .filter(
                  // Only get fields for selected year.
                  (row) => row.start_date.getFullYear() == parseInt(y) || row.end_date.getFullYear() == parseInt(y)
                )
                .map((row) => {
                  // Crop any overflowing start or end dates.
                  return {
                    ...row,
                    start_date:
                      row.start_date.getFullYear() == parseInt(y)
                        ? row.start_date
                        : new Date(`Janurary 01, ${y} 00:00:00`),
                    end_date:
                      row.end_date.getFullYear() == parseInt(y) ? row.end_date : new Date(`December 31, ${y} 00:00:00`)
                  }
                })
                .filter((e) => {
                  // filter here
                  if (e.period.startsWith("Summer")) {
                    return checkedState.get(e.period)!.checked ?? true
                  } else {
                    return checkedState.get(`${e.start_date.getFullYear()}`)!.childPeriods!.get(e.period)
                  }
                })}
              yearLabels={WEEK_LABELS[y]}
            />
          ))}
        </main>

        {/* Right Sidebar (Quick Nav) */}
        <aside className={styles.sidebarRight}>
          <QuickNavigation />
        </aside>
      </div>
    </CalendarContext.Provider>
  )
}

export default App
