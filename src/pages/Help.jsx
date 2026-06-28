import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, School, Globe, Clock, Calendar, Trophy, FileText, User, Settings, MapPin, Users, CheckCircle, HelpCircle, ArrowRight, Mail, Shield, ClipboardList, Phone, XCircle, Hand } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'

const TABS = [
  { id: 'student', label: 'Student Handbook', icon: BookOpen },
  { id: 'volunteer', label: 'Volunteer Handbook', icon: Hand },
  { id: 'school', label: 'School Handbook', icon: School },
  { id: 'guest', label: 'Guest Guide', icon: Globe },
]

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-white mb-3">{title}</h3>
      <div className="space-y-2 text-sm text-earth-300 leading-relaxed">{children}</div>
    </div>
  )
}

function Step({ icon: Icon, label, description }) {
  return (
    <div className="flex gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="w-8 h-8 rounded-lg bg-brand-500/10 grid place-items-center shrink-0">
        {Icon && <Icon className="w-4 h-4 text-brand-400" />}
      </div>
      <div>
        <p className="font-medium text-white text-sm">{label}</p>
        <p className="text-xs text-earth-400 mt-0.5">{description}</p>
      </div>
    </div>
  )
}

function StudentHandbook() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Student Handbook</h2>
        <p className="text-sm text-earth-400">Everything you need to track volunteer hours, earn badges, and stay on top of your goals.</p>
      </div>

      <Section title="Getting Started">
        <p>After signing up, you'll land on your Dashboard. Take the quick tour to see your stats, weekly chart, and recent activity at a glance.</p>
        <div className="mt-3 space-y-2">
          <Step icon={User} label="Create an account" description="Sign up with your name, email, and password. You'll be logged in automatically." />
          <Step icon={Trophy} label="Set your first goal" description="Go to Settings to set a volunteer hour target and a deadline to stay motivated." />
          <Step icon={Clock} label="Log your first hours" description="Click 'Log hours' on the dashboard or use the + button on mobile to record a session." />
        </div>
      </Section>

      <Section title="Logging Hours">
        <p>Use the Log Hours page to record every volunteer session. Fill in the date, activity name, category, hours, and optional notes or location. You can also add supervisor contact information for verification.</p>
        <p className="mt-2">All logs are saved securely and appear instantly on your dashboard, calendar, and reports.</p>
      </Section>

      <Section title="Calendar View">
        <p>The Calendar page shows all your logged hours in a monthly calendar layout. Each day with logged hours displays the total. Click any day to see a breakdown of activities.</p>
        <p className="mt-2">Use it to spot gaps, track consistency, and review your volunteering history at a glance.</p>
      </Section>

      <Section title="Achievements & Badges">
        <p>As you log hours, you'll earn badges for milestones like your first log, hitting weekly goals, or reaching total hour thresholds. Badges appear as celebratory toasts and are collected on the Achievements page.</p>
        <p className="mt-2">Keep logging to unlock them all — badges are a fun way to stay motivated.</p>
      </Section>

      <Section title="Reports">
        <p>Generate a PDF report of all your logged hours from the Reports page. You can preview, download, or print the report. If you're linked to a school, you can also submit the report directly to your school for review.</p>
        <p className="mt-2">School submissions are reviewed by your school admin — you'll see the status (pending, approved, or rejected) on the Reports page.</p>
      </Section>

      <Section title="Needed Volunteers">
        <p>The Volunteer tab on your Dashboard shows open volunteer opportunities — it's a public community board, not tied to any school. Anyone with an account can post a task or sign up. No paperwork needed.</p>
        <div className="mt-3 space-y-2">
          <Step icon={MapPin} label="Browse tasks" description="See what's needed — each post shows a description, location, date, and how many volunteers are needed." />
          <Step icon={Phone} label="Organizer's phone" description="When you sign up, the organizer will see your request. Once they approve you, their phone number is revealed so you can coordinate." />
          <Step icon={ClipboardList} label="Post your own" description="Any registered user can post a task. Add a title, description, location, date, phone number, and how many people you need." />
        </div>
      </Section>

      <Section title="Organizer Dashboard (My Tasks)">
        <p>When you post a task, you get access to the <strong>My Tasks</strong> page (linked in the sidebar or from the Volunteer tab). Here you can manage signups and log hours.</p>
        <div className="mt-3 space-y-2">
          <Step icon={Users} label="Review signups" description="Each task expands to show everyone who signed up. Their status starts as Pending." />
          <Step icon={CheckCircle} label="Approve volunteers" description="Click Approve to accept a volunteer — this reveals your phone number to them so they can coordinate with you." />
          <Step icon={XCircle} label="Reject if needed" description="If someone shouldn't join, click Reject. They'll see the status on their end." />
          <Step icon={Clock} label="Log hours" description="Once approved, click 'Log hours' next to a volunteer, enter the hours and date. Saved directly to their account." />
          <Step icon={Phone} label="Your phone number" description="The phone number you entered when posting the task is shown on the My Tasks page. It's only shared with volunteers you approve." />
        </div>
      </Section>

      <Section title="Joining a School">
        <p>If your school uses VolunTrack, you can join by entering your school code in Settings. The code is provided by your school administrator.</p>
        <p className="mt-2">Once linked, you'll see your school name on your dashboard, access the school dashboard, and be able to submit reports for review.</p>
      </Section>

      <Section title="Profile & Settings">
        <p>Your Profile page shows your account info, total hours, and earned badges. In Settings, you can:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Change your name, email, or password</li>
          <li>Join or leave a school</li>
          <li>Set or update your volunteer hour goal</li>
          <li>Toggle dark/light theme</li>
          <li>Manage reminders</li>
        </ul>
      </Section>
    </div>
  )
}

function SchoolHandbook() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">School Handbook</h2>
        <p className="text-sm text-earth-400">How to manage your school dashboard, review student submissions, and post volunteer tasks.</p>
      </div>

      <Section title="School Dashboard Overview">
        <p>Your school dashboard gives you access to students, PDF submissions, and volunteer tasks. Navigate between tabs to manage each area.</p>
      </Section>

      <Section title="Managing Students">
        <p>The Students tab shows all students linked to your school. You can see each student's name, email, and grade. To add students, share your school code — students enter it in their Settings page to join.</p>
      </Section>

      <Section title="Reviewing PDF Submissions">
        <p>When students submit reports, they appear in the Reports tab. Each submission shows the student's name, submission date, and status.</p>
        <div className="mt-3 space-y-2">
          <Step icon={FileText} label="View submission" description="Click 'View' to open the PDF and read the student's report." />
          <Step icon={CheckCircle} label="Approve or reject" description="After reviewing, mark the submission as approved or rejected. Optionally add notes." />
          <Step icon={Mail} label="Student sees status" description="The student can check their submission status on their Reports page." />
        </div>
      </Section>

      <Section title="Posting Volunteer Tasks">
        <p>In the Volunteer tab, you can post volunteer opportunities for students. Fill in the title, description, location, date, time, and number of slots.</p>
        <p className="mt-2">Students will see open tasks on their Dashboard and can sign up. You'll be able to track how many slots are filled.</p>
      </Section>
    </div>
  )
}

function VolunteerHandbook() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Volunteer Task Maker Handbook</h2>
        <p className="text-sm text-earth-400">Post volunteer opportunities, manage signups, and log hours for your team.</p>
      </div>

      <Section title="Getting Started">
        <p>When you create an account, choose <strong>"I'm a Volunteer Task Maker"</strong>. You'll skip the school-related fields and go straight to posting tasks.</p>
        <div className="mt-3 space-y-2">
          <Step icon={Hand} label="Sign up as a Task Maker" description="Select 'Volunteer Task Maker' on the register page. Only name, email, and password needed." />
          <Step icon={ClipboardList} label="Post your first task" description="Go to the Volunteer tab, click 'Post a task', and fill in the details." />
          <Step icon={Users} label="Manage signups" description="Use the My Tasks page to review, approve, and log hours for volunteers." />
        </div>
      </Section>

      <Section title="Posting a Task">
        <p>Click the Volunteer tab on your Dashboard, then <strong>Post a task</strong>. You'll need to fill in:</p>
        <div className="mt-3 space-y-2">
          <Step icon={FileText} label="Title & description" description="Name your task and explain what volunteers will be doing." />
          <Step icon={MapPin} label="Location" description="Where the task takes place. Must be a real location so volunteers can find you." />
          <Step icon={Phone} label="Phone number" description="Required. Your phone number is kept private — only shared with volunteers you approve." />
          <Step icon={Calendar} label="Date, time & slots" description="When the task happens and how many volunteers you need." />
        </div>
        <p className="mt-2 text-xs text-earth-500">Once posted, your task appears on the public Needed Volunteers board for everyone to see.</p>
      </Section>

      <Section title="My Tasks Dashboard">
        <p>The <strong>My Tasks</strong> page (linked in your sidebar) is your organizer hub. Here you can manage everything about your posted tasks.</p>
        <div className="mt-3 space-y-2">
          <Step icon={Users} label="Review signups" description="Each task expands to show who signed up. You'll see their name, email, and signup status (Pending)." />
          <Step icon={CheckCircle} label="Approve volunteers" description="Click Approve to accept someone. This reveals your phone number to them so they can contact you." />
          <Step icon={XCircle} label="Reject if needed" description="Click Reject to decline. The volunteer will see the rejection status on their end." />
          <Step icon={Clock} label="Log hours" description="Once approved, click 'Log hours' next to a volunteer, enter the hours and date. The hours are saved to their account automatically — no approval needed." />
        </div>
      </Section>

      <Section title="Phone Number Privacy">
        <p>Your phone number is <strong>never shown</strong> on the public task board. It's only visible to you on the My Tasks page and to volunteers you specifically approve. This keeps your contact info private while still letting volunteers reach you.</p>
      </Section>

      <Section title="Tracking Your Own Hours">
        <p>You can also log your own volunteer hours on the Log Hours page — fill in the date, activity, category, and hours. View them on your Calendar and export reports from the Reports page.</p>
      </Section>

      <Section title="Profile & Settings">
        <p>In Settings you can:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li>Change your name, email, or password</li>
          <li>Toggle dark/light theme</li>
          <li>Manage reminders</li>
        </ul>
      </Section>
    </div>
  )
}

function GuestGuide() {
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Guest Guide</h2>
        <p className="text-sm text-earth-400">Learn what VolunTrack can do for you and how to get started.</p>
      </div>

      <Section title="What is VolunTrack?">
        <p>VolunTrack is a volunteer hour tracking app. It helps you log your volunteer sessions, track progress toward goals, earn achievement badges, and generate reports for school or personal records.</p>
      </Section>

      <Section title="Key Features">
        <div className="space-y-2 mt-3">
          <Step icon={Clock} label="Log hours" description="Record every volunteer session with date, activity, category, and hours." />
          <Step icon={Calendar} label="Calendar view" description="See your logged hours organized by month." />
          <Step icon={Trophy} label="Achievements" description="Earn badges as you hit milestones." />
          <Step icon={FileText} label="Reports" description="Export a PDF summary of all your hours." />
          <Step icon={School} label="School integration" description="Link to your school and submit reports for review." />
          <Step icon={Users} label="Volunteer tasks" description="Find and sign up for volunteer opportunities." />
        </div>
      </Section>

      <Section title="Getting Started">
        <p>Ready to start tracking? Here's what to do:</p>
        <div className="mt-3 space-y-2">
          <Step icon={User} label="Create an account" description={<span>Go to the <Link to="/register" className="text-brand-400 hover:underline">Sign Up</Link> page and enter your details.</span>} />
          <Step icon={Settings} label="Set up your profile" description="Add your grade, set a volunteer goal, and customize your experience." />
          <Step icon={School} label="Join your school" description="Ask your school for their code and enter it in Settings to link your account." />
          <Step icon={Clock} label="Start logging" description="Use the Log Hours page or the + button on mobile to record your first session." />
        </div>
      </Section>

      <Section title="Need More Help?">
        <p>If you have questions or run into issues, reach out through the <Link to="/contact" className="text-brand-400 hover:underline">Contact page</Link>.</p>
      </Section>
    </div>
  )
}

export default function Help() {
  const [tab, setTab] = useState('student')

  return (
    <AppLayout
      title="Help & Handbooks"
      subtitle="Guides for students, schools, and new users"
      action={
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                tab === t.id ? 'bg-brand-600 text-white' : 'text-earth-400 hover:text-white'
              }`}
            >
              <t.icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      }
    >
      {tab === 'student' && <StudentHandbook />}
      {tab === 'volunteer' && <VolunteerHandbook />}
      {tab === 'school' && <SchoolHandbook />}
      {tab === 'guest' && <GuestGuide />}
    </AppLayout>
  )
}
