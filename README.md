# UQ Calender

I hate the format of the UQ academic calender, so I'm building a react app to scrape and display the calender in a nice format.

Use `node server.js` to start backend server.
Use `npm run dev` to start frontend.

# TODO

- [ ] Fix overlapping months and days:
- [ ] Add nests for fieldset Period selector for different year:
  - Checkboxes for whole year.
  - Remember selection.
- [x] Make fieldset sticky on scroll.
- [ ] Add search for events:
  - only returns days with matches.
  - no reload.
  - has year and month heading.
  - uses fieldset as filter.
  - informs if there are results that are hidden.
- [ ] Add all years to page.
  - Automatic scroll to current year.
- [x] On hover expand event description.
- [ ] Show holidays.
- [ ] Record type of day in JSON:
  - Vacation/Revision periods (White)
  - Public Holidays (Mustard)
  - Teaching periods (Pale blue)
  - Examination periods (Yellow)
  - Starting Dates (Green)
  - Closing Dates (Salmon)
  - Graduation Period (Orange bar)
  - Special Events (White border)
  - Finalisation of Grades (Red border)
- [ ] Add teaching week.
