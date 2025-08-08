import React, { useContext, useEffect, useState } from "react"
import styles from "../styles/NestedCheckbox.module.css"
import { ALL_YEAR_NAMES, ALL_PERIOD_NAMES, SUMMER_SEMESTER_NAMES } from "../constants/date"
import { CalendarContext } from "../App"

interface CheckedYear {
  checked: boolean
  childPeriods: Map<string, boolean> | undefined
}

interface Props {
  checkHandler: (year: string, period?: string) => void
  checkedState: Map<string, CheckedYear>
}

const NestedCheckbox: React.FC<Props> = ({ checkHandler, checkedState }) => {
  const today = new Date()
  const [currYear, setCurrYear] = useState(String(today.getFullYear()).slice(2))
  const { monthRefs } = useContext(CalendarContext)!

  // Watch which year is currently in view
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-49% 0px -49% 0px",
      threshold: 0
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const [year] = entry.target.id.split("-")
        if (entry.isIntersecting) {
          setCurrYear(year.slice(2))
        }
      })
    }, options)

    monthRefs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current)
    })
    return () => observer.disconnect()
  }, [monthRefs])

  return (
    <div className={styles.panel}>
      <div className={styles.legend}>Shown Categories:</div>
      {ALL_YEAR_NAMES.map((yearFull, idx) => {
        const yearShort = yearFull.slice(2)
        const showYear = yearShort == currYear
        const summerName = SUMMER_SEMESTER_NAMES[idx]
        const showSummer = summerName.includes(currYear)
        const yearIsChecked = checkedState.get(yearFull)?.checked ?? true
        const summerIsChecked = checkedState.get(summerName)?.checked ?? true

        return (
          <React.Fragment key={yearFull}>
            {showYear && (
              <div className={styles.item} onClick={() => checkHandler(yearFull)}>
                <span className={yearIsChecked ? styles.itemLabel : styles.itemLabelDark}>{yearFull}</span>
                <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                  <input
                    id={yearFull}
                    type="checkbox"
                    checked={yearIsChecked}
                    onChange={() => checkHandler(yearFull)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            )}

            {showYear && (
              <div className={styles.periodList}>
                {ALL_PERIOD_NAMES.map((pName) => {
                  const isChecked = checkedState.get(yearFull)?.childPeriods?.get(pName) ?? true
                  return (
                    <div className={styles.periodItem} key={pName} onClick={() => checkHandler(yearFull, pName)}>
                      <span className={isChecked ? styles.periodLabel : styles.periodLabelDark}>{pName}</span>
                      <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                        <input
                          id={`${yearFull}-${pName}`}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => checkHandler(yearFull, pName)}
                        />
                        <span className={styles.slider} />
                      </label>
                    </div>
                  )
                })}
              </div>
            )}

            {showSummer && (
              <div className={styles.item} onClick={() => checkHandler(summerName)}>
                <span className={summerIsChecked ? styles.itemLabel : styles.itemLabelDark}>{summerName}</span>
                <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
                  <input
                    id={summerName}
                    type="checkbox"
                    checked={summerIsChecked}
                    onChange={() => checkHandler(summerName)}
                  />
                  <span className={styles.slider} />
                </label>
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

export default NestedCheckbox
