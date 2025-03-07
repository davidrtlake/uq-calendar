import "./Day.css";

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
  const showPeriod: boolean[] = Array();
  let prevPeriod: string = "";

  events.forEach((e) => {
    showPeriod.push(e.period !== prevPeriod);
    prevPeriod = e.period;
  });

  showPeriod.push(false);

  return (
    <>
      <h4>{date}</h4>
      {events.map((e, i) => (
        <div
          key={i}
          className="event"
          style={{ marginBlockEnd: showPeriod[i + 1] ? "0.5em" : "0.2em" }}
        >
          <p
            className={`event-descriptions ${
              events.length > 2 ? "truncate-2" : "truncate-3"
            }`}
          >
            {showPeriod[i] && <b className="period-title">{e.period}: </b>}
            {e.url ? (
              <a href={e.url} target="_blank" rel="noopener noreferrer">
                {e.title}
              </a>
            ) : (
              e.title
            )}
          </p>
        </div>
      ))}
    </>
  );
};

export default Day;
