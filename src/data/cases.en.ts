import type { CaseDef } from '../lib/types';

/**
 * English copy for the six cases. Not a translation of the Korean cases: the same eight steps, with
 * names, subjects and times that fit an English-speaking school week (design section 9).
 * Every sentence states something the app does today. Elementary, middle school and kids' activities
 * are told by a parent (the app's stated audience is 16+).
 */
export const CASES_EN: CaseDef[] = [
  {
    id: 'elementary_school',
    name: 'Elementary school timetable',
    tab: 'Elementary',
    guideLine: "Let's keep the school schedule together",
    h1: ['Elementary school timetable', 'Your child’s school day, to the minute'],
    intro:
      'An example of a parent making a timetable for a fourth grader. Classes go in with their real start and end times, and things to pack are linked to the class that needs them.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable for Emma',
        short: 'Name it “Emma · Grade 4”. Show Monday to Friday, from 8 am to 3 pm.',
        long: 'Each timetable has its own name, days and hours. Emma goes to school Monday to Friday and is done at 2:45 pm, so this one shows 8 am to 3 pm only.',
      },
      {
        id: 'fill',
        title: 'Add classes at their real times',
        short: 'Reading 8:30–9:15, Math 9:20–10:05. Times are set to the minute.',
        long: 'Class times are set to the minute, so a 45-minute class and a 5-minute break go in exactly as the school has them. Reading, Math, Science and Art each get their own color. Lunch from 11:45 to 12:20 is left empty.',
      },
      {
        id: 'unique',
        title: 'Put a favorite photo behind it',
        short: 'Put a photo Emma picked behind the timetable. Classes show on top of it.',
        long: 'Choose a background photo in the timetable settings and crop it to fit. Classes stay on top as colored blocks, so the timetable is still easy to read.',
      },
      {
        id: 'todo',
        title: 'Link things to pack to a class',
        short: 'Link “Pack colored pencils” to Thursday’s Art class. Tap that class and the task shows with it.',
        long: 'Write what to pack as a To-Do and link it to the class that needs it. Link “Pack colored pencils” to Thursday’s Art class and it appears when you tap that class on the timetable. There is no need to write which class it is for.',
      },
      {
        id: 'remind',
        title: 'Get a reminder before it is due',
        short: 'Set a due time and turn on a reminder. An alarm screen tells you before it is due.',
        long: 'The due time is the evening before Art, with a “30 minutes before” reminder. When the time comes an alarm screen opens on the phone, in time to pack the pencils.',
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today overview and To-Do widgets. See Emma’s day without opening the app.',
        long: 'The weekly widget shows Emma’s week, and the Today overview widget shows today’s classes together with what to pack. The To-Do widget lists only the tasks. On a parent’s phone they show a child’s day at a glance.',
      },
      {
        id: 'widget_done',
        title: 'Check off tasks in the widget',
        short: 'Pencils in the bag? Mark the task complete right in the widget.',
        long: 'Put the pencils in the bag, mark the task complete in the widget, and it is done. Open the app later and the To-Do list shows it as complete too.',
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Turn on the lock screen timetable and it is there when you wake the phone.',
        long: 'The lock screen timetable is view-only. Nothing can be edited or deleted while the phone is locked. In the morning, today’s classes are right there when the phone wakes.',
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
    guideLine: "Let's sort out this term together",
    h1: ['Middle school timetable', 'Classes and practice on one page'],
    intro:
      'An example of a parent and a seventh grader making a timetable together: 45-minute periods, soccer practice on weekdays and tutoring on Saturday, all on one page.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable with Noah',
        short: 'Name it “Noah · Grade 7 Fall”. Show hours up to 6 pm, when practice ends.',
        long: 'Noah’s timetable covers 8 am to 6 pm. First period starts at 8:15 am and soccer practice ends at 6 pm. For now it shows Monday to Friday.',
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
        title: 'Link a project to its class',
        short: 'Link “Science project report” to Friday’s Science class and set it due on Friday.',
        long: 'A To-Do has a due date and a class it is linked to. Tap that Science class on the timetable and the project shows with it, so it is always clear which class a task belongs to.',
      },
      {
        id: 'remind',
        title: 'A reminder the day before',
        short: 'Set the reminder to “1 day before” and an alarm screen tells you a day ahead.',
        long: 'The report is due Friday morning, with a “1 day before” reminder. On Thursday morning an alarm screen opens. Tap “Snooze for 5 minutes” and it rings once more five minutes later.',
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'The weekly widget shows the week, the Today overview widget shows today, and the To-Do widget shows homework.',
        long: 'There are three widgets: weekly, Today overview and To-Do. Choose Noah’s timetable when you place the weekly widget, and the home screen tells you whether today is a practice day.',
      },
      {
        id: 'widget_done',
        title: 'Check off homework in the widget',
        short: 'Has Noah finished the report? Mark it complete right in the widget.',
        long: 'Mark the report complete in the To-Do widget. Tasks due today can be completed in the Today overview widget too. The app’s To-Do list updates with it, so there is nothing to check off twice.',
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone and the timetable is there. Check what time Noah is done today without opening the app.',
        long: 'Turn on “Show weekly table on lock screen” in settings and Noah’s timetable appears every time the phone wakes. It only shows the timetable; nothing changes until the phone is unlocked.',
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
    guideLine: 'Classes and assignments, together',
    h1: ['High school timetable', 'Seven periods and study time at a glance'],
    intro:
      'An example of a high school junior making their own timetable: seven 50-minute periods, an evening study block, and projects and presentations linked to the classes they are for.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable for the semester',
        short: 'Name it “Junior year · Fall”. Show hours up to 9 pm, when the study block ends.',
        long: 'Give the new semester’s timetable a name, then pick its days and hours. First period starts at 8:00 am and the evening study block ends at 9 pm, so this one shows 8 am to 9 pm.',
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
        short: 'Link “Prepare English presentation” to Thursday’s English class. Tap that class and the task shows with it.',
        long: 'Add projects, presentations and homework as To-Dos and link each to the class it is for. Tap that class on the timetable to see what is due for it.',
      },
      {
        id: 'remind',
        title: 'Know the day before it is due',
        short: 'Set a due time and a “1 day before” reminder. An alarm screen opens a day ahead.',
        long: 'The due time is the start of first period on presentation day, with a “1 day before” reminder. The alarm screen opens at the same time the day before. A reminder can be set from 5 minutes to 1 day ahead.',
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today overview and To-Do widgets. Check today’s classes and what is due from the home screen.',
        long: 'A look at the home screen in the morning is enough to know which class is in which period. The Today overview widget puts today’s classes and tasks in one place.',
      },
      {
        id: 'widget_done',
        title: 'Check off finished work in the widget',
        short: 'Done preparing? Mark it complete right in the widget.',
        long: 'When something like presentation prep is finished, mark it complete right in the widget. Completed tasks can be found again in the app’s completed list.',
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone between classes and the timetable is there. See the next period right away.',
        long: 'Wake the phone between classes and the weekly timetable shows before you unlock. Check the next period and put the phone away. Classes cannot be edited from the lock screen.',
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
    guideLine: "Let's build this semester together",
    h1: ['College class schedule', 'Rooms and assignments on one page'],
    intro:
      'An example of a college student setting up this semester’s classes. Each class has its room and professor, and assignments are linked to the class until they are due.',
    steps: [
      {
        id: 'create',
        title: 'Make this semester’s schedule',
        short: 'Name it “Fall semester”. Show only the days and hours you have class.',
        long: 'You can make a new timetable every semester. Name this one “Fall semester” and leave out the days and hours when you have no class.',
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
        short: 'Tap Monday’s Data Structures to see its room, professor and linked assignments on one screen.',
        long: 'Tap a class on the timetable to see its day and time, room, professor and note. Assignments linked to that class are on the same screen, so there is no need to look for them separately.',
      },
      {
        id: 'todo',
        title: 'Link an assignment to its class',
        short: 'Link “Submit Data Structures lab” to Monday’s Data Structures and set it due at 6:00 pm.',
        long: 'A To-Do has a due date, a due time and a class it is linked to. Once an assignment is linked, it shows up when you tap that class.',
      },
      {
        id: 'remind',
        title: 'A reminder before the deadline',
        short: 'Set the reminder to “1 hour before” and an alarm screen opens at 5:00 pm.',
        long: 'The lab is due at 6:00 pm, so “1 hour before” opens an alarm screen at 5:00 pm. Switch to “1 day before” for more room. On the alarm screen you can dismiss it or snooze it for five minutes.',
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today overview and To-Do widgets. Check today’s classes and assignments from the home screen.',
        long: 'Use the weekly widget for this week’s classes and the To-Do widget for assignments. The Today overview widget alone shows today’s classes and assignments together.',
      },
      {
        id: 'widget_done',
        title: 'Check off assignments in the widget',
        short: 'Lab submitted? Mark it complete right in the widget.',
        long: 'After handing in the lab, mark it complete in the widget. Either widget works: the To-Do widget or the Today overview widget.',
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone on the way to class and the timetable is there. See your next class right away.',
        long: 'With the lock screen timetable on, you can check your next class while walking. It is for viewing only: to change something, unlock the phone and open the app.',
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
    guideLine: 'Never miss an activity day',
    h1: ['Kids’ activities schedule', 'One timetable per child, in one app'],
    intro:
      'An example of a parent organizing after-school activities for two children. Each child has their own timetable, and things to pack are linked to the activity that needs them.',
    steps: [
      {
        id: 'create',
        title: 'Make a timetable for Lily',
        short: 'Name it “Lily”. Show Monday to Saturday so the Saturday swim lesson fits.',
        long: 'Make a timetable under the child’s name and choose its days and hours. Lily has activities after school and a swim lesson on Saturday morning, so hers shows Monday to Saturday.',
      },
      {
        id: 'fill',
        title: 'Add after-school activities',
        short: 'Piano on Tuesday and Thursday 4:30–5:15, karate on Monday, Wednesday and Friday 5:00–6:00.',
        long: 'Start and end times for each activity are set to the minute. Art club on Monday and Wednesday 3:15–4:15 and the Saturday swim lesson 10:00–11:00 are in too. Each activity has its own color, so it is clear at a glance where to go today.',
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
        long: 'The due time is when you leave for the swim lesson, with a “30 minutes before” reminder. The alarm screen opens half an hour before you go, which leaves time to pack the bag.',
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today overview and To-Do widgets. See where Lily goes today from the home screen.',
        long: 'Each time you place a weekly widget you choose the timetable it shows. That way Lily’s week and Max’s week can each have a widget on the home screen.',
      },
      {
        id: 'widget_done',
        title: 'Check off what is packed',
        short: 'Swim bag packed? Mark it complete right in the widget.',
        long: 'Once the swim bag is packed, tap complete in the widget. It can be done on the way out the door, without opening the app.',
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone and the timetable is there. Check pick-up time without opening the app.',
        long: 'Before leaving to pick up the children, wake the phone and the timetable is there. The lock screen timetable is turned on and off in settings, and nothing can be changed while the phone is locked.',
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
    guideLine: 'Your weekly plans, sorted together',
    h1: ['Lessons & personal schedule', 'Your lessons and your own time on one page'],
    intro:
      'An example of a private tutor keeping their weekly lessons. Lessons and gym time that repeat every week go on one timetable, and prep work is linked to the lesson it is for.',
    steps: [
      {
        id: 'create',
        title: 'Make your lesson timetable',
        short: 'Name it “My lessons”. Show Monday to Saturday, from 7 am to 10 pm.',
        long: 'To fit lessons and personal plans on one page, this timetable covers a wide range: 7 am to 10 pm, Monday to Saturday. The morning gym and the evening lessons both fit.',
      },
      {
        id: 'fill',
        title: 'Add lessons and your own plans',
        short: 'Grade 8 math Monday and Wednesday 4:00–5:30, Grade 10 math Tuesday and Thursday 5:00–6:30, plus the gym.',
        long: 'Lesson times can be set to the minute. A Saturday review session 10:00–12:00 and the gym on Tuesday and Thursday at 7 am are in too. Give lessons and personal plans different colors and free time is easy to spot.',
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
        short: 'Link “Make midterm review sheet” to Wednesday’s Grade 8 math. Tap that lesson to see what to prepare.',
        long: 'When you add a To-Do you choose the lesson it belongs to. Link prep work to each lesson, and tapping a lesson on the timetable shows what there is to do for it.',
      },
      {
        id: 'remind',
        title: 'A reminder before the lesson',
        short: 'Set a due time and a “1 hour before” reminder. An alarm screen tells you in time.',
        long: 'The due time is the start of the lesson, with a “1 hour before” reminder. When the alarm screen opens an hour ahead, there is time for a last look at the sheet. A To-Do needs a due date and a due time before a reminder can be turned on.',
      },
      {
        id: 'widgets',
        title: 'Three home screen widgets',
        short: 'Weekly, Today overview and To-Do widgets. Check today’s lessons and prep from the home screen.',
        long: 'The weekly widget on the home screen shows this week’s lessons, and the To-Do widget shows your prep tasks. There is no need to open the app between lessons.',
      },
      {
        id: 'widget_done',
        title: 'Check off prep in the widget',
        short: 'Review sheet done? Mark it complete right in the widget.',
        long: 'When the review sheet is finished, mark it complete in the home screen widget. It stays marked as complete in the app’s To-Do list.',
      },
      {
        id: 'lock_screen',
        title: 'See it on the lock screen',
        short: 'Wake the phone and your lessons are there. See when the next one starts right away.',
        long: 'The lock screen timetable helps on days with several lessons. Wake the phone to see when the next one starts. On the locked screen you can look, not edit.',
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
