import "./ExtendedEvent.css";
import { Event } from "../App";
import { getEventColour } from "./Day";

interface Props {
  event: Event;
  introText: string;
  eventLength: number;
  highlighted: boolean;
}

const ExtendedEvent = ({
  event,
  introText,
  eventLength,
  highlighted,
}: Props) => {
  const paddingPercent: number = 0; // Padding within the event.
  const rowGapPercentOfDayWdith: number = 3.75; // Trial and error, close enough.

  return (
    <>
      <div
        className="extended-event"
        style={{
          width: `${
            100 * eventLength +
            rowGapPercentOfDayWdith * (eventLength - 1) -
            paddingPercent * 2 // Maybe use view width unit.
          }%`,
          backgroundColor: getEventColour(event.event_type)[0],
          color: getEventColour(event.event_type)[1],
          border: highlighted ? "2px solid rgb(255, 255, 255)" : "",
        }}
      >
        <p className="extended-event-descriptions">
          <b>
            {introText} {event.period}:{" "}
          </b>
          {event.url ? (
            <a href={event.url} target="_blank" rel="noopener noreferrer">
              {event.title}
            </a>
          ) : (
            event.title
          )}
          .
        </p>
      </div>
    </>
  );
};

export default ExtendedEvent;
