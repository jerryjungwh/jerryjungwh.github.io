import type { CaseDef } from '../lib/types';

/**
 * English copy for the six cases. Not a translation of the Korean cases: the same eight steps, with
 * names, subjects and times that fit an English-speaking school week (design section 9).
 * Every sentence states something the app does today. Elementary, middle school and kids' activities
 * are told by a parent (the app's stated audience is 16+).
 */
const REMINDER_LONG =
  'A reminder can go off 5 minutes, 10 minutes, 30 minutes, 1 hour or 1 day before the due time. It opens as an alarm screen. Tap “Snooze for 5 minutes” to hear it once more five minutes later.';
const WIDGET_DONE_LONG =
  'You can mark a task complete in the To-Do widget and in the Today widget. It shows as complete in the app’s To-Do list as well.';
const LOCK_LONG =
  'Turn on “Show weekly table on lock screen” and the weekly timetable appears when you wake the phone. It is view-only: nothing can be edited or deleted while the phone is locked.';

export const CASES_EN: CaseDef[] = [
  {
    id: 'elementary_school',
    name: 'Elementary school timetable',
    tab: 'Elementary',
    h1: ['Elementary school timetable', 'Your child’s school day, to the minute'],
    intro:
      'An example of a parent making a timetable for a fourth grader. Classes go in with their real start and end times, and things to pack are linked to the class that needs them.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable for Emma',
        short: 'Name it “Emma · Grade 4”. Show Monday to Friday, from 8 am to 3 pm.',
        long: 'When you make a timetable you choose its name, the days it shows and the hours it covers. Emma goes to school Monday to Friday and is done at 2:45 pm, so this one shows 8 am to 3 pm only.',
      },
      {
        id: 'fill',
        title: 'Add classes at their real times',
        short: 'Reading 8:30–9:15, Math 9:20–10:05. Times are set to the minute.',
        long: 'Class times are set to the minute, so a 45-minute class and a 5-minute break go in exactly as the school has them. Reading, Math, Science and Art each get their own color. Lunch from 11:40 to 12:25 is left empty.',
      },
      {
        id: 'unique',
        title: 'Put a favorite photo behind it',
        short: 'Emma picks a photo for the timetable background. Classes show on top of it.',
        long: 'Choose a background photo in the timetable settings and crop it to fit. Classes stay on top as colored blocks, so the timetable is still easy to read.',
      },
      {
        id: 'todo',
        title: 'Link things to pack to a class',
        short: 'Link “Pack colored pencils” to Art. Tap Art and the task shows with it.',
        long: 'When you add a To-Do you choose the class it belongs to. Link “Pack colored pencils” to Art and it appears whenever you tap Art on the timetable. There is no need to write which class it is for.',
      },
      {
        id: 'remind',
        title: 'Get a reminder before it is due',
        short: 'Set a due time and turn on a reminder. An alarm screen tells you before it is due.',
        long: REMINDER_LONG,
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today and To-Do widgets. See Emma’s day without opening the app.',
        long: 'The weekly widget shows the week. The Today widget shows today’s classes and tasks together, and the To-Do widget shows the task list. On a parent’s phone they show a child’s day at a glance.',
      },
      {
        id: 'widget_done',
        title: 'Check off tasks in the widget',
        short: 'Pencils in the bag? Mark the task complete right in the widget.',
        long: WIDGET_DONE_LONG,
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Turn on the lock screen timetable and it is there when you wake the phone.',
        long: `${LOCK_LONG} In the morning, today’s classes are right there.`,
      },
    ],
    faq: [
      {
        q: 'Can I enter classes that are 40 or 45 minutes long?',
        a: 'Yes. Start and end times are set to the minute, so 40-minute or 45-minute classes and short breaks go in exactly as the school has them.',
      },
      {
        q: 'Can I use it if my child has no phone?',
        a: 'Yes. Make your child’s timetable on your own phone and check it in a widget or on the lock screen. There is no sign-up, so your child does not need an account.',
      },
      {
        q: 'Do I have to start over every school year?',
        a: 'No. You can keep several timetables and copy an existing one, with or without its classes. Copy last year’s timetable and change only what is different.',
      },
    ],
  },
  {
    id: 'middle_school',
    name: 'Middle school timetable',
    tab: 'Middle school',
    h1: ['Middle school timetable', 'Classes and practice on one page'],
    intro:
      'An example of a parent and a seventh grader making a timetable together: 45-minute periods, soccer practice on weekdays and tutoring on Saturday, all on one page.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable with Noah',
        short: 'Name it “Noah · Grade 7 Fall”. Show hours up to 6 pm, when practice ends.',
        long: 'When you make a timetable you choose its name, the days it shows and the hours it covers. First period starts at 8:15 am and soccer practice ends at 6 pm, so this one shows 8 am to 6 pm.',
      },
      {
        id: 'fill',
        title: 'Add periods and practice',
        short: 'Period 1 is 8:15–9:00. Soccer on Monday, Wednesday and Friday gets its own color.',
        long: 'Periods are 45 minutes with 5-minute breaks. Because times are set to the minute, they match the school’s bell schedule. Seventh period ends at 2:35 pm, and soccer practice runs 4:30 to 6:00 on Monday, Wednesday and Friday.',
      },
      {
        id: 'unique',
        title: 'Add Saturday to the same page',
        short: 'Extend the timetable to Saturday. Math tutoring at 10 am joins the same page.',
        long: 'Change the days shown in the timetable settings. Extend Monday–Friday to Saturday, and tutoring from 10 am to noon appears on the same page. Sunday can be added too.',
      },
      {
        id: 'todo',
        title: 'Link a project to its subject',
        short: 'Link “Science project report” to Science and set it due on Friday.',
        long: 'A To-Do has a due date and a class it is linked to. Tap Science on the timetable and the project shows with it, so it is always clear which subject a task belongs to.',
      },
      {
        id: 'remind',
        title: 'A reminder the day before',
        short: 'Set the reminder to “1 day before” and an alarm screen tells you a day ahead.',
        long: REMINDER_LONG,
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'The weekly widget shows the week, the Today widget shows today, and the To-Do widget shows homework.',
        long: 'There are three widgets: weekly, Today and To-Do. You choose which timetable the weekly widget shows. With one on the home screen you can tell whether today is a practice day without opening the app.',
      },
      {
        id: 'widget_done',
        title: 'Check off homework in the widget',
        short: 'Report finished? Mark it complete right in the widget.',
        long: WIDGET_DONE_LONG,
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone and the timetable is there. Check the next period without opening the app.',
        long: LOCK_LONG,
      },
    ],
    faq: [
      {
        q: 'Can it match 45-minute periods that start at 8:15?',
        a: 'Yes. Start and end times are set to the minute. Enter 8:15–9:00 just as it is printed on the school schedule.',
      },
      {
        q: 'Can I see school classes and after-school activities together?',
        a: 'Yes. Put classes and activities on one timetable and they show on one page. If you would rather keep them apart, make a second timetable and switch between the two.',
      },
      {
        q: 'Can I add Saturday and Sunday?',
        a: 'Yes. In the timetable settings, extend the days shown to the weekend. Saturday and Sunday plans then go on the same page.',
      },
    ],
  },
  {
    id: 'high_school',
    name: 'High school timetable',
    tab: 'High school',
    h1: ['High school timetable', 'Seven periods and study time at a glance'],
    intro:
      'An example of a high school junior making their own timetable: seven 50-minute periods, an evening study block, and projects and presentations linked to their subjects.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable for the semester',
        short: 'Name it “Junior year · Fall”. Show hours up to 9 pm, when the study block ends.',
        long: 'When you make a timetable you choose its name, the days it shows and the hours it covers. First period starts at 8:00 am and the evening study block ends at 9 pm, so this one shows 8 am to 9 pm.',
      },
      {
        id: 'fill',
        title: 'Add seven 50-minute periods',
        short: 'Period 1 is 8:00–8:50 and period 7 ends at 2:55. A study block at 7 pm runs Monday to Thursday.',
        long: 'Periods are 50 minutes with 5 minutes of passing time. Set to the minute, they match the bell schedule. Lunch is left empty, and Monday to Thursday has a study block from 7 to 9 pm.',
      },
      {
        id: 'unique',
        title: 'An alarm when it starts',
        short: 'Turn on the alarm for the study block and it rings at 7 pm, Monday to Thursday.',
        long: 'Each class or block can have its own alarm. The alarm rings every week on that day, at the start time. The alarm list shows every alarm you have turned on.',
      },
      {
        id: 'todo',
        title: 'Link presentation prep to English',
        short: 'Link “Prepare English presentation” to English. Tap English and the task shows with it.',
        long: 'When you add a To-Do you choose the class it belongs to. Link projects, presentations and homework to their subjects, and tapping a subject on the timetable shows what is due for it.',
      },
      {
        id: 'remind',
        title: 'Know the day before it is due',
        short: 'Set a due time and a “1 day before” reminder. An alarm screen opens a day ahead.',
        long: REMINDER_LONG,
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today and To-Do widgets. Check today’s classes and what is due from the home screen.',
        long: 'The weekly widget shows the week. The Today widget shows today’s classes and tasks together, and the To-Do widget shows the task list. All of it is on the home screen, without opening the app.',
      },
      {
        id: 'widget_done',
        title: 'Check off finished work in the widget',
        short: 'Done preparing? Mark it complete right in the widget.',
        long: WIDGET_DONE_LONG,
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone between classes and the timetable is there. See the next period right away.',
        long: LOCK_LONG,
      },
    ],
    faq: [
      {
        q: 'Can I enter 50-minute periods with 5-minute passing time?',
        a: 'Yes. Start and end times are set to the minute. Enter 8:00–8:50 just as it is on the bell schedule.',
      },
      {
        q: 'Can I add evening study time or late activities?',
        a: 'Yes. Extend the hours the timetable covers into the evening. It can also show all 24 hours of the day.',
      },
      {
        q: 'When does a class alarm ring?',
        a: 'Turn on the alarm for a class or block and it rings every week on that day, at the start time. On the alarm screen, “Snooze for 5 minutes” rings it once more five minutes later.',
      },
    ],
  },
  {
    id: 'university',
    name: 'College class schedule',
    tab: 'College',
    h1: ['College class schedule', 'Rooms and assignments on one page'],
    intro:
      'An example of a college student setting up this semester’s classes. Each class has its room and professor, and assignments are linked to the class until they are due.',
    steps: [
      {
        id: 'create',
        title: 'Make this semester’s schedule',
        short: 'Name it “Fall semester”. Show only the days and hours you have class.',
        long: 'When you make a timetable you choose its name, the days it shows and the hours it covers. Leaving out days and hours with no class makes everything else bigger. You can keep one timetable per semester.',
      },
      {
        id: 'fill',
        title: 'Add classes by day and time',
        short: 'Data Structures is Monday 9:00–10:30 in Engineering Hall 301. Each class has a color.',
        long: 'Class times are set to the minute, so a 75-minute or 90-minute class fits as it is. Add the room, the professor and a note to each class and pick a color, and the week is easy to read.',
      },
      {
        id: 'unique',
        title: 'Tap a class to see it all',
        short: 'Tap Data Structures to see its room, professor and linked assignments on one screen.',
        long: 'Tap a class on the timetable to see its day and time, room, professor and note. Assignments linked to that class are on the same screen, so there is no need to look for them separately.',
      },
      {
        id: 'todo',
        title: 'Link an assignment to its class',
        short: 'Link “Submit Data Structures lab” to Data Structures and set it due at 6:00 pm.',
        long: 'A To-Do has a due date, a due time and a class it is linked to. Once an assignment is linked, the class name does not have to go in the title.',
      },
      {
        id: 'remind',
        title: 'A reminder before the deadline',
        short: 'Set the reminder to “1 hour before” and an alarm screen opens at 5:00 pm.',
        long: REMINDER_LONG,
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today and To-Do widgets. Check today’s classes and assignments from the home screen.',
        long: 'The weekly widget shows the week. The Today widget shows today’s classes and tasks together, and the To-Do widget shows your assignments. All of it is on the home screen, without opening the app.',
      },
      {
        id: 'widget_done',
        title: 'Check off assignments in the widget',
        short: 'Lab submitted? Mark it complete right in the widget.',
        long: WIDGET_DONE_LONG,
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone on the way to class and the timetable is there. See your next class right away.',
        long: LOCK_LONG,
      },
    ],
    faq: [
      {
        q: 'Can I enter 75-minute or 90-minute classes?',
        a: 'Yes. Start and end times are set to the minute. Enter 9:00–10:15 or 1:30–3:00 just as the class is scheduled.',
      },
      {
        q: 'Can I add the room and the professor’s name?',
        a: 'Yes. Each class can have a room, a professor and a note. Tap the class on the timetable to see them on one screen.',
      },
      {
        q: 'Can I keep a separate timetable for each semester?',
        a: 'Yes. You can keep several timetables. Set the one you use now as the representative timetable and leave last semester’s as it is.',
      },
    ],
  },
  {
    id: 'after_school',
    name: 'Kids’ activities schedule',
    tab: 'Kids’ activities',
    h1: ['Kids’ activities schedule', 'One timetable per child, in one app'],
    intro:
      'An example of a parent organizing after-school activities for two children. Each child has their own timetable, and things to pack are linked to the activity that needs them.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable for Lily',
        short: 'Name it “Lily”. Show Monday to Saturday so the Saturday swim lesson fits.',
        long: 'When you make a timetable you choose its name, the days it shows and the hours it covers. Lily has activities after school and a swim lesson on Saturday morning, so this one shows Monday to Saturday.',
      },
      {
        id: 'fill',
        title: 'Add after-school activities',
        short: 'Piano on Tuesday and Thursday 4:30–5:15, karate on Monday, Wednesday and Friday 5:00–6:00.',
        long: 'Times are set to the minute. Art club on Monday and Wednesday 3:15–4:15 and the Saturday swim lesson 10:00–11:00 are in too. Each activity has its own color, so it is clear at a glance where to go today.',
      },
      {
        id: 'unique',
        title: 'A second timetable for Max',
        short: 'Make a separate timetable named “Max” for after-school care and soccer, and switch between the two.',
        long: 'You can have several timetables. Max has after-school care Monday to Friday 3:00–5:00 and soccer on Tuesday and Thursday 5:15–6:15. Switch timetables to see each child on their own page.',
      },
      {
        id: 'todo',
        title: 'Link things to pack to an activity',
        short: 'Link “Pack swim bag” to the swim lesson and “Check piano practice” to piano.',
        long: 'When you add a To-Do you choose the activity it belongs to. Tap the swim lesson on the timetable and “Pack swim bag” shows with it. There is no need to write which activity it is for.',
      },
      {
        id: 'remind',
        title: 'A reminder before you leave',
        short: 'Set a due time and a “30 minutes before” reminder. An alarm screen tells you in time.',
        long: REMINDER_LONG,
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today and To-Do widgets. See where the children go today from the home screen.',
        long: 'There are three widgets: weekly, Today and To-Do. You choose which timetable the weekly widget shows, so Lily’s week and Max’s week can each have a widget on the home screen.',
      },
      {
        id: 'widget_done',
        title: 'Check off what is packed',
        short: 'Swim bag packed? Mark it complete right in the widget.',
        long: WIDGET_DONE_LONG,
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone and the timetable is there. Check pick-up time without opening the app.',
        long: LOCK_LONG,
      },
    ],
    faq: [
      {
        q: 'Can I make a separate timetable for each child?',
        a: 'Yes. You can keep several timetables. Make one per child and switch between them.',
      },
      {
        q: 'Can I add school clubs and after-school care?',
        a: 'Yes. Anything that happens on the same day and time every week can go on a timetable. Give it a name, a time and a color.',
      },
      {
        q: 'Can I send a child’s timetable to family?',
        a: 'Yes. Share a timetable as an image. If the other person uses SimpleScheduler, share it as timetable data and they can add it to their own app.',
      },
    ],
  },
  {
    id: 'lessons',
    name: 'Lessons & personal schedule',
    tab: 'Lessons & personal',
    h1: ['Lessons & personal schedule', 'Your lessons and your own time on one page'],
    intro:
      'An example of a private tutor keeping their weekly lessons. Lessons and gym time that repeat every week go on one timetable, and prep work is linked to the lesson it is for.',
    steps: [
      {
        id: 'create',
        title: 'Make your lesson timetable',
        short: 'Name it “My lessons”. Show Monday to Saturday, from 7 am to 10 pm.',
        long: 'When you make a timetable you choose its name, the days it shows and the hours it covers. To fit the morning gym and evening lessons on one page, this one shows 7 am to 10 pm.',
      },
      {
        id: 'fill',
        title: 'Add lessons and your own plans',
        short: 'Grade 8 math Monday and Wednesday 4:00–5:30, Grade 10 math Tuesday and Thursday 5:00–6:30, plus the gym.',
        long: 'Times are set to the minute. A Saturday review session 10:00–12:00 and the gym on Tuesday and Thursday at 7 am are in too. Give lessons and personal plans different colors and free time is easy to spot.',
      },
      {
        id: 'unique',
        title: 'Your own photo behind it',
        short: 'Pick a background photo in the timetable settings and crop it. Lessons show on top in color.',
        long: 'A timetable can have a photo you choose as its background. Crop it to fit the timetable. A page you look at every day can look the way you like.',
      },
      {
        id: 'todo',
        title: 'Link prep work to a lesson',
        short: 'Link “Make midterm review sheet” to Grade 8 math. Tap the lesson to see what to prepare.',
        long: 'When you add a To-Do you choose the lesson it belongs to. Link prep work to each lesson, and tapping a lesson on the timetable shows what there is to do for it.',
      },
      {
        id: 'remind',
        title: 'A reminder before the lesson',
        short: 'Set a due time and a “1 hour before” reminder. An alarm screen tells you in time.',
        long: REMINDER_LONG,
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today and To-Do widgets. Check today’s lessons and prep from the home screen.',
        long: 'The weekly widget shows the week. The Today widget shows today’s lessons and tasks together, and the To-Do widget shows the task list. All of it is on the home screen, without opening the app.',
      },
      {
        id: 'widget_done',
        title: 'Check off prep in the widget',
        short: 'Review sheet done? Mark it complete right in the widget.',
        long: WIDGET_DONE_LONG,
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone and your lessons are there. See when the next one starts right away.',
        long: LOCK_LONG,
      },
    ],
    faq: [
      {
        q: 'Can I add plans that are not school classes?',
        a: 'Yes. Lessons, tutoring, the gym, a part-time job: anything that happens on the same day and time every week can go on a timetable.',
      },
      {
        q: 'Can I add early morning or late night plans?',
        a: 'Yes. Extend the hours the timetable covers as far as you need. It can also show all 24 hours of the day.',
      },
      {
        q: 'Can I add something that happens only once?',
        a: 'Timetables in SimpleScheduler are for things that repeat every week. For something that happens once, add a To-Do with a due date and set a reminder.',
      },
    ],
  },
];
