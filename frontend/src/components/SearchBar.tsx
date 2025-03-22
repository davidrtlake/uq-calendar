import { useEffect, useState } from "react";
import { Event } from "../App";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

interface Props {
  navigationHandlerWeek: (year: number, monthNum: number) => void;
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
            e.period.toLowerCase().includes(searchString) ||
            (e.title.toLowerCase().includes(searchString) &&
              (updatedOnlyCurrYear === undefined
                ? !onlyCurrYear || e.start_date.getFullYear() === currYear
                : !updatedOnlyCurrYear ||
                  e.start_date.getFullYear() === currYear));
          if (res) highlightedIDsSet.add(e.event_id);
          return res;
        }
      );
      setSearchResults(filteredSearchEvents);
      if (filteredSearchEvents.length > 0) {
        navigationHandlerWeek(
          filteredSearchEvents[0].start_date.getFullYear(),
          filteredSearchEvents[0].start_date.getMonth()
        );
        handleHighlightEvents(highlightedIDsSet);
        console.log(
          "Searched for",
          searchString,
          "Returned",
          filteredSearchEvents
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
    let newIndex: number;
    const target = event.target as HTMLButtonElement;
    // console.log(typeof event.target, event.target, event.target.name);
    if (target.name === "forward") {
      newIndex = resultIndex + 1 >= searchResults.length ? 0 : resultIndex + 1;
      setResultIndex(newIndex);
    } else {
      newIndex =
        resultIndex - 1 < 0 ? searchResults.length - 1 : resultIndex - 1;
      setResultIndex(newIndex);
    }
    navigationHandlerWeek(
      searchResults[newIndex].start_date.getFullYear(),
      searchResults[newIndex].start_date.getMonth()
    );
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

  return (
    <>
      <input
        type="checkbox"
        id="only-curr-year"
        checked={onlyCurrYear}
        onChange={handleOnlyCurrYearChange}
      />
      <label htmlFor="only-curr-year">Only current year</label>
      <input
        // style={{ position: "sticky", top: "100px", zIndex: "3006" }}
        name="search-bar"
        value={searchContents}
        onChange={(e) => setSearchContents(e.target.value)}
        onKeyUp={handleKeyDown}
      />
      <button onClick={handleSearch}>Search</button>
      {resultIndex + (searchResults.length === 0 ? 0 : 1)} /{" "}
      {searchResults.length}
      <button name="back" onClick={handleForwardAndBack}>
        <FontAwesomeIcon icon={faChevronDown} />
      </button>
      <button name="forward" onClick={handleForwardAndBack}>
        <FontAwesomeIcon icon={faChevronUp} />
      </button>
    </>
  );
};

export default SearchBar;
