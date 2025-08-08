import Month from "./Month"
import { CalendarContext, Event } from "../App"
import styles from "../styles/Year.module.css"
import { MONTH_NAMES } from "../constants/date"
import { useContext } from "react"

interface Props {
  year: number
  currDay: number
  todayRef: React.RefObject<HTMLDivElement>
  events: Event[]
  yearLabels: object
}

const Year = ({ year, currDay, todayRef, events, yearLabels }: Props) => {
  const monthLens: number[] = [31, 28 + (year % 4 == 0 ? 1 : 0), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  const monthStartDays: number[] = []
  const today: Date = new Date()
  const { monthRefs } = useContext(CalendarContext)!

  monthLens.forEach((length) => {
    monthStartDays.push(currDay % 7)
    currDay += length
  })

  return (
    <div className={styles.year}>
      <h1 className={styles.yearHeading}>{year}</h1>
      <div className={styles.flexContainerColumn}>
        {monthLens.map((length, i) => (
          <div
            key={i}
            id={`${year}-${MONTH_NAMES[i]}`}
            className={styles.month}
            ref={monthRefs.get(`${year}-${MONTH_NAMES[i]}`)}
          >
            <Month
              startDay={monthStartDays[i]}
              todayRef={todayRef}
              monthLength={length}
              prevMonthLength={monthLens[(i - 1 + 12) % 12]}
              monthName={MONTH_NAMES[i]}
              yearName={`${year}`}
              todayMonth={today.getMonth() == i && year == today.getFullYear()}
              monthNum={i}
              events={events.filter((row) => {
                return row.start_date.getMonth() == i || row.end_date.getMonth() == i
              })}
              monthLabels={yearLabels[MONTH_NAMES[i] as keyof object]}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default Year
