import Day from "./Day";
import ExtendedEvent from "./ExtendedEvent";
import "./Month.css";
import "./ExtendedEvent.css";

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

interface ExtendedEventAndLength {
  event: Event;
  introText: string;
  length: number;
}

interface Props {
  startDay: number;
  monthLength: number;
  monthName: string;
  monthNum: number;
  events: Event[];
}

const Month = ({
  startDay,
  monthLength,
  monthNum,
  monthName,
  events,
}: Props) => {
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
  const extendedEvents: ExtendedEventAndLength[][] = Array(monthLength)
    .fill(null)
    .map(() => Array());
  const invisExtendedEvents: number[] = Array(monthLength).fill(0);
  const fillerDays = Array();
  let startDate: Date;
  let endDate: Date;
  let distanceToNextSunday: number;
  let remainingTime: number;
  let currDay: number;
  let currDate: number;
  let introText: string;
  let eELength: number;

  events.forEach((e) => {
    // If starts or ends in another month, adjust the start or end date.
    if (e.start_date.getMonth() !== monthNum) {
      startDate = new Date(
        `${e.end_date.getFullYear()}-${
          monthNum < 10 ? `0${monthNum}` : monthNum
        }-01`
      );
    } else {
      startDate = e.start_date;
    }
    if (e.end_date.getMonth() !== monthNum) {
      endDate = new Date(
        `${e.start_date.getFullYear()}-${
          monthNum < 10 ? `0${monthNum}` : monthNum
        }-${monthLength}`
      );
    } else {
      endDate = e.end_date;
    }

    if (startDate.getDate() === endDate.getDate()) {
      // If a regular single day event.
      days[startDate.getDate() - 1].push(e);
    } else {
      // An extended event.
      const eventLength = endDate.getDate() - startDate.getDate();
      distanceToNextSunday = 7 - endDate.getDay();
      remainingTime = eventLength + 1;
      currDay = startDate.getDay();
      currDate = startDate.getDate();
      introText = "";
      // Keep track of days in between that will be affected.
      while (remainingTime > 0) {
        distanceToNextSunday = 7 - currDay;
        eELength =
          remainingTime < distanceToNextSunday
            ? remainingTime
            : distanceToNextSunday;
        extendedEvents[currDate - 1].push({
          event: e,
          introText: introText,
          length: eELength,
        }); // Need to know if overflow has happened.
        for (let i = currDate; i < currDate + eELength - 1; i++) {
          invisExtendedEvents[i]++;
        }
        currDate += distanceToNextSunday;
        currDay = 0;
        remainingTime -= distanceToNextSunday;
        introText = "Cont.";
        // Fill the days afterwards with space.
      }
    }
  });

  let dayCount: number = 0;
  let eECount: number = 0;

  for (let i = 0; i < startDay; i++) {
    fillerDays.push(<div key={i}></div>);
  }

  return (
    <>
      <h2>{monthName}</h2>
      <div className="container">
        {daysOfTheWeek.map((day, i) => (
          <div
            key={i}
            style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.56)" }}
          >
            {day}
          </div>
        ))}
        {/* {fillerDays} */}
        {Array(Math.ceil((monthLength + fillerDays.length) / 7) * 2)
          .fill(null)
          .map((_, row) => {
            return Array(7)
              .fill(null)
              .map((_, col) => {
                if (row % 2 === 0) {
                  if (
                    (row === 0 && col < startDay) ||
                    dayCount >= monthLength
                  ) {
                    return <div key={col}></div>;
                  } else {
                    return (
                      <div key={col}>
                        <div className="day">
                          <Day
                            date={`${dayCount + 1}`}
                            events={days[dayCount++]}
                          />
                        </div>
                      </div>
                    );
                  }
                } else {
                  if ((row === 1 && col < startDay) || eECount >= monthLength) {
                    return (
                      <div key={col} style={{ marginBlockEnd: "3%" }}></div>
                    );
                  } else {
                    return (
                      <div
                        key={col}
                        style={{
                          marginBlockEnd: "5%",
                          marginBlockStart: `${
                            invisExtendedEvents[eECount] * 1.5 * 1.04
                          }rem`,
                        }}
                      >
                        {extendedEvents[eECount++].map((e, j) => {
                          return (
                            <ExtendedEvent
                              key={j}
                              event={e.event}
                              introText={e.introText}
                              eventLength={e.length}
                            />
                          );
                        })}
                      </div>
                    );
                  }
                }
              });
          })}
      </div>
    </>
  );
};

export default Month;
