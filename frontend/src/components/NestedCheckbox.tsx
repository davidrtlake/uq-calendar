import { useEffect, useState } from "react";
import "./NestedCheckbox.css";

interface CheckedYear {
  checked: boolean;
  childPeriods: Map<string, boolean> | undefined;
}

interface Props {
  allYears: number[];
  allPeriods: string[];
  checkHandler: (p: string, y: number) => void;
}

const NestedCheckbox = ({ allYears, allPeriods, checkHandler }: Props) => {
  const [checkedState, setCheckedState] = useState<Map<number, CheckedYear>>( // Need to bundle it all into a Map of sets in App.tsx
    () => {
      const checkboxLayout = new Map<number, CheckedYear>();
      let newChildPeriods: Map<string, boolean>;
      for (let y of allYears) {
        newChildPeriods = new Map<string, boolean>(); // Tidy up, forEach?
        for (let p of allPeriods) {
          newChildPeriods.set(p, true);
        }
        checkboxLayout.set(y, {
          checked: true,
          childPeriods: new Map<string, boolean>(newChildPeriods),
        });
      }
      return checkboxLayout;
    }
  );
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

  function localCheckHandler(p: string, y: number) {
    // Need to bundle it all into a Map of sets in App.tsx
    const newCS = new Map<number, CheckedYear>(checkedState);
    if (p.length === 0) {
      // If year checked/unchecked, then also toggle children.
      newCS.set(y, {
        checked: !newCS.get(y)?.checked,
        childPeriods: newCS.get(y)?.childPeriods,
      });
    } else {
      // If a child is checked/unchecked, check if all children are ticked or all unticked now.
      newCS.set(y, {
        checked: !newCS.get(y)?.checked,
        childPeriods: newCS.get(y)?.childPeriods,
      });
    }
    setCheckedState(newCS);
  }

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
                onChange={() => localCheckHandler("", y)}
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
                  id={`${y}p`}
                  name={`${y}p`}
                  defaultChecked={true}
                  onChange={() => checkHandler(p, 0)}
                />
                <label htmlFor={`${y}p`}>{p}</label>
              </li>
            ))}
          </div>
        </ul>
      ))}
    </fieldset>
  );
};

export default NestedCheckbox;
