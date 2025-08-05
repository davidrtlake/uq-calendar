import React, { useContext, useEffect, useState } from "react"
import styles from "../styles/QuickNavigation.module.css"
import { ALL_YEAR_NAMES, MONTH_NAMES } from "../constants/date"
import { CalendarContext } from "../App"

const QuickNavigation: React.FC = () => {
  const today = new Date()
  const { monthRefs, scrollToMonth } = useContext(CalendarContext)!

  // Which year/month panel is expanded.
  const [shownContent, setShownContent] = useState(
    () => new Map<string, boolean>(ALL_YEAR_NAMES.map((y) => [y, y == `${today.getFullYear()}`]))
  )
  // Current visible year/month from IntersectionObserver.
  const [currYear, setCurrYear] = useState(`${today.getFullYear()}`)
  const [currMonth, setCurrMonth] = useState(MONTH_NAMES[today.getMonth()])

  // Observe which month is in view.
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-49% 0px -49% 0px",
      threshold: 0
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const [year, month] = entry.target.id.split("-")
        if (entry.isIntersecting) {
          setCurrYear(year)
          setCurrMonth(month)
          setShownContent((prev) => {
            const next = new Map(prev)
            ALL_YEAR_NAMES.forEach((y) => next.set(y, false))
            next.set(year, true)
            return next
          })
        }
      })
    }, options)

    monthRefs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current)
    })
    return () => {
      observer.disconnect()
    }
  }, [monthRefs])

  // Toggle expand/collapse for a year.
  const handleYearClick = (year: string) => {
    setShownContent((prev) => {
      const next = new Map(prev)
      ALL_YEAR_NAMES.forEach((y) => next.set(y, false))
      next.set(year, !prev.get(year))
      return next
    })
  }

  return (
    <div className={styles.panel}>
      <div className={styles.vertLine} />

      <div className={styles.content}>
        {ALL_YEAR_NAMES.map((year) => (
          <div key={year} className={styles.yearSection}>
            <div
              className={`${styles.yearHeader} ${year == currYear ? styles.activeYear : ""}`}
              onClick={() => handleYearClick(year)}
            >
              {year}
            </div>

            <ul className={`${styles.monthList} ${shownContent.get(year) ? styles.expanded : ""}`}>
              {MONTH_NAMES.map((month, idx) => {
                const isToday = idx == today.getMonth() && parseInt(year, 10) == today.getFullYear()
                const isActive = year == currYear && month == currMonth

                return (
                  <li key={month}>
                    <button
                      id={`${year}-${month}`}
                      className={`${styles.monthButton} ${
                        isActive ? styles.activeMonth : ""
                      } ${isToday ? styles.currentMonth : ""}`}
                      onClick={() => scrollToMonth(year, month)}
                    >
                      {month}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

export default QuickNavigation
