export const ACTIVITY_CATEGORIES = [
  'Community Service',
  'Environmental',
  'Education & Tutoring',
  'Health & Wellness',
  'Animal Welfare',
  'Arts & Culture',
  'Sports & Coaching',
  'Religious & Faith',
  'Political & Advocacy',
  'Disaster Relief',
  'Other',
]

export const categoryColor = (cat) => {
  const map = {
    'Community Service':   'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
    'Environmental':      'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
    'Education & Tutoring':'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200',
    'Health & Wellness':  'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
    'Animal Welfare':     'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
    'Arts & Culture':     'bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200',
    'Sports & Coaching':  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200',
    'Religious & Faith':  'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200',
    'Political & Advocacy':'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
    'Disaster Relief':    'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
    'Other':              'bg-earth-100 text-earth-800 dark:bg-[#243529] dark:text-earth-200',
  }
  return map[cat] || map.Other
}
