import styles from  "../styles/Day.module.css";
import { Event } from "../App";
import { ExtendedEventAndLength } from "./Month";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUpRightFromSquare } from "@fortawesome/free-solid-svg-icons";

interface Props {
  date: string;
  row: number;
  today: boolean;
  events: Event[];
  extendedEvents: ExtendedEventAndLength[];
  invisExtendedEvents: number;
  highlightedEvents: Map<number, boolean>;
  getEventIDMap: () => Map<number, number>;
  widthLevel: number;
}

const getEventColour = (eventType: string): string[] => {
  switch (eventType) {
    case "Public holiday":
      return ["rgb(110, 100, 84)", "rgb(255, 255, 255)"];
    case "Examination period":
      return ["rgb(231, 222, 126)", "rgb(71, 70, 55)"];
    case "Starting date":
      return ["rgb(74, 109, 68)", "rgb(255, 255, 255)"];
    case "Closing date":
      return ["rgb(151, 34, 54)", "rgb(255, 255, 255)"];
    case "Graduation period":
      return ["rgb(244, 122, 62)", "rgb(255, 255, 255)"];
    case "Finalisation of grades":
      return ["rgb(253, 170, 170)", "rgb(49, 20, 20)"];
    default:
      return ["rgb(56, 92, 146)", "rgb(255, 255, 255)"];
  }
};

const Day = ({
  date,
  row,
  today,
  events,
  extendedEvents,
  invisExtendedEvents,
  highlightedEvents,
  getEventIDMap,
  widthLevel,
}: Props) => {
  const showPeriod: boolean[] = [];
  let prevPeriod: string = "";

  events.forEach((e) => {
    showPeriod.push(e.period !== prevPeriod);
    prevPeriod = e.period;
  });

  function shortenPeriodName(periodName: string): string {
    const splitName: string[] = periodName.split(" ");
    if (periodName.toLowerCase().startsWith("semester")) {
      splitName[1] = "Sem.".concat(splitName[1]);
      return splitName.slice(1).join(" ");
    } else if (periodName.toLowerCase().startsWith("summer semester")) {
      splitName[1] = "Sem.";
    }
    return splitName.join(" ");
  }

  showPeriod.push(false);

  const PADDING_PERCENTAGE = 0; // Padding within the event.
  const ROW_GAP_PERCENTAGE_OF_DAY_WIDTH = 3.75; // Trial and error, close enough.

  return (
    <>
      <h4
        style={{
          backgroundColor: today ? "#a8c7fa" : "none",
          color: today ? "#062e6f" : "white",
          borderRadius: today ? "0.2em" : "0",
        }}
      >
        {date} {today && widthLevel < 2 ? " Today" : ""}
      </h4>
      <div
        style={{
          marginBlockStart: `${
            Math.round(
              invisExtendedEvents * (widthLevel < 3 ? 25 : 17) +
                (invisExtendedEvents ? 1 : 0)
            ) // Just enough to put a gap between events. 25 comes from height of extended event.
          }px`,
        }}
      >
        {extendedEvents.map((e, j) => {
          const iDMap = getEventIDMap();
          if (iDMap.get(e.event.event_id) === -1) {
            iDMap.set(e.event.event_id, row);
          }
          for (let k = 0; k < j; k++) {
            if (
              extendedEvents[k].event.title === extendedEvents[j].event.title
            ) {
              // Duplicate event then only show one.
              return;
            }
          }
          return (
            <div
              key={j}
              className={styles.extendedEvent}
              style={{
                width:
                  widthLevel <= 2
                    ? `${
                        100 * e.length +
                        ROW_GAP_PERCENTAGE_OF_DAY_WIDTH * (e.length - 1) -
                        PADDING_PERCENTAGE * 2 // Maybe use view width unit.
                      }%`
                    : `calc(calc(100vw / 7 - 1px) * ${e.length} + ${
                        e.length - 1
                      }px)`,
                backgroundColor: getEventColour(e.event.event_type)[0],
                color: getEventColour(e.event.event_type)[1],
                border: highlightedEvents.get(e.event.event_id)
                  ? "3px solid rgb(255, 255, 255)"
                  : "",
                marginBlockEnd: "2px",
                zIndex: 100 - invisExtendedEvents,
              }}
            >
              <p className={styles.extendedEventDescriptions}>
                <b>
                  {e.introText}{" "}
                  {widthLevel < 3
                    ? e.event.period
                    : shortenPeriodName(e.event.period)}
                  :{" "}
                </b>
                {widthLevel < 3 ? (
                  e.event.url ? (
                    <a
                      href={e.event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {e.event.title}
                      {". "}
                      <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                    </a>
                  ) : (
                    <>
                      {e.event.title}
                      {"."}
                    </>
                  )
                ) : (
                  <>
                    {e.event.title}
                    {"."}
                    {e.event.url && (
                      <a
                        href={e.event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {" "}
                        <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
                      </a>
                    )}
                  </>
                )}
              </p>
            </div>
          );
        })}
        {events.map((e, i) => {
          const iDMap = getEventIDMap();
          iDMap.set(e.event_id, row);
          for (let j = 0; j < i; j++) {
            if (events[j].title === events[i].title) {
              // Duplicate event then only show one.
              return;
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
                border: highlightedEvents.get(e.event_id)
                  ? "3px solid rgb(255, 255, 255)"
                  : "",
              }}
            >
              <p
                className={`${styles.eventDescriptions} ${styles.truncate}`}
                style={{
                  WebkitLineClamp:
                    widthLevel > 2
                      ? events.length > 2
                        ? "5"
                        : "7"
                      : events.length > 2
                      ? "2"
                      : "3",
                  lineClamp:
                    widthLevel > 2
                      ? events.length > 2
                        ? "5"
                        : "7"
                      : events.length > 2
                      ? "2"
                      : "3",
                  // fontSize: widthLevel > 1 ? "1em" : "1em",
                }}
              >
                {showPeriod[i] && (
                  <b className={styles.periodTitle}>
                    {widthLevel < 3 ? e.period : shortenPeriodName(e.period)}:{" "}
                  </b>
                )}
                {widthLevel < 3 ? (
                  e.url ? (
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
                  )
                ) : (
                  <>
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
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Day;
