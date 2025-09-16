import styles from "../styles/Day.module.css"
import { CalendarContext, Event } from "../App"
import { ExtendedEventAndLength } from "./Month"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons"
import { useContext } from "react"
import { uniqBy } from "lodash"

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

  function shortenPeriodName(periodName: string) {
    const splitName: string[] = periodName.split(" ").map((it, i) => {
      const wordLower = it.toLocaleLowerCase()
      if (wordLower == "semester") {
        return i == 0 ? "Sem." : "Sem. "
      }
      if (wordLower == "quarters") {
        return "qtrs. "
      }
      if (it.match(/^\(\d+-\d+\)$/)) {
        return it.replace(/^\((\d{2})(\d{2})-(\d+)\)$/, "($2-$3)")
      }
      return `${it} `
    })
    return splitName.join("").trim()
  }

  const periodNameToShortened: Record<string, string> = {}

  function getShortenPeriodName(periodName: string) {
    periodNameToShortened[periodName] = periodNameToShortened[periodName] ?? shortenPeriodName(periodName)
    return periodNameToShortened[periodName]
  }

  showPeriod.push(false)

  const MARGIN_RIGHT_PERCENT = 2.3

  return (
    <>
      <h4 className={today ? styles.todayDateHeading : styles.dateHeading}>
        {date} {today ? <span className={styles.todayMessage}> Today</span> : ""}
      </h4>
      <div
        className={styles.eventBufferClass}
        style={{
          marginBlockStart: `calc((1.85em + 2px) * ${invisExtendedEvents})` // Make this a class and change font size
        }}
      >
        {uniqBy(extendedEvents, "event.title").map((e, j) => {
          if (eventIdToRow.get(e.event.event_id) == undefined) {
            eventIdToRow.set(e.event.event_id, row)
          }
          if (extendedEvents.some((it) => it.event.title == e.event.title))
            return (
              <div
                key={j}
                className={styles.extendedEvent}
                style={{
                  width: `calc(100% * ${e.length} + ${MARGIN_RIGHT_PERCENT}% * ${e.length - 1})`,
                  backgroundColor: getEventColour(e.event.event_type)[0],
                  color: getEventColour(e.event.event_type)[1],
                  border: highlightedEvents.has(e.event.event_id) ? "3px solid rgb(255, 255, 255)" : "",
                  marginBlockEnd: "2px",
                  zIndex: 100 - invisExtendedEvents
                }}
              >
                <p className={styles.extendedEventDescriptions}>
                  <b>
                    {e.introText} <b className={styles.periodTitle}>{e.event.period}</b>
                    <b className={styles.shortPeriodTitle}>{getShortenPeriodName(e.event.period)}</b>:{" "}
                  </b>
                  {e.event.url ? (
                    <>
                      <a href={e.event.url} target="_blank" rel="noopener noreferrer" className={styles.desktopLink}>
                        {e.event.title}
                        {". "}
                      </a>
                      <p className={styles.mobileLink}>
                        {e.event.title}
                        {". "}
                      </p>
                      <a href={e.event.url} target="_blank" rel="noopener noreferrer">
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                      </a>
                    </>
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
        {uniqBy(events, "title").map((e, i) => {
          eventIdToRow.set(e.event_id, row)
          return (
            <div
              key={i}
              className={styles.event}
              style={{
                marginBlockEnd: showPeriod[i + 1] ? "0.3em" : "0.1em",
                backgroundColor: getEventColour(e.event_type)[0],
                color: getEventColour(e.event_type)[1],
                border: highlightedEvents.has(e.event_id) ? "3px solid rgb(255, 255, 255)" : ""
              }}
            >
              <p
                className={`${styles.eventDescriptions} ${styles.truncate} ${events.length > 2 ? styles.lineClampShort : styles.lineClampLong}`}
              >
                {showPeriod[i] && (
                  <>
                    {" "}
                    <b className={styles.periodTitle}>{e.period}: </b>{" "}
                    <b className={styles.shortPeriodTitle}>{getShortenPeriodName(e.period)}: </b>
                  </>
                )}
                {e.url ? (
                  <>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.desktopLink}
                      style={{ color: getEventColour(e.event_type)[1] }}
                    >
                      {e.title}
                      {". "}
                    </a>
                    <p className={styles.mobileLink} style={{ color: getEventColour(e.event_type)[1] }}>
                      {e.title}
                      {". "}
                    </p>
                    <a
                      href={e.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: getEventColour(e.event_type)[1] }}
                    >
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  </>
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
    </>
  )
}

export default Day
