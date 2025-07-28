import Day from "./Day";
import { Event } from "../App";
import styles from  "../styles/Month.module.css";

export interface ExtendedEventAndLength {
  event: Event;
  introText: string;
  length: number;
}

interface Props {
  startDay: number;
  todayRef: React.RefObject<HTMLDivElement>;
  monthLength: number;
  prevMonthLength: number;
  monthName: string;
  yearName: string;
  todayMonth: boolean;
  monthNum: number;
  events: Event[];
  highlightedEvents: Map<number, boolean>;
  monthLabels: string[];
  getWeekMap: (y: string) => Map<string, HTMLDivElement>;
  getEventIDMap: () => Map<number, number>;
  widthLevel: number;
}

const Month = ({
  startDay,
  todayRef,
  monthLength,
  prevMonthLength,
  monthNum,
  monthName,
  yearName,
  todayMonth,
  events,
  highlightedEvents,
  monthLabels,
  getWeekMap,
  getEventIDMap,
  widthLevel,
}: Props) => {
  const days: Event[][] = Array(monthLength)
    .fill(null)
    .map(() => []);
  const extendedEvents: ExtendedEventAndLength[][] = Array(monthLength)
    .fill(null)
    .map(() => []);
  const invisExtendedEvents: number[] = Array(monthLength).fill(0);
  const publicHolidayDays: boolean[] = Array(monthLength).fill(false);
  const fillerDays = [];
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
            invisExtendedEvents[i] =
              invisExtendedEvents[currDate - 1] +
              extendedEvents[currDate - 1].length;
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
  let startFillCount: number = prevMonthLength - startDay + 1;
  let endFillCount: number = 1;
  let maxRowExtendedEventDepth: number;

  for (let i = 0; i < startDay; i++) {
    fillerDays.push(<div key={i}></div>);
  }

  return (
    <>
      <h2 className={styles.monthTitle}>{monthName}</h2>
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
                // If its a day row.
                if (row % 2 === 0) {
                  // Start of each row show the teaching week label.
                  if (col === 0) {
                    return (
                      <div
                        key={col}
                        id={`${monthNum}-${row}`}
                        ref={(node) => {
                          const map = getWeekMap(yearName);
                          if (node) {
                            map.set(`${monthNum}-${row}`, node!);
                          } else {
                            map.delete(`${monthNum}-${row}`);
                          }
                        }}
                        className={styles.teachingWeekLabel}
                        style={{
                          lineHeight: "100%",
                          margin: "auto",
                          paddingTop:
                            row === 0 && fillerDays.length > 0
                              ? "0px"
                              : `${
                                  Math.min(2, extendedEvents[dayCount].length) *
                                  25
                                }px`,
                          fontFamily:
                            "Impact, Haettenschweiler, 'Arial Bold', sans-serif",
                          fontWeight: "bold",
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
                              (row === 0 && fillerDays.length > 0) ||
                              (Number.isNaN(
                                parseInt(monthLabels[labelIndex])
                              ) &&
                                widthLevel >= 3)
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
                        className={styles.fillerDay}
                        style={{ color: "rgb(146, 146, 146)" }}
                      >
                        <h4>{row === 0 ? startFillCount++ : endFillCount++}</h4>
                      </div>
                    );
                  } else {
                    // Regular day.
                    dayCount++;
                    return (
                      <div
                        key={col}
                        className={styles.day}
                        ref={
                          todayMonth && dayCount + 1 === today.getDate()
                            ? todayRef
                            : null
                        }
                        style={{
                          background: publicHolidayDays[dayCount - 1]
                            ? "repeating-linear-gradient(-45deg, transparent 0 3px, var(--timetable-stripes-public-holiday) 3px 6px)"
                            : "",
                          marginBlockEnd: "3%",
                        }}
                      >
                        <Day
                          date={`${dayCount}`}
                          row={row}
                          today={todayMonth && dayCount === today.getDate()}
                          events={days[dayCount - 1]}
                          extendedEvents={extendedEvents[dayCount - 1]}
                          invisExtendedEvents={
                            invisExtendedEvents[dayCount - 1]
                          }
                          highlightedEvents={highlightedEvents}
                          getEventIDMap={getEventIDMap}
                          widthLevel={widthLevel}
                        />
                      </div>
                    );
                  }
                } else {
                  // If its a gap row.
                  return (
                    // Gap element.
                    <div className={styles.gapElement} key={col}></div>
                  );
                }
              });
          })}
      </div>
    </>
  );
};

export default Month;
