import { useState } from "react";
import "./NestedCheckbox.css";

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

interface Props {
  allYears: string[];
  allPeriods: string[];
  allSummerSemesters: string[];
  checkHandler: (p: string, y: string) => void;
  checkedState: Map<string, CheckedYear>;
}

const NestedCheckbox = ({
  allYears,
  allPeriods,
  allSummerSemesters,
  checkHandler,
  checkedState,
}: Props) => {
  const [shownContent, setShownContent] = useState<Map<string, boolean>>(() => {
    const defaultShownContent = new Map<string, boolean>();
    allYears.forEach((y) => defaultShownContent.set(y, false));
    return defaultShownContent;
  });

  function buttonClickHandler(y: string) {
    const newShownContent = new Map<string, boolean>(shownContent);
    newShownContent.set(y, !newShownContent.get(y));
    setShownContent(newShownContent);
  }

  return (
    <fieldset>
      <legend>Select Periods:</legend>
      {allYears.map((y, i) => (
        <div key={i}>
          <ul>
            <div className="year-collapsible">
              <div>
                <input
                  type="checkbox"
                  id={y}
                  name={y}
                  checked={checkedState.get(y)?.checked ?? true}
                  onChange={() => checkHandler("", y)}
                />
                <label className="year" htmlFor={`${y}`}>{`${y}`}</label>
              </div>
              <button
                type="button"
                style={{ display: "inline" }}
                onClick={() => buttonClickHandler(y)}
              >
                {" "}
                {shownContent.get(y) ? "^" : "v"}
              </button>
            </div>

            <div
              className="period-content"
              style={{ display: shownContent.get(y) ? "block" : "none" }}
            >
              {allPeriods.map((p, j) => (
                <li key={j}>
                  <input
                    type="checkbox"
                    id={`${y}${p}`}
                    name={`${y}${p}`}
                    checked={checkedState.get(y)?.childPeriods?.get(p) ?? true}
                    onChange={() => checkHandler(p, y)}
                  />
                  <label htmlFor={`${y}${p}`}>{p}</label>
                </li>
              ))}
            </div>
          </ul>
          <ul>
            <div className="year-collapsible">
              <input
                type="checkbox"
                id={allSummerSemesters[i]}
                name={allSummerSemesters[i]}
                checked={
                  checkedState.get(allSummerSemesters[i])?.checked ?? true
                }
                onChange={() => checkHandler("", allSummerSemesters[i])}
              />
              <label
                className="summer"
                htmlFor={`${allSummerSemesters[i]}`}
              >{`${allSummerSemesters[i]}`}</label>
            </div>
          </ul>
        </div>
      ))}
    </fieldset>
  );
};

export default NestedCheckbox;
