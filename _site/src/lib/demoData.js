import { createReminder as _create, updateReminder as _update, deleteReminder as _del,
         listReminders as _list, markFired, clearFired } from '@/api/index.js'
import { computeNextAt, dueReminders } from '@/lib/scheduler.js'

/**
 * Seed data: realistic volunteer logs across the last ~6 weeks.
 * Lets a new user land on a populated dashboard instead of an empty one.
 */
export function buildDemoLogs() {
  const now = new Date()
  const iso = (daysAgo, h = 0, m = 0) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    d.setHours(9 + h, m, 0, 0)
    return d.toISOString()
  }
  const day = (daysAgo) => {
    const d = new Date(now)
    d.setDate(d.getDate() - daysAgo)
    return d.toISOString().slice(0, 10)
  }
  return [
    { activity: 'Park cleanup',                  category: 'Environmental',      hours: 2.5, date: day(38),  startTime: '09:00', endTime: '11:30', location: 'Riverside Park',          supervisorName: 'Maria Chen',  supervisorEmail: 'm.chen@parks.org',  notes: 'Cleared invasive ivy along the east trail.',          verified: true  },
    { activity: 'Food bank sorting',             category: 'Community Service',  hours: 3,   date: day(32),  startTime: '13:00', endTime: '16:00', location: 'City Food Bank',          supervisorName: 'David Park',  supervisorEmail: 'david@cfb.org',     notes: 'Sorted 240 lbs of donations.',                          verified: true  },
    { activity: 'Math tutoring',                 category: 'Education & Tutoring', hours: 1.5, date: day(28),  startTime: '16:00', endTime: '17:30', location: 'Lincoln Library',         supervisorName: 'Aisha Khan',  supervisorEmail: 'a.khan@school.edu', notes: 'Helped two 7th graders with fractions.',               verified: true  },
    { activity: 'Animal shelter dog walking',    category: 'Animal Welfare',     hours: 2,   date: day(21),  startTime: '10:00', endTime: '12:00', location: 'Happy Paws Shelter',      supervisorName: 'Tom Rivera',  supervisorEmail: 'tom@happypaws.org', notes: 'Walked four dogs, socialized two kittens.',            verified: false },
    { activity: 'Community garden weeding',      category: 'Environmental',      hours: 4,   date: day(14),  startTime: '08:30', endTime: '12:30', location: 'Greenway Community Garden', supervisorName: 'Lia Okafor', supervisorEmail: 'lia@greenway.org', notes: 'Spring prep — turned three compost bins.',             verified: true  },
    { activity: 'Soup kitchen',                  category: 'Community Service',  hours: 2,   date: day(10),  startTime: '11:00', endTime: '13:00', location: 'St. Andrew\'s Church',    supervisorName: 'Fr. Michael', supervisorEmail: 'michael@standrews.org', notes: 'Served lunch to ~80 guests.',                       verified: true  },
    { activity: 'Blood drive volunteer',         category: 'Health & Wellness',  hours: 5,   date: day(7),   startTime: '09:00', endTime: '14:00', location: 'Town Hall',               supervisorName: 'Sarah Lin',   supervisorEmail: 's.lin@redcross.org', notes: 'Registered donors, monitored canteen.',                verified: true  },
    { activity: 'Youth basketball coaching',     category: 'Sports & Coaching',  hours: 1.5, date: day(4),   startTime: '17:00', endTime: '18:30', location: 'YMCA',                    supervisorName: 'Coach Reyes',  supervisorEmail: 'reyes@ymca.org',     notes: 'Drilled defense with the U10 group.',                  verified: true  },
    { activity: 'Library book shelving',         category: 'Arts & Culture',     hours: 2,   date: day(2),   startTime: '14:00', endTime: '16:00', location: 'Central Library',         supervisorName: 'Jen Park',    supervisorEmail: 'j.park@library.org', notes: 'Shelved new arrivals in the YA section.',             verified: true  },
    { activity: 'Beach cleanup',                 category: 'Environmental',      hours: 3,   date: day(0),   startTime: '08:00', endTime: '11:00', location: 'Sunset Beach',            supervisorName: 'Carlos Diaz', supervisorEmail: 'carlos@savetheshore.org', notes: 'Picked up 18 lbs of plastic and 6 bags of trash.', verified: true  },
  ].map((l) => ({ ...l, createdAt: iso(38 - l.hours, 0, 0) }))
}

export function buildDemoGoals() {
  return [
    { title: '50 hours by June',  targetHours: 50, primary: true  },
    { title: '100 hours this year', targetHours: 100, primary: false },
  ]
}

export function buildDemoReminders() {
  // Use createReminder (not the raw upsert) so it gets an id and createdAt
  const presets = [
    { title: 'Log your hours', body: 'Take a moment to record this week\'s volunteer work.', kind: 'weekly', time: '17:00', weekday: 5, enabled: true },
    { title: 'Sunday prep', body: 'Plan your volunteer week ahead.', kind: 'weekly', time: '20:00', weekday: 0, enabled: true },
  ]
  return presets.map((p) => _create(p))
}
