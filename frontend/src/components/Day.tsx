import "./Day.css";
import { Event } from "../App";

interface Props {
  date: string;
  row: number;
  today: boolean;
  events: Event[];
  highlightedEvents: Map<number, boolean>;
  getEventIDMap: () => Map<number, number>;
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
  highlightedEvents,
  getEventIDMap,
}: Props) => {
  const showPeriod: boolean[] = Array();
  let prevPeriod: string = "";

  events.forEach((e) => {
    showPeriod.push(e.period !== prevPeriod);
    prevPeriod = e.period;
  });

  showPeriod.push(false);

  return (
    <>
      <h4
        style={{
          backgroundColor: today ? "#a8c7fa" : "none",
          color: today ? "#062e6f" : "white",
          borderRadius: today ? "0.2em" : "0",
        }}
      >
        {date} {today ? " Today" : ""}
      </h4>
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
              className={`event-descriptions ${
                events.length > 2 ? "truncate-2" : "truncate-3"
              }`}
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
                </a>
              ) : (
                e.title
              )}
              .
            </p>
          </div>
        );
      })}
    </>
  );
};

export default Day;
