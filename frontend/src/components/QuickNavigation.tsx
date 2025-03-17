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
  const [shownContent, setShownContent] = useState<Map<string, boolean>>(() => {
    const defaultShownContent = new Map<string, boolean>();
    allYears.forEach((y) => defaultShownContent.set(y, y === "2025"));
    return defaultShownContent;
  });
  const today: Date = new Date();
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
      {allYears.map((y, i) => (
        <div key={i} className="quick-navigation-year">
          <div
            className="nav-year-collapsible"
            onClick={() => buttonClickHandler(y)}
          >
            <span style={{ margin: "auto" }}>
              {y === currYear ? <b>{`${y}`}</b> : `${y}`}
            </span>
          </div>

          <div
            style={{
              display: shownContent.get(y) ? "block" : "none",
            }}
          >
            {monthNames.map((m, j) => (
              <button
                key={j}
                className="quick-navigation-month"
                id={`${y}${m}`}
                style={{
                  width: "90%",
                  outline:
                    y === currYear && m === currMonth
                      ? "1px solid rgb(255, 255, 255, 0.6)"
                      : today.getFullYear() === parseInt(y) &&
                        j === today.getMonth()
                      ? "1px solid rgb(255, 0, 0, 0.6)"
                      : "none",
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
  );
};

export default QuickNavigation;
