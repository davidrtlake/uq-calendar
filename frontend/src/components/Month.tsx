import Day from "./Day";
import "./Components.css";

// Define a type for your events
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
  startDay: number;
  monthLength: number;
  monthName: string;
  events: Event[];
}

const Month = ({ startDay, monthLength, monthName, events }: Props) => {
  const daysOfTheWeek: string[] = [
    "Sun",
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ];
  const days: Event[][] = Array(monthLength)
    .fill(null)
    .map(() => Array());
  const fillerDays = Array();

  events.forEach((e) => {
    if (e.start_date === e.end_date) {
      days[e.start_date.getDate() - 1].push(e);
    } else {
      for (let i = e.start_date.getDate() - 1; i < e.end_date.getDate(); i++) {
        days[i].push(e);
      }
    }
  });

  for (let i = 0; i < startDay; i++) {
    fillerDays.push(<div key={i}></div>);
  }

  return (
    <>
      <h2>{monthName}</h2>
      <div className="container">
        {daysOfTheWeek.map((day, i) => (
          <div key={i}>{day}</div>
        ))}
        {fillerDays}
        {days.map((dayList, i) => {
          return (
            <div key={i}>
              <Day date={`${i + 1}`} events={dayList} />
            </div>
          );
        })}
      </div>
    </>
  );
};

export default Month;
