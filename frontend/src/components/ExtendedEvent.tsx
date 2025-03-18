import "./ExtendedEvent.css";
import { Event } from "../App";

interface Props {
  event: Event;
  introText: string;
  eventLength: number;
}

const ExtendedEvent = ({ event, introText, eventLength }: Props) => {
  const getEventColour = (eventType: string): string[] => {
    switch (eventType) {
      case "Public holiday":
        return ["rgb(110, 100, 84)", "rgb(255, 255, 255)"];
      case "Examination period":
        return ["rgb(216, 212, 165)", "rgb(71, 70, 55)"];
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
  const paddingPercent: number = 2; //
  const rowGapPercentOfDayWdith: number = 3.85; // Trial and error, close enough.

  return (
    <>
      <div
        className="extended-event"
        style={{
          width: `${
            100 * eventLength +
            rowGapPercentOfDayWdith * (eventLength - 1) -
            paddingPercent * 2
          }%`,
          backgroundColor: getEventColour(event.event_type)[0],
          color: getEventColour(event.event_type)[1],
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
        </p>
      </div>
    </>
  );
};

export default ExtendedEvent;
