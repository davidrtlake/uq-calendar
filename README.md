# UQ Calender

I hate the format of the UQ academic calender, so I'm building a react app to scrape and display the calender in a nice format.

Use `node server.js` to start backend server.
Use `npm run dev` to start frontend.

# TODO

## Features

### Big

- [ ] Add search for events:
  - [x] Scrolls to results (like ctrl+f)
  - [x] Uses fieldset as filter.
  - [ ] Need to update when fieldset updates.
  - [ ] Informs if there are results that are hidden.
  - [x] Search all years checkbox.
  - [ ] Make weeks scroll refs, make Map of events to week (Maybe not needed, just use date).
    - Nvm, do like ctrl+f.
  - [ ] Sort events by start date.
- [ ] Choose to display by month or teaching week.
- [ ] Adapt design for mobile screens.
- [ ] Add export events option.

### Small

- [x] Add nests for fieldset Period selector for different year:
  - [x] Checkboxes for whole year.
  - [ ] Remember selection.
- [x] Make fieldset sticky on scroll.
- [x] Add all years to page.
  - [x] Automatic scroll to current day.
  - [ ] Button to jump to today that appears as user scrolls away from today.
- [x] On hover expand event description.
- [x] Show holidays.
- [x] Record type of day in JSON:
  - [x] Colour events with type.
  - [x] Day types
    - [x] Vacation/Revision periods (White)
    - [x] Public Holidays (Mustard)
    - [x] Examination periods (Yellow)
    - [x] Starting Dates (Green)
    - [x] Closing Dates (Salmon)
    - [x] Graduation Period (Orange bar)
    - [x] Finalisation of Grades (Red border)
- [x] Add teaching week.
  - [ ] Different colour for summer semester.
  - [x] Different shades for all non teaching weeks.
  - [x] Small text above the number "WEEK".
- [x] Add quick navigation section on right side.
  - [ ] Make a quick nav by teaching week.
- [ ] Give events times if a time is in the description. (e.g. midday, 8am to 12pm, 9am)

## Fixes

- [x] Fix overlapping months and days.
- [ ] Fix page position changing when selecting periods. (Fix month length? centre scroll?)
- [x] Fix duplicate events that appear in more than one period
- [ ] Make drop downs on side bars smooth/fix quick nav styling.
- [x] Anthing with my timetable, link https://my.uq.edu.au/node/212/3#3
- [ ] Add "open tab" icon to links.
- [x] Make Event interface global?
- [x] Hide prev years nav
- [x] 29 May - 2 Jun Revision period to showing in May.
- [x] Fix min height not shrinking for rows with extended events in them.
- [ ] Fill space above floating extended events with same colour.
  - Not sure about this, just need to remove margin top 25px and add padding top 25px to extended event div, then adjust z-indexes.
- [ ] On mobile first tap on truncate event text to view it will follow any link.
- [ ] Fix week scroll refs not in right place.

## Ideas

- [ ] Background gradient colour shift as user scrolls.
- [x] Check collision of heading and month heading. Fade out month heading.
- [x] Reduce min height of days with extended events below them.
- [ ] Border line vertically middle of month shooting out either side.
- [ ] Add "information current as" warning.
- [ ] Scroll to currMonth/currWeek every time select periods is shown.
- [x] Make public holidays background lighter (like weekend)
- [x] Full stops or no full stops, that is the question.
- [ ] Show slight day background pattern under and above extended events so they seem part of the day.
- [ ] Maybe change shown categories from checkbox to buttons?
