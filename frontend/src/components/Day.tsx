import "./Components.css";

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
  date: string;
  events: Event[];
}

const Day = ({ date, events }: Props) => {
  return (
    <>
      <div className="day">
        <h4 className="date-num">{date}</h4>
        {events.map((e, i) => (
          <p key={i} className="truncate event">
            {e.url ? (
              <a href={e.url} target="_blank" rel="noopener noreferrer">
                {e.title}
              </a>
            ) : (
              e.title
            )}
          </p>
        ))}
      </div>
    </>
  );
};

export default Day;
