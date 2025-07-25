# UQ Calendar

I hate the format of the UQ academic calendar, so I'm building a react app to scrape and display the calendar in a nice format.

Use `node server.js` to start backend server.
Use `npm run dev` to start frontend.

# TODO

## Features

### Big

- [x] Add search for events:
  - [x] Scrolls to results (like ctrl+f)
  - [x] Uses fieldset as filter.
  - [ ] Need to update when fieldset updates.
    - Maybe not
  - [ ] Informs if there are results that are hidden.
  - [x] Search all years checkbox.
  - [x] Make weeks scroll refs, make Map of events to week (Maybe not needed, just use date).
    - Nvm, do like ctrl+f.
  - [x] Sort events by start date.
  - [x] Maybe only search current year and display that in placeholder.
  - [x] Grey out search navigation buttons if nothing searched.
  - [ ] Focus the input when search is pressed with no text.
- [ ] Choose to display by month or teaching week.
- [x] Adapt design for mobile screens.
  - [ ] If too small make search two levels
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
- [ ] On mobile first tap on truncate event text to view it will follow any link.
- [x] Fix week scroll refs not in right place.
- [x] Fix auto scroll to today not right.
- [ ] Add visual clarification to sub period part in category selector.
- [ ] Move mobile size updates into individual components.

## Ideas

- [ ] Background gradient colour shift as user scrolls.
- [x] Check collision of heading and month heading. Fade out month heading.
- [x] Reduce min height of days with extended events below them.
- [ ] Border line vertically middle of month shooting out either side.
- [ ] Add "information current as" warning.
- [ ] Scroll to currMonth/currWeek every time select periods is shown.
- [x] Make public holidays background lighter (like weekend)
- [x] Full stops or no full stops, that is the question.
- [x] Show slight day background pattern under and above extended events so they seem part of the day.
- [ ] Maybe change shown categories from checkbox to buttons?
- [ ] Investigate using flatlists.
- [ ] Separate text to follow link.
