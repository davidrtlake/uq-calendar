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
- [ ] Add all years to page.
  - [ ] Automatic scroll to current day.
  - [ ] Button to jump to today.
- [x] On hover expand event description.
- [ ] Show holidays.
- [ ] Record type of day in JSON:
  - [ ] Vacation/Revision periods (White)
  - [ ] Public Holidays (Mustard)
  - [ ] Teaching periods (Pale blue)
  - [ ] Examination periods (Yellow)
  - [ ] Starting Dates (Green)
  - [ ] Closing Dates (Salmon)
  - [ ] Graduation Period (Orange bar)
  - [ ] Special Events (White border)
  - [ ] Finalisation of Grades (Red border)
- [ ] Add teaching week.
- [x] Add quick navigation section on right side.

## Fixes

- [x] Fix overlapping months and days.
- [ ] Fix page position changing when selecting periods. (Fix month length? centre scroll?)
- [ ] Fix duplicate events that appear in more than one period
- [ ] Make drop downs on side bars smooth/fix quick nav styling.

## Ideas

- Background gradient colour shift as user scrolls.
- Check collision of heading and month heading. Fade out month heading.
- Reduce min height of days with extended events below them.
