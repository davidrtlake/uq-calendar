import { useEffect, useState } from "react";
import "./QuickNavigation.css";

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

interface Props {
  allYears: string[];
  monthNames: string[];
  monthRefs: Map<
    string,
    React.MutableRefObject<Map<string, HTMLDivElement> | null>
  >;
  navigationHandler: (m: string, y: string) => void;
  checkedState: Map<string, CheckedYear>;
}

const QuickNavigation = ({
  allYears,
  monthNames,
  monthRefs,
  navigationHandler,
}: Props) => {
  const today: Date = new Date();
  const [shownContent, setShownContent] = useState<Map<string, boolean>>(() => {
    const defaultShownContent = new Map<string, boolean>();
    allYears.forEach((y) =>
      defaultShownContent.set(y, y === `${today.getFullYear()}`)
    ); // Default set all to false except 2025.
    return defaultShownContent;
  });
  const [currYear, setCurrYear] = useState<string>(`${today.getFullYear()}`);
  const [currMonth, setCurrMonth] = useState<string>(
    `${monthNames[today.getMonth()]}`
  );

  const callback = (
    entries: IntersectionObserverEntry[],
    _: IntersectionObserver
  ) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      let entryId: string[] = entry.target.id.split("-");
      if (entry.isIntersecting) {
        // Item entering screen.
        setCurrYear(entryId[0]);
        setCurrMonth(entryId[1]);
        const newShownContent = new Map<string, boolean>(shownContent);
        allYears.forEach((ye) => newShownContent.set(ye, false));
        newShownContent.set(entryId[0], true);
        setShownContent(newShownContent);
      }
    });
  };

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: "-49% 0px -49% 0px",
      threshold: 0,
    };
    const observer = new IntersectionObserver(callback, options);
    monthRefs.forEach((year) => {
      year.current?.forEach((ref) => {
        observer.observe(ref);
      });
    });
  }, []);

  function buttonClickHandler(y: string) {
    // Make the whole box a button.
    if (!shownContent.get(y)) {
      const newShownContent = new Map<string, boolean>(shownContent);
      allYears.forEach((ye) => newShownContent.set(ye, false));
      newShownContent.set(y, true);
      setShownContent(newShownContent);
    }
  }

  return (
    <div className="quick-navigation-panel">
      <div
        id="quick-nav-vert-line"
        style={{
          borderLeft: "1px solid rgba(168, 168, 168, 0.5)",
          height: "80vh",
          marginRight: "1vw",
          // marginTop: "5vh",
        }}
      ></div>
      <div style={{ minWidth: "7em" }}>
        {allYears.map((y, i) => (
          <div key={i} className="quick-navigation-year">
            <div
              className="nav-year-collapsible"
              onClick={() => buttonClickHandler(y)}
              style={
                {
                  // display:
                  //   y === currYear ||
                  //   y === `${parseInt(currYear) + 1}` ||
                  //   y === `${parseInt(currYear) - 1}`
                  //     ? "flex"
                  //     : "none",
                }
              }
            >
              <span style={{ margin: "auto" }}>
                {y === currYear ? <b>{`${y}`}</b> : `${y}`}
              </span>
            </div>

            <div
              style={{
                display: shownContent.get(y) ? "block" : "none", //y === currYear ? "block" : "none",
              }}
            >
              {monthNames.map((m, j) => (
                <button
                  key={j}
                  className="quick-navigation-month"
                  id={`${y}${m}`}
                  style={{
                    width: "90%",
                    color:
                      today.getFullYear() === parseInt(y) &&
                      j === today.getMonth()
                        ? "rgb(168, 199, 250)"
                        : "",
                    borderLeft:
                      y === currYear && m === currMonth
                        ? "2px solid rgb(255, 255, 255, 0.6)"
                        : "",
                    borderBottom:
                      j !== 11
                        ? "1px solid rgb(255, 255, 255, 0.3)"
                        : "transparent",
                  }}
                  onClick={() => navigationHandler(m, y)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickNavigation;
