import { useEffect, useState } from "react";
import { Event } from "../App";
import "./SearchBar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faXmark,
  faMagnifyingGlass,
} from "@fortawesome/free-solid-svg-icons";

interface Props {
  navigationHandlerWeek: (year: number, monthNum: number, eID: number) => void;
  events: Event[];
  handleHighlightEvents: (eIDsToHighlight: Set<number>) => void;
  monthRefs: Map<
    string,
    React.MutableRefObject<Map<string, HTMLDivElement> | null>
  >;
}

const SearchBar = ({
  navigationHandlerWeek,
  events,
  handleHighlightEvents,
  monthRefs,
}: Props) => {
  const [searchContents, setSearchContents] = useState("");
  const [searchResults, setSearchResults] = useState<Event[]>([]);
  const [resultIndex, setResultIndex] = useState(0);
  const [onlyCurrYear, setOnlyCurrYear] = useState(true);
  const today: Date = new Date();
  const [currYear, setCurrYear] = useState<number>(today.getFullYear());

  const callback = (
    entries: IntersectionObserverEntry[],
    _: IntersectionObserver
  ) => {
    entries.forEach((entry: IntersectionObserverEntry) => {
      let entryId: string[] = entry.target.id.split("-");
      if (entry.isIntersecting) {
        // Item entering screen.
        setCurrYear(parseInt(entryId[0]));
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

  function handleSearch(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent> | null,
    updatedOnlyCurrYear?: boolean | undefined
  ) {
    setResultIndex(0);
    if (searchContents.length > 0) {
      const searchString = searchContents.toLocaleLowerCase();
      const highlightedIDsSet = new Set<number>();
      const filteredSearchEvents = events.filter(
        // Then filter so search term.
        (e) => {
          const res =
            (e.period.toLowerCase().includes(searchString) ||
              e.title.toLowerCase().includes(searchString)) &&
            (updatedOnlyCurrYear === undefined
              ? !onlyCurrYear || e.start_date.getFullYear() === currYear
              : !updatedOnlyCurrYear ||
                e.start_date.getFullYear() === currYear);
          if (res) highlightedIDsSet.add(e.event_id);
          return res;
        }
      );
      setSearchResults(filteredSearchEvents);
      handleHighlightEvents(highlightedIDsSet);
      if (filteredSearchEvents.length > 0) {
        navigationHandlerWeek(
          filteredSearchEvents[0].start_date.getFullYear(),
          filteredSearchEvents[0].start_date.getMonth(),
          filteredSearchEvents[0].event_id
        );
      }
    } else {
      setSearchResults([]);
      handleHighlightEvents(new Set<number>());
    }
  }

  function handleForwardAndBack(
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    if (searchResults.length > 0) {
      let newIndex: number;
      const target = event.target as HTMLButtonElement;
      if (target.name === "forward") {
        newIndex =
          resultIndex + 1 >= searchResults.length ? 0 : resultIndex + 1;
        setResultIndex(newIndex);
      } else {
        newIndex =
          resultIndex - 1 < 0 ? searchResults.length - 1 : resultIndex - 1;
        setResultIndex(newIndex);
      }
      navigationHandlerWeek(
        searchResults[newIndex].start_date.getFullYear(),
        searchResults[newIndex].start_date.getMonth(),
        searchResults[newIndex].event_id
      );
    }
  }

  function handleOnlyCurrYearChange(
    _event: React.ChangeEvent<HTMLInputElement>
  ) {
    handleSearch(null, !onlyCurrYear);
    setOnlyCurrYear(!onlyCurrYear);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      console.log("Searching with enter");
      handleSearch(null);
    }
  }

  function clearSearch(
    _event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) {
    setSearchContents("");
    setSearchResults([]);
    handleHighlightEvents(new Set<number>());
    setResultIndex(0);
  }

  return (
    <div className="search-bar">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <div>
          <input
            name="search-bar"
            placeholder="Search Events"
            value={searchContents}
            onChange={(e) => setSearchContents(e.target.value)}
            onKeyUp={handleKeyDown}
          />
          <button name="search" onClick={handleSearch}>
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </button>
          <div
            style={{
              minWidth: "28px",
              textAlign: "right",
              display: "inline-block",
            }}
          >
            {resultIndex + (searchResults.length === 0 ? 0 : 1)}
          </div>{" "}
          /{" "}
          <div
            style={{
              minWidth: "28px",
              textAlign: "left",
              display: "inline-block",
            }}
          >
            {searchResults.length}
          </div>
          <button
            className="nav-buttons"
            name="back"
            onClick={handleForwardAndBack}
            style={{ marginLeft: "10px" }}
          >
            <FontAwesomeIcon icon={faChevronUp} />
          </button>
          <button
            className="nav-buttons"
            name="forward"
            onClick={handleForwardAndBack}
          >
            <FontAwesomeIcon icon={faChevronDown} />
          </button>
          <button className="nav-buttons" onClick={clearSearch}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div>
          <input
            type="checkbox"
            id="only-curr-year"
            checked={onlyCurrYear}
            onChange={handleOnlyCurrYearChange}
          />
          <label style={{ cursor: "pointer" }} htmlFor="only-curr-year">
            Search only current year ({currYear})
          </label>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
