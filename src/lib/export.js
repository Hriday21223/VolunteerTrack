import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { fmtDate, fmtHours, hoursBetween } from '@/utils/date.js'

/** Generate a printable PDF report for the user's logs. When `returnBlob` is true, returns the PDF blob instead of downloading. */
export function exportLogsPDF({ user, logs, returnBlob }) {
  const doc = new jsPDF({ unit: 'pt' })
  const total = logs.reduce((s, l) => s + (Number(l.hours) || 0), 0)

  // Header
  doc.setFont('helvetica', 'bold').setFontSize(20)
  doc.text('Volunteer Service Log', 40, 50)
  doc.setFont('helvetica', 'normal').setFontSize(11)
  doc.setTextColor(90)
  doc.text(user?.name || 'Volunteer', 40, 70)
  if (user?.school) doc.text(user.school, 40, 86)
  doc.text(`Generated ${new Date().toLocaleDateString()}`, 40, 102)
  doc.setTextColor(0)
  doc.setFont('helvetica', 'bold').setFontSize(13)
  doc.text(`Total: ${fmtHours(total)}`, 420, 70, { align: 'left' })

  autoTable(doc, {
    startY: 120,
    head: [['Date', 'Activity', 'Category', 'Hours', 'Supervisor']],
    body: logs.map((l) => [
      fmtDate(l.date),
      l.activity || '',
      l.category || '',
      fmtHours(Number(l.hours) || 0),
      l.supervisorName || '',
    ]),
    headStyles: { fillColor: [63, 131, 68] },
    styles: { fontSize: 10, cellPadding: 6 },
    alternateRowStyles: { fillColor: [241, 248, 241] },
  })

  if (returnBlob) {
    return doc.output('blob')
  }
  doc.save('volunteer-log.pdf')
}

/** Build a CSV string from the user's logs. */
export function exportLogsCSV(logs) {
  const rows = [
    ['Date', 'Activity', 'Category', 'Hours', 'Start', 'End', 'Location', 'Supervisor', 'Verified', 'Notes'],
    ...logs.map((l) => [
      l.date || '',
      (l.activity || '').replaceAll(',', ' '),
      l.category || '',
      l.hours ?? '',
      l.startTime || '',
      l.endTime || '',
      (l.location || '').replaceAll(',', ' '),
      (l.supervisorName || '').replaceAll(',', ' '),
      l.verified ? 'yes' : 'no',
      (l.notes || '').replaceAll(/\n/g, ' ').replaceAll(',', ' '),
    ]),
  ]
  return rows.map((r) => r.map(csvCell).join(',')).join('\n')
}

function csvCell(v) {
  const s = String(v ?? '')
  return /[",\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s
}

/** Printable certificate — opens the browser print dialog. */
export function printCertificate({ user, totalHours, goalReached }) {
  const w = window.open('', '_blank', 'width=820,height=1000')
  if (!w) return
  const name = user?.name || 'Volunteer'
  const school = user?.school || ''
  w.document.write(`
    <html><head><title>Certificate of Service</title>
    <style>
      body { font-family: 'Plus Jakarta Sans', Inter, sans-serif; background:#f1f8f1;
             margin:0; padding:40px; display:flex; align-items:center; justify-content:center; min-height:100vh; }
      .frame { background:white; border:8px double #3f8344; padding:48px 64px; max-width:720px; text-align:center; }
      h1 { color:#27542d; font-size:36px; margin:0 0 8px; letter-spacing:1px; }
      .sub { color:#6c502d; font-size:14px; letter-spacing:2px; text-transform:uppercase; }
      .name { font-size:42px; color:#214327; margin:24px 0 8px; font-weight:700; }
      .body { color:#3a3024; font-size:15px; line-height:1.6; margin-top:16px; }
      .hours { font-size:28px; color:#3f8344; margin:24px 0; font-weight:700; }
      .sig { margin-top:48px; display:flex; justify-content:space-between; color:#6c502d; font-size:13px; }
      .sig div { border-top:1px solid #6c502d; padding-top:6px; width:200px; }
    </style></head>
    <body>
      <div class="frame">
        <div class="sub">Certificate of Service</div>
        <h1>VolunTrack</h1>
        <div class="body">This certifies that</div>
        <div class="name">${escapeHtml(name)}</div>
        ${school ? `<div class="body">${escapeHtml(school)}</div>` : ''}
        <div class="body">has generously contributed</div>
        <div class="hours">${fmtHours(totalHours)} of volunteer service</div>
        <div class="body">
          ${goalReached
            ? 'and has reached their service goal — a true community hero.'
            : 'in service of their community.'}
        </div>
        <div class="sig">
          <div>Date</div>
          <div>VolunTrack</div>
        </div>
      </div>
      <script>window.onload=()=>window.print();</script>
    </body></html>
  `)
  w.document.close()
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]))
}

/** Generate school room creation PDF with 100 rules and signature pages */
export function generateSchoolRoomPDF({ schoolName, schoolId, adminName, date }) {
  const doc = new jsPDF({ unit: 'pt' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 40
  const contentWidth = pageWidth - 2 * margin
  let yPos = margin

  // Helper to add new page
  const addPage = () => {
    doc.addPage()
    yPos = margin
  }

  // Helper to check if we need a new page
  const checkPageBreak = (neededSpace) => {
    if (yPos + neededSpace > pageHeight - margin) {
      addPage()
    }
  }

  // 1. Cover Page
  doc.setFont('helvetica', 'bold').setFontSize(28)
  doc.text('School Room Creation Document', pageWidth / 2, 80, { align: 'center' })
  
  doc.setFont('helvetica', 'normal').setFontSize(14)
  doc.setTextColor(90)
  yPos = 120
  doc.text(`School Name: ${schoolName}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 25
  doc.text(`School ID: ${schoolId}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 25
  doc.text(`Date Created: ${date}`, pageWidth / 2, yPos, { align: 'center' })
  yPos += 25
  doc.text(`Created By: ${adminName}`, pageWidth / 2, yPos, { align: 'center' })
  
  // Add decorative border
  doc.setDrawColor(63, 131, 68)
  doc.setLineWidth(2)
  doc.rect(margin, margin, contentWidth, pageHeight - 2 * margin)
  doc.setTextColor(0)

  // 2. School Room Creation Document
  addPage()
  doc.setFont('helvetica', 'bold').setFontSize(18)
  doc.text('School Room Creation Document', margin, yPos)
  yPos += 30
  
  doc.setFont('helvetica', 'normal').setFontSize(12)
  doc.text('Purpose of the Room', margin, yPos)
  yPos += 20
  const purposeText = 'This room is designated for approved school activities and educational purposes. It serves as a dedicated space for students, teachers, and authorized members to collaborate, learn, and engage in school-sanctioned activities.'
  const purposeLines = doc.splitTextToSize(purposeText, contentWidth)
  doc.text(purposeLines, margin, yPos)
  yPos += purposeLines.length * 18 + 20
  
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text('Organization Responsibilities', margin, yPos)
  yPos += 20
  doc.setFont('helvetica', 'normal').setFontSize(12)
  const orgText = 'The organization responsible for this room must ensure proper maintenance, safety compliance, and appropriate usage. All activities conducted in this room must align with school policies and educational objectives.'
  const orgLines = doc.splitTextToSize(orgText, contentWidth)
  doc.text(orgLines, margin, yPos)
  yPos += orgLines.length * 18 + 30

  // 3. 100 Room Rules
  doc.setFont('helvetica', 'bold').setFontSize(18)
  doc.text('100 Room Rules', margin, yPos)
  yPos += 30
  
  const rules = [
    'The room must be used for approved school activities only.',
    'Students must respect all members using the room.',
    'The room must be kept clean and organized.',
    'Equipment must be handled carefully.',
    'Food and drinks must follow school policies.',
    'Unauthorized people cannot access the room.',
    'Members must follow school safety procedures.',
    'Noise levels must be appropriate.',
    'Furniture must not be moved without permission.',
    'Damaged equipment must be reported immediately.',
    'Users must sign in upon entering the room.',
    'Users must sign out when leaving the room.',
    'Personal belongings should not be left unattended.',
    'The room must be locked when not in use.',
    'Emergency exits must remain accessible at all times.',
    'Fire safety equipment must not be tampered with.',
    'First aid kits must be maintained and accessible.',
    'Hazardous materials are strictly prohibited.',
    'Electrical equipment must be used safely.',
    'Cables and cords must be properly managed.',
    'Wifi and network access must be used responsibly.',
    'School devices must not be removed from the room.',
    'Personal software installation is prohibited.',
    'Copyright laws must be respected.',
    'Academic integrity must be maintained.',
    'Bullying and harassment are strictly prohibited.',
    'Respectful communication is required at all times.',
    'Cultural diversity must be respected.',
    'Inclusive behavior is expected from all users.',
    'Conflicts must be resolved through proper channels.',
    'Vandalism and property damage will result in disciplinary action.',
    'Graffiti and unauthorized markings are prohibited.',
    'Walls and surfaces must not be damaged.',
    'Windows and blinds must be treated with care.',
    'Lighting must be used appropriately.',
    'Heating and cooling systems must not be tampered with.',
    'Energy conservation must be practiced.',
    'Lights and equipment must be turned off when not in use.',
    'Water conservation must be practiced.',
    'Sinks and facilities must be kept clean.',
    'Restroom breaks must be taken at appropriate times.',
    'Proper hygiene must be maintained.',
    'Waste must be disposed of properly.',
    'Recycling guidelines must be followed.',
    'Room capacity limits must be observed.',
    'Overcrowding is not permitted.',
    'Assembly areas must be used for group activities.',
    'Individual study spaces must be respected.',
    'Group work must not disturb others.',
    'Phone calls must be taken outside the room.',
    'Mobile devices must be used silently.',
    'Headphones must be used for audio content.',
    'Photography and recording require permission.',
    'Social media usage must follow school policies.',
    'Online activities must be appropriate.',
    'Gaming is prohibited during academic hours.',
    'Streaming services must not be used for non-educational content.',
    'Music must be played at appropriate levels.',
    'Musical instruments require specific authorization.',
    'Art supplies must be used responsibly.',
    'Projects must be cleaned up after completion.',
    'Storage areas must be organized.',
    'Lost and found items must be reported.',
    'Found items must be turned in to authorities.',
    'Borrowed items must be returned promptly.',
    'Library books and materials must be treated with care.',
    'Furniture must not be rearranged without permission.',
    'Desks and chairs must be returned to original positions.',
    'Whiteboards must be cleaned after use.',
    'Markers must be capped after use.',
    'Projectors and screens must be handled carefully.',
    'Audiovisual equipment must be operated by authorized users.',
    'Remote controls must be returned to their storage.',
    'Laser pointers must be used safely and responsibly.',
    'Presentation materials must be prepared in advance.',
    'Handouts and materials must be distributed responsibly.',
    'Posters and displays must be approved.',
    'Decorations must follow school guidelines.',
    'Seasonal decorations must be removed timely.',
    'Plants and natural elements must be maintained.',
    'Pets and animals are not permitted unless authorized.',
    'Allergies and medical conditions must be reported.',
    'Medical emergencies must be reported immediately.',
    'Emergency drills must be taken seriously.',
    'Evacuation procedures must be followed.',
    'Shelter-in-place procedures must be understood.',
    'Emergency contacts must be up to date.',
    'Visitor policies must be followed.',
    'Guest speakers require prior approval.',
    'Parent meetings must be scheduled through proper channels.',
    'Maintenance issues must be reported promptly.',
    'Cleaning schedules must be observed.',
    'End-of-day procedures must be followed.',
    'Security badges must be worn if required.',
    'Identification must be presented if requested.',
    'Keys and access cards must not be shared.',
    'Alarm systems must not be triggered without cause.',
    'Security cameras must not be tampered with.',
    'Parking regulations must be followed.',
    'Transportation arrangements must be made in advance.',
    'Field trip preparation must be done in the room.',
    'Permission slips must be submitted on time.',
    'Attendance must be recorded accurately.',
    'Tardiness must be reported to appropriate staff.',
    'Early dismissal requires proper authorization.',
    'Homework and assignments must be completed independently.',
    'Cheating and plagiarism are strictly prohibited.',
    'Tests and quizzes must be taken honestly.',
    'Grading policies must be understood and followed.',
    'Appeals processes must be followed if needed.',
    'Academic resources must be used ethically.',
    'Research must be conducted responsibly.',
    'Citations and references must be properly formatted.',
    'Group projects must reflect equal participation.',
    'Peer review must be constructive and respectful.',
    'Teacher feedback must be considered and applied.',
    'Progress reports must be reviewed with parents/guardians.',
    'School events must be attended when required.',
    'Awards and achievements must be celebrated appropriately.',
    'School spirit must be demonstrated positively.',
    'Traditions and customs must be respected.',
    'School property must be protected and preserved.',
    'Room reservations must be made through proper channels.',
    'Cancellation policies must be followed.',
    'Late fees and penalties must be paid on time.',
    'Room usage logs must be maintained accurately.',
    'Feedback and suggestions must be submitted constructively.',
    'Continuous improvement must be embraced.',
    'School pride must be demonstrated daily.',
    'These rules are subject to change with proper notice.',
    'All school policies must be read and understood.',
    'Questions about rules must be directed to staff.',
    'Ignorance of rules is not an acceptable excuse.',
    'Compliance with all rules is mandatory.',
    'Violations will result in appropriate consequences.',
    'The room is a shared responsibility for all users.'
  ]

  doc.setFont('helvetica', 'normal').setFontSize(10)
  rules.forEach((rule, index) => {
    checkPageBreak(20)
    const ruleText = `${index + 1}. ${rule}`
    const ruleLines = doc.splitTextToSize(ruleText, contentWidth)
    doc.text(ruleLines, margin, yPos)
    yPos += ruleLines.length * 14 + 6
  })

  // 4. Terms & Conditions
  addPage()
  doc.setFont('helvetica', 'bold').setFontSize(18)
  doc.text('Terms & Conditions', margin, yPos)
  yPos += 30
  
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text('Room Usage Requirements', margin, yPos)
  yPos += 20
  doc.setFont('helvetica', 'normal').setFontSize(11)
  const usageText = 'By using this room, all users agree to abide by the 100 rules outlined in this document. The room is a privilege and can be revoked for non-compliance. Users must maintain the highest standards of conduct and respect for fellow users and school property.'
  const usageLines = doc.splitTextToSize(usageText, contentWidth)
  doc.text(usageLines, margin, yPos)
  yPos += usageLines.length * 16 + 20
  
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text('Organization Responsibilities', margin, yPos)
  yPos += 20
  doc.setFont('helvetica', 'normal').setFontSize(11)
  const orgRespText = 'The organization responsible for this room must ensure proper maintenance, safety compliance, and appropriate usage. Regular inspections will be conducted to ensure compliance with all rules and regulations. Any violations must be addressed promptly and appropriately.'
  const orgRespLines = doc.splitTextToSize(orgRespText, contentWidth)
  doc.text(orgRespLines, margin, yPos)
  yPos += orgRespLines.length * 16 + 20
  
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text('School Policies', margin, yPos)
  yPos += 20
  doc.setFont('helvetica', 'normal').setFontSize(11)
  const policyText = 'All school policies regarding conduct, safety, and usage must be followed at all times. These policies include but are not limited to: academic integrity, anti-bullying, non-discrimination, drug-free environment, and any other policies established by the school administration.'
  const policyLines = doc.splitTextToSize(policyText, contentWidth)
  doc.text(policyLines, margin, yPos)
  yPos += policyLines.length * 16 + 30

  // 5. Approval Section
  doc.setFont('helvetica', 'bold').setFontSize(18)
  doc.text('Approval Section', margin, yPos)
  yPos += 30
  
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text('School Administrator Approval', margin, yPos)
  yPos += 40
  doc.setFont('helvetica', 'normal').setFontSize(10)
  doc.text('Name: ________________________________', margin, yPos)
  yPos += 25
  doc.text('Signature: __________________________', margin, yPos)
  yPos += 25
  doc.text('Date: ________________________________', margin, yPos)
  yPos += 40
  
  doc.setFont('helvetica', 'bold').setFontSize(12)
  doc.text('Organization Leader Approval', margin, yPos)
  yPos += 40
  doc.setFont('helvetica', 'normal').setFontSize(10)
  doc.text('Name: ________________________________', margin, yPos)
  yPos += 25
  doc.text('Signature: __________________________', margin, yPos)
  yPos += 25
  doc.text('Date: ________________________________', margin, yPos)
  yPos += 40

  // 6. Signature Pages (100 signature spaces)
  for (let page = 0; page < 10; page++) {
    addPage()
    doc.setFont('helvetica', 'bold').setFontSize(16)
    doc.text(`Signature Page ${page + 1}`, margin, yPos)
    yPos += 30
    
    doc.setFont('helvetica', 'normal').setFontSize(9)
    for (let i = 0; i < 10; i++) {
      const signatureNum = page * 10 + i + 1
      checkPageBreak(50)
      
      doc.text(`${signatureNum}.`, margin, yPos)
      doc.text('Name: ________________________________', margin + 20, yPos)
      yPos += 18
      doc.text('Role: ________________________________', margin + 20, yPos)
      yPos += 18
      doc.text('Signature: __________________________', margin + 20, yPos)
      yPos += 18
      doc.text('Date: ________________________________', margin + 20, yPos)
      yPos += 25
    }
  }

  return doc
}
