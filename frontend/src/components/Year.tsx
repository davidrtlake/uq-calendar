import Month from "./Month";
import { Event } from "../App";
import "./Year.css";

interface Props {
  year: number;
  currDay: number;
  todayRef: React.RefObject<HTMLDivElement>;
  monthNames: string[];
  getMap: (y: string) => Map<string, HTMLDivElement>;
  getWeekMap: (y: string) => Map<string, HTMLDivElement>;
  getEventIDMap: () => Map<number, number>;
  events: Event[];
  highlightedEvents: Map<number, boolean>;
  yearLabels: object;
  widthLevel: number;
}

const Year = ({
  year,
  currDay,
  todayRef,
  monthNames,
  getMap,
  getWeekMap,
  getEventIDMap,
  events,
  highlightedEvents,
  yearLabels,
  widthLevel,
}: Props) => {
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
  const monthStartDays: number[] = [];
  const today: Date = new Date();

  monthLens.forEach((length) => {
    monthStartDays.push(currDay % 7);
    currDay += length;
  });

  return (
    <div className="year">
      <h1
        style={{
          position: "sticky",
          top: "0",
          // backgroundColor: "#2f033d",
          zIndex: "3003",
          marginBlockStart: "0px",
          marginBlockEnd: "34.3px",
          paddingBlockStart: "20.48px",
          paddingBlockEnd: "3.58px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.56)",
          color: "rgb(197, 197, 197)",
          paddingLeft: widthLevel < 2 ? "0em" : "84px",
          height: "56.3px",
        }}
      >
        {year}
      </h1>
      <div className="flex-container-column">
        {monthLens.map((length, i) => (
          <div
            key={i}
            id={`${year}-${monthNames[i]}`}
            className="month"
            ref={(node) => {
              const map = getMap(`${year}`);
              if (node) {
                map.set(monthNames[i], node!);
              } else {
                map.delete(monthNames[i]);
              }
            }}
          >
            <Month
              startDay={monthStartDays[i]}
              todayRef={todayRef}
              monthLength={length}
              prevMonthLength={monthLens[(i - 1 + 12) % 12]}
              monthName={monthNames[i]}
              yearName={`${year}`}
              todayMonth={
                today.getMonth() === i && year === today.getFullYear()
              }
              monthNum={i}
              events={events.filter((row) => {
                return (
                  row.start_date.getMonth() === i ||
                  row.end_date.getMonth() === i
                );
              })}
              highlightedEvents={highlightedEvents}
              monthLabels={yearLabels[monthNames[i] as keyof object]}
              getWeekMap={getWeekMap}
              getEventIDMap={getEventIDMap}
              widthLevel={widthLevel}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Year;
