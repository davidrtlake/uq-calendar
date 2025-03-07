import { useState } from "react";
import "./NestedCheckbox.css";

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

interface Props {
  allYears: number[];
  allPeriods: string[];
  checkHandler: (p: string, y: number) => void;
  checkedState: Map<number, CheckedYear>;
}

const NestedCheckbox = ({
  allYears,
  allPeriods,
  checkHandler,
  checkedState,
}: Props) => {
  const [shownContent, setShownContent] = useState<Map<number, boolean>>(() => {
    const defaultShownContent = new Map<number, boolean>();
    allYears.forEach((y) => defaultShownContent.set(y, false));
    return defaultShownContent;
  });

  // useEffect(() => {
  //   const checkboxLayout = new Map<number, CheckedYear>();
  //   let newChildPeriods: Map<string, boolean>;
  //   for (let y of allYears) {
  //     newChildPeriods = new Map<string, boolean>();
  //     for (let p of allPeriods) {
  //       newChildPeriods.set(p, true);
  //     }
  //     checkboxLayout.set(y, {
  //       checked: true,
  //       childPeriods: new Map<string, boolean>(newChildPeriods),
  //     });
  //   }
  //   setCheckedState(checkboxLayout);
  //   console.log("Set checkboxLayout");
  //   console.log(checkboxLayout);
  // }, []);

  function buttonClickHandler(y: number) {
    const newShownContent = new Map<number, boolean>(shownContent);
    newShownContent.set(y, !newShownContent.get(y));
    setShownContent(newShownContent);
  }

  return (
    <fieldset>
      <legend>Select Periods:</legend>
      {allYears.map((y, i) => (
        <ul key={i}>
          <div className="year-collapsible">
            <div>
              <input
                type="checkbox"
                id={`${y}`}
                name={`${y}`}
                checked={checkedState.get(y)?.checked ?? true}
                onChange={() => checkHandler("", y)}
              />
              <label htmlFor={`${y}`}>{`${y}`}</label>
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
      ))}
    </fieldset>
  );
};

export default NestedCheckbox;
