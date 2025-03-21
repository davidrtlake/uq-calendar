import Day from "./Day";
import ExtendedEvent from "./ExtendedEvent";
import { Event } from "../App";
import "./Month.css";
import "./ExtendedEvent.css";

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
  yearName: string;
  todayMonth: boolean;
  monthNum: number;
  events: Event[];
  monthLabels: string[];
  getWeekMap: (y: string) => Map<string, HTMLDivElement>;
}

const Month = ({
  startDay,
  monthLength,
  prevMonthLength,
  monthNum,
  monthName,
  yearName,
  todayMonth,
  events,
  monthLabels,
  getWeekMap,
}: Props) => {
  const days: Event[][] = Array(monthLength)
    .fill(null)
    .map(() => Array());
  const extendedEvents: ExtendedEventAndLength[][] = Array(monthLength)
    .fill(null)
    .map(() => Array());
  const invisExtendedEvents: number[] = Array(monthLength).fill(0);
  const publicHolidayDays: boolean[] = Array(monthLength).fill(false);
  const fillerDays = Array();
  const today: Date = new Date();
  const labelColours = (label: string): string => {
    switch (label) {
      case "SWOTVAC":
        return "rgba(255, 204, 156, 0.31)";
      case "EXAM":
        return "rgba(231, 222, 126, 0.31)";
      case "ORIENTATION":
        return "rgba(56, 92, 146, 0.31)";
      case "MIDSEM":
      case "BREAK":
        return "rgba(255, 118, 221, 0.31)";
      default:
        return "rgba(255, 255, 255, 0.31)";
    }
  };
  let startDate: Date;
  let endDate: Date;
  let distanceToNextSunday: number;
  let remainingTime: number;
  let currDay: number;
  let currDate: number;
  let introText: string;
  let eELength: number;
  let labelIndex: number = 0;
  let toggle: boolean = true;
  let publicHoliday: boolean = false;

  // Sort events into single or multi-day.
  events.forEach((e, i) => {
    introText = "";
    // If starts or ends in another month, adjust the start or end date.
    if (e.start_date.getMonth() !== monthNum) {
      // If starts in previous month.
      introText = "Cont.";
      startDate = new Date(e.end_date.getFullYear(), monthNum, 1);
    } else {
      startDate = e.start_date;
    }
    if (e.end_date.getMonth() !== monthNum) {
      // If ends in next month.
      endDate = new Date(e.start_date.getFullYear(), monthNum, monthLength);
    } else {
      endDate = e.end_date;
    }

    publicHoliday = false;
    if (e.title.toLocaleLowerCase().includes("public holiday")) {
      publicHoliday = true;
    }

    if (startDate.getDate() === endDate.getDate()) {
      // If a regular single day event.
      days[startDate.getDate() - 1].push(e);
      if (publicHoliday) {
        publicHolidayDays[startDate.getDate() - 1] = true;
      }
    } else {
      // An extended event.
      const eventLength = endDate.getDate() - startDate.getDate();
      distanceToNextSunday = 7 - endDate.getDay();
      remainingTime = eventLength + 1;
      currDay = startDate.getDay();
      currDate = startDate.getDate();
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
        });
        if (publicHoliday) {
          publicHolidayDays[currDate - 1] = true;
        }
        toggle = true;
        for (let j = 0; j < i; j++) {
          if (events[j].title === events[i].title) {
            // Duplicate event then only count one of the events to invisExtendedEvents.
            toggle = false;
          }
        }
        if (toggle) {
          for (let i = currDate; i < currDate + eELength - 1; i++) {
            invisExtendedEvents[i]++;
            if (publicHoliday) {
              publicHolidayDays[i] = true;
            }
          }
        }
        currDate += distanceToNextSunday;
        currDay = 0;
        remainingTime -= distanceToNextSunday;
        introText = "Cont.";
      }
    }
  });

  let dayCount: number = 0;
  let eECount: number = 0;
  let startFillCount: number = prevMonthLength - startDay + 1;
  let endFillCount: number = 1;
  let maxRowExtendedEventDepth: number;

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
            // Get the max number of extended events that run concurrently in that row.
            if (row % 2 === 0) {
              maxRowExtendedEventDepth = 0;
              for (
                let i = dayCount;
                i < Math.min(dayCount + 7, monthLength);
                i++
              ) {
                maxRowExtendedEventDepth = Math.max(
                  maxRowExtendedEventDepth,
                  invisExtendedEvents[i] + extendedEvents[i].length
                );
              }
            }
            return Array(8)
              .fill(null)
              .map((_, col) => {
                if (row % 2 === 0) {
                  // If its a day row.
                  if (col === 0) {
                    // Start of each row show the teaching week label.
                    return (
                      <div
                        key={col}
                        ref={(node) => {
                          const map = getWeekMap(yearName);
                          if (node) {
                            map.set(`${monthName}-${row}`, node!);
                          } else {
                            map.delete(`${monthName}-${row}`);
                          }
                        }}
                        style={{
                          width: "25px",
                          lineHeight: "100%",
                          margin: "auto",
                          paddingTop:
                            row === 0 && fillerDays.length > 0
                              ? "0px"
                              : `${
                                  Math.min(2, extendedEvents[dayCount].length) *
                                  25
                                }px`,
                          fontFamily: "fantasy",
                          color: labelColours(monthLabels[labelIndex]),
                        }}
                      >
                        {!Number.isNaN(parseInt(monthLabels[labelIndex])) ? (
                          <div
                            style={{
                              fontSize:
                                row === 0 && fillerDays.length > 0
                                  ? "12px"
                                  : "16px",
                              marginBottom:
                                row === 0 && fillerDays.length > 0
                                  ? "12px"
                                  : "20px",
                            }}
                          >
                            WEEK
                          </div>
                        ) : (
                          ""
                        )}
                        <div
                          style={{
                            fontSize:
                              row === 0 && fillerDays.length > 0
                                ? "50px"
                                : "70px",
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginBottom: !Number.isNaN(
                              parseInt(monthLabels[labelIndex])
                            )
                              ? "20px"
                              : "auto",
                            marginLeft:
                              parseInt(monthLabels[labelIndex]) === 1 ||
                              parseInt(monthLabels[labelIndex]) === 7
                                ? "4px"
                                : "auto",
                          }}
                        >
                          {monthLabels[labelIndex++]}
                        </div>
                      </div>
                    );
                  } else if (
                    (row === 0 && col - 1 < startDay) ||
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
                    // Regular day.
                    return (
                      <div
                        key={col}
                        className="day"
                        style={{
                          minHeight: `${Math.max(
                            130,
                            150 - maxRowExtendedEventDepth * 10
                          )}px`,
                          background: publicHolidayDays[dayCount]
                            ? "repeating-linear-gradient(-45deg, transparent 0 3px, var(--timetable-stripes-public-holiday) 3px 6px)"
                            : "",
                        }}
                      >
                        <Day
                          date={`${dayCount + 1}`}
                          today={todayMonth && dayCount + 1 === today.getDate()}
                          events={days[dayCount++]}
                        />
                      </div>
                    );
                  }
                } else {
                  // If its an extended event row.
                  if (
                    (row === 1 && col - 1 < startDay) ||
                    eECount >= monthLength ||
                    col === 0
                  ) {
                    return (
                      // If first row, after last day, or teaching week column (0), add filler day.
                      <div key={col} style={{ marginBlockEnd: "3%" }}></div>
                    );
                  } else {
                    return (
                      <div
                        key={col}
                        style={{
                          marginBlockEnd:
                            extendedEvents[eECount].length === 0 &&
                            invisExtendedEvents[eECount] === 0
                              ? "5%"
                              : "5%",
                          paddingBlockEnd:
                            extendedEvents[eECount].length === 0 &&
                            invisExtendedEvents[eECount] === 0
                              ? "0%"
                              : "2%",
                          marginBlockStart: `${
                            Math.round(invisExtendedEvents[eECount] * 25) // Just enough to put a gap between events. 25 comes from height of extended event.
                          }px`,
                          background:
                            "repeating-linear-gradient(-45deg, transparent 0 3px, var(--timetable-stripes-dark) 3px 6px)",
                        }}
                      >
                        {extendedEvents[eECount++].map((e, j) => {
                          for (let k = 0; k < j; k++) {
                            if (
                              extendedEvents[eECount - 1][k].event.title ===
                              extendedEvents[eECount - 1][j].event.title
                            ) {
                              // Duplicate event then only show one.
                              return;
                            }
                          }
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
