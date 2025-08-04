import { useContext, useEffect, useState } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"
import styles from "../styles/NestedCheckbox.module.css"
import { ALL_PERIOD_NAMES, ALL_YEAR_NAMES, SUMMER_SEMESTER_NAMES } from "../constants/date"
import { CalendarContext } from "../App"

interface CheckedYear {
  checked: boolean
  childPeriods: Map<string, boolean> | undefined
}

interface Props {
  checkHandler: (p: string, y: string, currWeek: string) => void
  checkedState: Map<string, CheckedYear>
}

const NestedCheckbox = ({ checkHandler, checkedState }: Props) => {
  const [shownContent, _] = useState<Map<string, boolean>>(() => {
    const defaultShownContent = new Map<string, boolean>()
    ALL_YEAR_NAMES.forEach((y) => defaultShownContent.set(y, "2025" == "2025"))
    return defaultShownContent
  })
  const today: Date = new Date()
  const [currYear, setCurrYear] = useState<string>(`${today.getFullYear()}`.slice(2))
  const [currWeek, setCurrWeek] = useState<string>("")
  const { monthRefs, weekRefs } = useContext(CalendarContext)!

  const callback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      const entryId: string[] = entry.target.id.split("-")
      if (entry.isIntersecting) {
        // Item entering screen.
        setCurrYear(entryId[0].slice(2))
      }
    })
  }

  const weekCallback = (entries: IntersectionObserverEntry[]) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      if (entry.isIntersecting) {
        // Item entering screen.
        // console.log(entry.target.id);
        setCurrWeek(entry.target.id)
      }
    })
  }

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-49% 0px -49% 0px",
      threshold: 0
    }
    const observer = new IntersectionObserver(callback, options)
    const weekObserver = new IntersectionObserver(weekCallback, options)
    monthRefs.forEach((ref) => {
      if (ref.current != null) {
        observer.observe(ref.current)
      }
    })
    weekRefs.forEach((ref) => {
      if (ref.current != null) {
        weekObserver.observe(ref.current)
      }
    })
  }, [])

  // function buttonClickHandler(y: string) {
  //   const newShownContent = new Map<string, boolean>(shownContent);
  //   newShownContent.set(y, !newShownContent.get(y));
  //   setShownContent(newShownContent);
  // }

  return (
    <fieldset>
      <legend>Shown Categories:</legend>
      {ALL_YEAR_NAMES.map((y, i) => (
        <div key={i}>
          <ul style={{ display: y.includes(currYear) ? "block" : "none" }}>
            <input
              type="checkbox"
              id={y}
              name={y}
              checked={checkedState.get(y)?.checked ?? true}
              onChange={() => checkHandler("", y, currWeek)}
              style={{ display: "none" }}
            />
            <label
              className={styles.year}
              htmlFor={y}
              style={{
                color: checkedState.get(y)!.checked ? "white" : "gray"
              }}
            >
              <div className={styles.yearCollapsible}>
                {checkedState.get(y)!.checked ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
                {y}
              </div>
            </label>

            <div className={styles.periodContent} style={{ display: shownContent.get(y) ? "block" : "none" }}>
              {ALL_PERIOD_NAMES.map((p, j) => (
                <li key={j}>
                  <input
                    type="checkbox"
                    id={`${y}${p}`}
                    name={`${y}${p}`}
                    checked={checkedState.get(y)?.childPeriods?.get(p) ?? true}
                    onChange={() => checkHandler(p, y, currWeek)}
                    style={{ display: "none" }}
                  />
                  <label
                    style={{
                      display: "block",
                      cursor: "pointer",
                      padding: "5px 0px",
                      borderBottom: j < ALL_PERIOD_NAMES.length - 1 ? "1px solid rgb(255, 255, 255, 0.2)" : "none"
                    }}
                    htmlFor={`${y}${p}`}
                  >
                    <div
                      style={{
                        color: checkedState.get(y)!.childPeriods!.get(p) ? "white" : "gray"
                      }}
                    >
                      {checkedState.get(y)!.childPeriods!.get(p) ? (
                        <FontAwesomeIcon icon={faEye} style={{ fontSize: "0.81em" }} />
                      ) : (
                        <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: "0.81em" }} />
                      )}
                      {p}
                    </div>
                  </label>
                </li>
              ))}
            </div>
          </ul>
          <ul
            style={{
              display: SUMMER_SEMESTER_NAMES[i].includes(currYear) ? "block" : "none"
            }}
          >
            <input
              type="checkbox"
              id={SUMMER_SEMESTER_NAMES[i]}
              name={SUMMER_SEMESTER_NAMES[i]}
              checked={checkedState.get(SUMMER_SEMESTER_NAMES[i])?.checked ?? true}
              onChange={() => checkHandler("", SUMMER_SEMESTER_NAMES[i], currWeek)}
              style={{ display: "none" }}
            />
            <label className={styles.summer} htmlFor={`${SUMMER_SEMESTER_NAMES[i]}`}>
              <div
                className={styles.yearCollapsible}
                style={{
                  color: checkedState.get(SUMMER_SEMESTER_NAMES[i])!.checked ? "white" : "gray"
                }}
              >
                {checkedState.get(SUMMER_SEMESTER_NAMES[i])!.checked ? (
                  <FontAwesomeIcon icon={faEye} />
                ) : (
                  <FontAwesomeIcon icon={faEyeSlash} />
                )}
                {`${SUMMER_SEMESTER_NAMES[i]}`}
              </div>
            </label>
          </ul>
        </div>
      ))}
    </fieldset>
  )
}

export default NestedCheckbox
