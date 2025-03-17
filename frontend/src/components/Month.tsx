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
  event_type: string;
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
  prevMonthLength: number;
  monthName: string;
  todayMonth: boolean;
  monthNum: number;
  events: Event[];
}

const Month = ({
  startDay,
  monthLength,
  prevMonthLength,
  monthNum,
  monthName,
  todayMonth,
  events,
}: Props) => {
  const days: Event[][] = Array(monthLength)
    .fill(null)
    .map(() => Array());
  const extendedEvents: ExtendedEventAndLength[][] = Array(monthLength)
    .fill(null)
    .map(() => Array());
  const invisExtendedEvents: number[] = Array(monthLength).fill(0);
  const fillerDays = Array();
  const today: Date = new Date();
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
  let startFillCount: number = prevMonthLength - startDay + 1;
  let endFillCount: number = 1;

  // let marginStart: string = "0";
  // let paddingStart: string = "0";
  // let eEHeight: string = "0";
  // let gapBackground: string = "none";

  for (let i = 0; i < startDay; i++) {
    fillerDays.push(<div key={i}></div>);
  }

  return (
    <>
      <h2
        style={{
          position: "sticky",
          top: "0em",
          zIndex: "3002",
          backgroundColor: "#2f033d",
          marginBlockStart: "0em",
          marginBlockEnd: "1.2em", // 0.63
          paddingBlockStart: "1.725em",
          paddingBlockEnd: "0.105em",
          paddingInlineStart: "5.8em",
          borderBottomWidth: "50%",
          borderBottom: "1px solid rgba(255, 255, 255, 0.56)",
        }}
      >
        {monthName}
      </h2>
      <div className="container">
        {Array(Math.ceil((monthLength + fillerDays.length) / 7) * 2)
          .fill(null)
          .map((_, row) => {
            return Array(7)
              .fill(null)
              .map((_, col) => {
                if (row % 2 === 0) {
                  // If its a day row.
                  if (
                    (row === 0 && col < startDay) ||
                    dayCount >= monthLength
                  ) {
                    // If first row or after last day, fill with filler days.
                    return (
                      <div
                        key={col}
                        className="filler-day"
                        style={{ color: "rgb(146, 146, 146)" }}
                      >
                        <h4>{row === 0 ? startFillCount++ : endFillCount++}</h4>
                      </div>
                    );
                  } else {
                    return (
                      <div
                        key={col}
                        className="day"
                        style={{
                          border:
                            todayMonth && dayCount + 1 === today.getDate()
                              ? "1px solid red"
                              : "none",
                          minHeight: `${
                            160 -
                            (invisExtendedEvents[eECount] +
                              extendedEvents[eECount].length) *
                              10
                          }px`,
                        }}
                      >
                        <Day
                          date={`${dayCount + 1}`}
                          events={days[dayCount++]}
                        />
                      </div>
                    );
                  }
                } else {
                  // If its an event row.
                  if ((row === 1 && col < startDay) || eECount >= monthLength) {
                    return (
                      // If first row or after last day, fill with filler days.
                      <div key={col} style={{ marginBlockEnd: "3%" }}></div>
                    );
                  } else {
                    // if (
                    //   invisExtendedEvents[eECount] !== 0 &&
                    //   extendedEvents[eECount].length === 0
                    // ) {
                    //   // Prev extended events still going but not putting any new ones.
                    //   marginStart = "0";
                    //   paddingStart = `${
                    //     invisExtendedEvents[eECount] * 1.5 * 1.04
                    //   }rem`;
                    //   eEHeight = "0";
                    //   gapBackground =
                    //     "repeating-linear-gradient(-45deg, transparent 0 3px, var(--timetable-stripes-dark) 3px 6px)";
                    // } else if (
                    //   invisExtendedEvents[eECount] === 0 &&
                    //   extendedEvents[eECount].length === 0
                    // ) {
                    //   // Empty space.
                    //   marginStart = "0";
                    //   paddingStart = "0";
                    //   eEHeight = "80%";
                    //   gapBackground = "green";
                    // } else {
                    //   // No prev events or putting new event in.
                    //   marginStart = `${
                    //     invisExtendedEvents[eECount] * 1.5 * 1.04
                    //   }rem`;
                    //   paddingStart = "0";
                    //   eEHeight = "auto";
                    //   gapBackground = "none";
                    // }
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
