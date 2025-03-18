# UQ Calender

I hate the format of the UQ academic calender, so I'm building a react app to scrape and display the calender in a nice format.

Use `node server.js` to start backend server.
Use `npm run dev` to start frontend.

# TODO

## Features

- [x] Add nests for fieldset Period selector for different year:
  - [x] Checkboxes for whole year.
  - [ ] Remember selection.
- [x] Make fieldset sticky on scroll.
- [ ] Add search for events:
  - [ ] Scrolls to results (like ctrl+f)
  - [ ] no reload.
  - [ ] has year and month heading.
  - [ ] uses fieldset as filter.
  - [ ] informs if there are results that are hidden.
- [x] Add all years to page.
  - [x] Automatic scroll to current day.
  - [ ] Button to jump to today.
- [x] On hover expand event description.
- [ ] Show holidays.
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
- [ ] Add teaching week.
  - [ ] Different colour for summer semester.
- [x] Add quick navigation section on right side.
  - [ ] Make a quick nav by teaching week.
- [ ] Give events times if a time is in the description. (e.g. midday, 8am to 12pm, 9am)

## Fixes

- [x] Fix overlapping months and days.
- [ ] Fix page position changing when selecting periods. (Fix month length? centre scroll?)
- [ ] Fix duplicate events that appear in more than one period
- [ ] Make drop downs on side bars smooth/fix quick nav styling.
- [x] Anthing with my timetable, link https://my.uq.edu.au/node/212/3#3
- [ ] Add "open tab" icon to links.
- [x] Make Event interface global?
- [x] Hide prev years nav

## Ideas

- Background gradient colour shift as user scrolls.
- Check collision of heading and month heading. Fade out month heading.
- Reduce min height of days with extended events below them.
- Border line vertically middle of month shooting out either side.
- Add "information current as" warning.
- Scroll to currMonth/currWeek every time select periods is shown.
