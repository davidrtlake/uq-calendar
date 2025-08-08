import styles from "../styles/Day.module.css"
import { CalendarContext, Event } from "../App"
import { ExtendedEventAndLength } from "./Month"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { useContext } from "react"

interface Props {
  date: string
  row: number
  today: boolean
  events: Event[]
  extendedEvents: ExtendedEventAndLength[]
  invisExtendedEvents: number
}

const getEventColour = (eventType: string): string[] => {
  switch (eventType) {
    case "Public holiday":
      return ["rgb(110, 100, 84)", "rgb(255, 255, 255)"]
    case "Examination period":
      return ["rgb(231, 222, 126)", "rgb(71, 70, 55)"]
    case "Starting date":
      return ["rgb(74, 109, 68)", "rgb(255, 255, 255)"]
    case "Closing date":
      return ["rgb(151, 34, 54)", "rgb(255, 255, 255)"]
    case "Graduation period":
      return ["rgb(244, 122, 62)", "rgb(255, 255, 255)"]
    case "Finalisation of grades":
      return ["rgb(253, 170, 170)", "rgb(49, 20, 20)"]
    default:
      return ["rgb(56, 92, 146)", "rgb(255, 255, 255)"]
  }
}

const Day = ({ date, row, today, events, extendedEvents, invisExtendedEvents }: Props) => {
  const showPeriod: boolean[] = []
  const { eventIdToRow, highlightedEvents } = useContext(CalendarContext)!
  let prevPeriod: string = ""

  events.forEach((e) => {
    showPeriod.push(e.period !== prevPeriod)
    prevPeriod = e.period
  })

  function shortenPeriodName(periodName: string): string {
    const splitName: string[] = periodName.split(" ")
    if (periodName.toLowerCase().startsWith("semester")) {
      splitName[1] = "Sem.".concat(splitName[1])
      return splitName.slice(1).join(" ")
    } else if (periodName.toLowerCase().startsWith("summer semester")) {
      splitName[1] = "Sem."
    }
    return splitName.join(" ")
  }

  showPeriod.push(false)

  return (
    <>
      <h4 className={today ? styles.todayDateHeading : styles.dateHeading}>
        {date} {today ? <span className={styles.todayMessage}> Today</span> : ""}
      </h4>
      <div className={styles.desktopOnly}>
        <div
          style={{
            marginBlockStart: `${
              Math.round(invisExtendedEvents * 25 + (invisExtendedEvents ? 1 : 0)) // Just enough to put a gap between events. 25 comes from height of extended event.
            }px`
          }}
        >
          {extendedEvents.map((e, j) => {
            if (eventIdToRow.get(e.event.event_id) == undefined) {
              eventIdToRow.set(e.event.event_id, row)
            }
            for (let k = 0; k < j; k++) {
              if (extendedEvents[k].event.title == extendedEvents[j].event.title) {
                // If it's a duplicate event then only show the first one.
                return
              }
            }
            return (
              <div
                key={j}
                className={styles.extendedEvent}
                style={{
                  width: `calc(100% * ${e.length})`,
                  backgroundColor: getEventColour(e.event.event_type)[0],
                  color: getEventColour(e.event.event_type)[1],
                  border: highlightedEvents.has(e.event.event_id) ? "3px solid rgb(255, 255, 255)" : "",
                  marginBlockEnd: "2px",
                  zIndex: 100 - invisExtendedEvents
                }}
              >
                <p className={styles.extendedEventDescriptions}>
                  <b>
                    {e.introText} {e.event.period}:{" "}
                  </b>
                  {e.event.url ? (
                    <a href={e.event.url} target="_blank" rel="noopener noreferrer">
                      {e.event.title}
                      {". "}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  ) : (
                    <>
                      {e.event.title}
                      {"."}
                    </>
                  )}
                </p>
              </div>
            )
          })}
          {events.map((e, i) => {
            eventIdToRow.set(e.event_id, row)
            for (let j = 0; j < i; j++) {
              if (events[j].title == events[i].title) {
                // Duplicate event then only show one.
                return
              }
            }
            return (
              <div
                key={i}
                className={styles.event}
                style={{
                  marginBlockEnd: showPeriod[i + 1] ? "0.5em" : "0.2em",
                  backgroundColor: getEventColour(e.event_type)[0],
                  color: getEventColour(e.event_type)[1],
                  border: highlightedEvents.has(e.event_id) ? "3px solid rgb(255, 255, 255)" : ""
                }}
              >
                <p
                  className={`${styles.eventDescriptions} ${styles.truncate}`}
                  style={{
                    WebkitLineClamp: events.length > 2 ? "2" : "3",
                    lineClamp: events.length > 2 ? "2" : "3"
                    // fontSize: widthLevel > 1 ? "1em" : "1em",
                  }}
                >
                  {showPeriod[i] && <b className={styles.periodTitle}>{e.period}: </b>}
                  {e.url ? (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: getEventColour(e.event_type)[1] }}
                    >
                      {e.title}
                      {". "}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  ) : (
                    <>
                      {e.title}
                      {"."}
                    </>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </div>
      <div className={styles.mobileOnly}>
        <div
          style={{
            marginBlockStart: `${
              Math.round(invisExtendedEvents * 17 + (invisExtendedEvents ? 1 : 0)) // Just enough to put a gap between events. 25 comes from height of extended event.
            }px`
          }}
        >
          {extendedEvents.map((e, j) => {
            if (eventIdToRow.get(e.event.event_id) == undefined) {
              eventIdToRow.set(e.event.event_id, row)
            }
            for (let k = 0; k < j; k++) {
              if (extendedEvents[k].event.title == extendedEvents[j].event.title) {
                // Duplicate event then only show one.
                return
              }
            }
            return (
              <div
                key={j}
                className={styles.extendedEvent}
                style={{
                  width: `calc(calc(100vw / 7 - 1px) * ${e.length} + ${e.length - 1}px)`,
                  backgroundColor: getEventColour(e.event.event_type)[0],
                  color: getEventColour(e.event.event_type)[1],
                  border: highlightedEvents.has(e.event.event_id) ? "3px solid rgb(255, 255, 255)" : "",
                  marginBlockEnd: "2px",
                  zIndex: 100 - invisExtendedEvents
                }}
              >
                <p className={styles.extendedEventDescriptions}>
                  <b>
                    {e.introText} {shortenPeriodName(e.event.period)}:{" "}
                  </b>
                  {e.event.title}
                  {"."}
                  {e.event.url && (
                    <a href={e.event.url} target="_blank" rel="noopener noreferrer">
                      {" "}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  )}
                </p>
              </div>
            )
          })}
          {events.map((e, i) => {
            eventIdToRow.set(e.event_id, row)
            for (let j = 0; j < i; j++) {
              if (events[j].title == events[i].title) {
                // Duplicate event then only show one.
                return
              }
            }
            return (
              <div
                key={i}
                className={styles.event}
                style={{
                  marginBlockEnd: showPeriod[i + 1] ? "0.5em" : "0.2em",
                  backgroundColor: getEventColour(e.event_type)[0],
                  color: getEventColour(e.event_type)[1],
                  border: highlightedEvents.has(e.event_id) ? "3px solid rgb(255, 255, 255)" : ""
                }}
              >
                <p
                  className={`${styles.eventDescriptions} ${styles.truncate}`}
                  style={{
                    WebkitLineClamp: events.length > 2 ? "5" : "7",
                    lineClamp: events.length > 2 ? "5" : "7"
                    // fontSize: widthLevel > 1 ? "1em" : "1em",
                  }}
                >
                  {showPeriod[i] && <b className={styles.periodTitle}>{shortenPeriodName(e.period)}: </b>}
                  {e.title}
                  {"."}
                  {e.url && (
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: getEventColour(e.event_type)[1] }}
                    >
                      {" "}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  )}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}

export default Day
