import { useState } from "react";
import "./QuickNavigation.css";

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

interface Props {
  allYears: string[];
  monthNames: string[];
  navigationHandler: (m: string, y: string) => void;
  checkedState: Map<string, CheckedYear>;
}

const QuickNavigation = ({
  allYears,
  monthNames,
  navigationHandler,
}: Props) => {
  const [shownContent, setShownContent] = useState<Map<string, boolean>>(() => {
    const defaultShownContent = new Map<string, boolean>();
    allYears.forEach((y) => defaultShownContent.set(y, y === "2025"));
    return defaultShownContent;
  });

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
        <div key={i}>
          <ul>
            <div className="year-collapsible">
              <span style={{ paddingLeft: "0.5rem" }}>{`${y}`}</span>
              <button
                type="button"
                style={{ display: "inline" }}
                onClick={() => buttonClickHandler(y)}
              >
                {shownContent.get(y) ? "-" : "v"}
              </button>
            </div>

            <div
              className="period-content"
              style={{ display: shownContent.get(y) ? "block" : "none" }}
            >
              {monthNames.map((m, j) => (
                <li key={j}>
                  <button
                    id={`${y}${m}`}
                    style={{ width: "100%" }}
                    onClick={() => navigationHandler(m, y)}
                  >
                    {m}
                  </button>
                </li>
              ))}
            </div>
          </ul>
        </div>
      ))}
    </div>
  );
};

export default QuickNavigation;
