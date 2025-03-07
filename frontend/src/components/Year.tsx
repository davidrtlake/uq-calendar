import Month from "./Month";
import "./Year.css";

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
  year: number;
  currDay: number;
  events: Event[];
}

const Year = ({ year, currDay, events }: Props) => {
  const monthLens: number[] = [
    31,
    28 + (year % 4 === 0 ? 1 : 0),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  const monthNames: string[] = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthStartDays: number[] = Array();

  monthLens.forEach((length) => {
    monthStartDays.push(currDay % 7);
    currDay += length;
  });

  return (
    <>
      <div>
        <h1>{year}</h1>
        <div className="flex-container-column">
          {monthLens.map((length, i) => (
            <div key={i} className="month">
              <Month
                startDay={monthStartDays[i]}
                monthLength={length}
                monthName={monthNames[i]}
                events={events.filter((row) => {
                  return row.start_date.getMonth() === i;
                })}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Year;
