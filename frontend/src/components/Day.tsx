import "./Day.css";
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

export const getEventColour = (eventType: string): string[] => {
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
  const showPeriod: boolean[] = Array();
  let prevPeriod: string = "";

  events.forEach((e) => {
    showPeriod.push(e.period !== prevPeriod);
    prevPeriod = e.period;
  });

  showPeriod.push(false);

  const paddingPercent: number = 0; // Padding within the event.
  const rowGapPercentOfDayWdith: number = 3.75; // Trial and error, close enough.

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
            Math.round(invisExtendedEvents * 25 + (invisExtendedEvents ? 1 : 0)) // Just enough to put a gap between events. 25 comes from height of extended event.
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
              className="extended-event"
              style={{
                width:
                  widthLevel <= 2
                    ? `${
                        100 * e.length +
                        rowGapPercentOfDayWdith * (e.length - 1) -
                        paddingPercent * 2 // Maybe use view width unit.
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
              <p className="extended-event-descriptions">
                <b>
                  {e.introText} {e.event.period}:{" "}
                </b>
                {e.event.url ? (
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
              className="event"
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
                className={"event-descriptions truncate"}
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
                {showPeriod[i] && <b className="period-title">{e.period}: </b>}
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
          );
        })}
      </div>
    </>
  );
};

export default Day;
