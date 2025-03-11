import "./ExtendedEvent.css";

interface Event {
  event_id: number;
  title: string;
  period: string;
  sub_period: string;
  start_date: Date;
  end_date: Date;
  url: string;
}

interface Props {
  event: Event;
  introText: string;
  eventLength: number;
}

const ExtendedEvent = ({ event, introText, eventLength }: Props) => {
  return (
    <>
      <div
        className="extended-event"
        style={{
          width: `${100 * eventLength + 3.61 * (eventLength - 1) - 4}%`,
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
