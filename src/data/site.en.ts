import type { SiteStrings } from '../lib/types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * English site strings. The name is written "SimpleScheduler (Simganpyo)" in titles: another product
 * is also called Simple Scheduler, and Simganpyo is the name only this app has.
 */
export const SITE_EN: SiteStrings = {
  appName: 'SimpleScheduler',
  home: {
    title: 'SimpleScheduler (Simganpyo) - Timetable app for classes, homework and widgets',
    description:
      'SimpleScheduler (Simganpyo) is an Android timetable app. Build a weekly timetable for classes and activities, link homework and tasks to each class, and check it all in home screen widgets.',
    h1: ['Your school week, as it really runs.', 'Timetable and tasks in one app'],
    lead: 'Enter a 45-minute class or a 75-minute lecture to the minute, and link homework to the class. See it in home screen widgets and on the lock screen.',
  },
  header: {
    homeLabel: 'SimpleScheduler home',
    faq: 'FAQ',
    otherLang: '한국어',
    getApp: 'Get the app',
    navLabel: 'Main menu',
  },
  stepper: {
    sectionLabel: 'SimpleScheduler by example',
    casesLabel: 'Kind of timetable',
    deviceLabel: 'Device to show',
    phone: 'Phone',
    tablet: 'Tablet',
    pause: 'Pause auto-advance',
    resume: 'Resume auto-advance',
    androidNote: 'Screens are from the Android app',
  },
  what: {
    heading: 'What is SimpleScheduler?',
    definition:
      'SimpleScheduler (Simganpyo, 심간표) is an Android timetable app for classes and activities that repeat every week. You build a weekly timetable, link homework and tasks to each class, and check them in home screen widgets and on the lock screen without opening the app. It has been running since 2017 and is free to use with no sign-up.',
    factsHeading: 'At a glance',
    facts: [
      { term: 'Names', desc: 'SimpleScheduler, Simganpyo (심간표)' },
      { term: 'Devices', desc: 'Android 7.0 and later phones and tablets, iPhone' },
      {
        term: 'Price',
        desc: 'Free with ads. Premium removes ads for $0.99 a month or $9.99 a year, with a 7-day free trial (as of November 2026; the price shown on Google Play applies).',
      },
      { term: 'Sign-up', desc: 'None' },
      { term: 'Your data', desc: 'Stored on your device; moved with a password-protected backup file' },
      { term: 'Widgets', desc: 'Weekly, Today, To-Do' },
      { term: 'Languages', desc: 'Korean, English, Japanese, Simplified Chinese' },
      { term: 'Running since', desc: '2017' },
    ],
    updatedTerm: 'Last updated',
    formatDate: (iso) => {
      const [y, m, d] = iso.split('-').map(Number);
      return `${MONTHS[m - 1]} ${d}, ${y}`;
    },
  },
  byCase: {
    heading: 'By kind of timetable',
    blurbs: {
      elementary_school: 'A parent keeps a child’s classes and things to pack.',
      middle_school: '45-minute periods, weekday practice and Saturday tutoring on one page.',
      high_school: 'Seven 50-minute periods, a study block and project deadlines.',
      university: 'Rooms and professors on each class, assignments linked to it.',
      after_school: 'One timetable per child for after-school activities.',
      lessons: 'Weekly lessons and personal plans on one timetable.',
    },
  },
  reviews: {
    heading: 'Google Play reviews',
    items: [
      { text: 'it’s easy and nice to use.', year: 2026, month: 8 },
      { text: 'Easy to use & simple', year: 2018, month: 9 },
    ],
    caption: (year, month) => `Google Play review · ${MONTHS[month - 1]} ${year}`,
  },
  faq: { heading: 'Frequently asked questions', all: 'See all questions' },
  install: {
    heading: 'Get SimpleScheduler',
    play: 'Get it on Google Play',
    appStore: 'Download on the App Store',
    iosNote: 'A new version of the iPhone app is on the way. The current iPhone version has fewer features than the Android app.',
  },
  casePage: {
    crumbsLabel: 'You are here',
    title: (name) => `${name} - SimpleScheduler (Simganpyo)`,
    stepsHeading: 'In eight steps',
    faqHeading: (name) => `${name}: common questions`,
    moreHeading: 'See also',
  },
  faqPage: {
    title: 'FAQ - SimpleScheduler (Simganpyo)',
    description:
      'Questions and answers about the SimpleScheduler (Simganpyo) timetable app: matching class times, widgets, alarms, price, backup, and iPhone and tablet support.',
    h1: 'Frequently asked questions',
    lead: 'What people ask before and while using SimpleScheduler, grouped by topic.',
  },
  about: {
    title: 'About SimpleScheduler (Simganpyo) - a timetable app since 2017',
    description:
      'SimpleScheduler (Simganpyo, 심간표) is an Android timetable app that has been running since 2017. What it is, who makes it and how to get in touch.',
    h1: 'About SimpleScheduler',
    storyHeading: 'From 2017 to now',
    story: [
      'SimpleScheduler started as an Android app in 2017. Its Korean name is 심간표 (Simganpyo), short for “simple timetable”.',
      'The iPhone app followed in 2018. A new version of the iPhone app is on the way.',
      'Today the Android app has To-Dos linked to classes, three home screen widgets, a lock screen timetable and password-protected backup files. There is no sign-up, and timetables and tasks are stored on the phone.',
    ],
    makerHeading: 'Who makes it',
    maker: 'SimpleScheduler is made and run by Jerry Jung.',
    contactHeading: 'Contact',
    contact: 'To report a problem or ask for a feature, send an email.',
  },
  notFound: {
    title: 'Page not found - SimpleScheduler (Simganpyo)',
    h1: 'Page not found',
    text: 'The address has changed or the page does not exist. Pick a kind of timetable below.',
    home: 'Go to SimpleScheduler home',
  },
  footer: {
    navLabel: 'Site guide',
    casesHeading: 'Kinds of timetable',
    siteHeading: 'SimpleScheduler',
    about: 'About',
    faq: 'FAQ',
    contact: 'Contact',
    privacy: 'Privacy Policy (Korean)',
    terms: 'Terms of Use (Korean)',
    maker: 'Made by Jerry Jung',
  },
};
