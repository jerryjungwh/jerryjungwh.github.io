import type { FaqGroup } from './faq.ko';

/**
 * English questions. Same topics, same order and same home-page picks as the Korean list.
 * Answers state only what the app does today. Prices carry their base date.
 */
export const FAQ_EN: FaqGroup[] = [
  {
    id: 'timetable',
    title: 'Making a timetable',
    items: [
      {
        q: 'Can it match classes that are 40, 45 or 50 minutes long?',
        a: 'Yes. Start and end times are set to the minute. Enter 8:15–9:00 just as it is printed on the school schedule.',
        home: true,
      },
      {
        q: 'Can I add Saturday and Sunday?',
        a: 'Yes. In the timetable settings, extend the days shown to the weekend. Saturday and Sunday plans then go on the same page.',
      },
      {
        q: 'Can the week start on Sunday?',
        a: 'Yes. Each timetable has its own first day of the week.',
      },
      {
        q: 'Can I make more than one timetable?',
        a: 'Yes. Keep a timetable per semester or per child, and set the one you look at most as the representative timetable. You can also copy a timetable, with its classes or empty.',
      },
      {
        q: 'Can I add early morning or late night plans?',
        a: 'Yes. Extend the hours the timetable covers as far as you need. It can also show all 24 hours of the day.',
      },
      {
        q: 'Can times be shown as am and pm?',
        a: 'Yes. Choose between 24-hour and 12-hour (am/pm) time.',
      },
      {
        q: 'Can I change the text size or the cell size?',
        a: 'Yes. Text size, cell size and line thickness of the weekly timetable can each be adjusted one step at a time. Each class has its own background color and text color.',
      },
      {
        q: 'Can I put a photo behind the timetable?',
        a: 'Yes. Choose a background photo in the timetable settings and crop it to fit the timetable.',
      },
    ],
  },
  {
    id: 'todo',
    title: 'Homework, tasks and alarms',
    items: [
      {
        q: 'How do I keep track of homework and things to bring?',
        a: 'Add them as To-Dos and link each one to a class. A To-Do can have a due date and a due time, and tapping the class on the timetable shows the To-Dos linked to it.',
      },
      {
        q: 'Does it remind me before something is due?',
        a: 'Yes. Turn on a reminder for a To-Do and an alarm screen opens 5 minutes, 10 minutes, 30 minutes, 1 hour or 1 day before the due time, whichever you choose.',
      },
      {
        q: 'Can I get an alarm when a class starts?',
        a: 'Yes. Each class can have its own alarm. It rings every week on that day at the start time, and “Snooze for 5 minutes” rings it once more five minutes later.',
      },
      {
        q: 'What should I check if an alarm does not ring?',
        a: 'Alarms need two phone permissions: “Allow exact alarms” and “Display over other apps”. If one is off, the app shows a screen that tells you.',
      },
    ],
  },
  {
    id: 'widgets',
    title: 'Widgets and the lock screen',
    items: [
      {
        q: 'Which widgets are there?',
        a: 'Three. The weekly widget shows the week, the Today widget shows today’s classes and tasks together, and the To-Do widget shows the task list.',
      },
      {
        q: 'Can I complete a task from a widget?',
        a: 'Yes. Mark a task complete right in the To-Do widget or the Today widget, without opening the app.',
      },
      {
        q: 'Can I choose which timetable a widget shows?',
        a: 'Yes. When you place the weekly widget you choose its timetable. You also set its opacity and display mode (scroll, or fit to widget).',
      },
      {
        q: 'Can I see my timetable on the lock screen?',
        a: 'Yes. Turn on “Show weekly table on lock screen” in settings and the weekly timetable appears when you wake the phone. It is view-only, and it needs the “Display over other apps” permission.',
      },
    ],
  },
  {
    id: 'start',
    title: 'Price and sign-up',
    items: [
      {
        q: 'Is SimpleScheduler free?',
        a: 'Yes. It is a free app with ads. Premium removes ads for $0.99 a month or $9.99 a year, with a 7-day free trial (as of November 2026; the price shown on Google Play applies).',
        home: true,
      },
      {
        q: 'Do I need to sign up?',
        a: 'No. There is no sign-up and no login. Timetables and tasks are stored on your phone.',
        home: true,
      },
      {
        q: 'How do I remove ads?',
        a: 'Subscribe to Premium and ads no longer appear. You can cancel the subscription on Google Play at any time.',
      },
    ],
  },
  {
    id: 'devices',
    title: 'Devices and your data',
    items: [
      {
        q: 'Can I use it on an iPhone?',
        a: 'SimpleScheduler is on the App Store. A new version of the iPhone app is on the way, and the current iPhone version has fewer features than the Android app.',
        home: true,
      },
      {
        q: 'Can I use it on a tablet?',
        a: 'Yes. It runs on tablets with Android 7.0 or later, and on a tablet you can also use it in landscape.',
      },
      {
        q: 'How do I move my timetables to a new phone?',
        a: 'Make a password-protected backup file in the app, then restore from that file in SimpleScheduler on the new phone. Nothing moves by itself, so make the backup file before you switch phones.',
        home: true,
      },
      {
        q: 'Where are my timetables stored?',
        a: 'Timetables and tasks are stored on your phone. That is why it is a good idea to make a backup file before you change phones or remove the app.',
      },
      {
        q: 'Can I send a timetable to someone else?',
        a: 'Yes. Share a timetable as an image or as timetable data. Someone who receives the data can add that timetable to their own SimpleScheduler.',
      },
      {
        q: 'Which languages does it support?',
        a: 'Korean, English, Japanese and Simplified Chinese.',
      },
    ],
  },
];
