import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, ShieldCheck, UserCheck, Lock, AlertTriangle, Mail, Users } from 'lucide-react'
import AppLayout from '@/components/AppLayout.jsx'
import Card from '@/components/Card.jsx'

export default function Terms() {
  return (
    <AppLayout
      title="Terms and Conditions"
      subtitle="VolunteerTrack Service Agreement"
      action={
        <Link to="/settings" className="btn-sm btn-ghost">
          <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
        </Link>
      }
    >
      <Card className="max-w-4xl mx-auto">
        <div className="prose prose-invert max-w-none">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-brand-400" />
            <h1 className="text-2xl font-bold text-white">Terms and Conditions for VolunteerTrack</h1>
          </div>
          
          <p className="text-sm text-earth-400 mb-6">Last Updated: July 9, 2026</p>
          
          <div className="bg-earth-900/50 border border-earth-800 rounded-lg p-4 mb-8">
            <p className="text-earth-300 leading-relaxed">
              Welcome to VolunteerTrack. Please read these Terms and Conditions ("Terms") carefully before using the VolunteerTrack mobile application and platform (the "Service") operated by VolunTrack ("us", "we", or "our") in partnership with your school ("School").
            </p>
            <p className="text-earth-300 leading-relaxed mt-3">
              By accessing or using the Service, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not access the Service.
            </p>
          </div>

          {/* Section 1 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <UserCheck className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">1. Account Creation and Eligibility</h2>
            </div>
            
            <div className="space-y-4 ml-7">
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Age Requirement</h3>
                <p className="text-earth-300">Users under the age of 18 must have permission from a parent or legal guardian to use the Service.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Accuracy</h3>
                <p className="text-earth-300">You must provide accurate, complete, and current information when creating an account.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Security</h3>
                <p className="text-earth-300">You are responsible for safeguarding the password used to access the Service and for any activities or actions under your password.</p>
              </div>
            </div>
          </div>

          {/* Section 2 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">2. Student Conduct and Volunteer Hours</h2>
            </div>
            
            <div className="space-y-4 ml-7">
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Honesty Policy</h3>
                <p className="text-earth-300">Users agree to log only genuine volunteer hours. Falsifying volunteer hours, checking into locations you are not physically at, or forging coordinator approvals is strictly prohibited and will be reported to the School administration.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Safety</h3>
                <p className="text-earth-300">While volunteering, students must adhere to the School's code of conduct and the rules of the specific volunteer organization. VolunteerTrack is a tracking tool and is not liable for incidents that occur at third-party volunteer sites.</p>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">3. Data Privacy and School Integration</h2>
            </div>
            
            <div className="space-y-4 ml-7">
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Student Privacy</h3>
                <p className="text-earth-300">We value student data privacy. We comply with relevant student data privacy laws (such as FERPA/COPPA where applicable). Student data will only be shared with authorized School administrators.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Data Usage</h3>
                <p className="text-earth-300">Volunteer data (hours, locations, and impact metrics) will be shared directly with the School to verify graduation, club, or course requirements.</p>
              </div>
            </div>
          </div>

          {/* Section 4 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">4. Intellectual Property</h2>
            </div>
            
            <div className="ml-7">
              <p className="text-earth-300">The Service and its original content, features, and functionality are and will remain the exclusive property of VolunTrack and its licensors. The app's design, code, and branding may not be copied or reproduced without written consent.</p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">5. Limitation of Liability</h2>
            </div>
            
            <div className="ml-7">
              <p className="text-earth-300">In no event shall VolunTrack, nor its directors, employees, or partners, be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the app or your participation in any volunteer events found through the app.</p>
            </div>
          </div>

          {/* Section 6 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">6. Changes to Terms</h2>
            </div>
            
            <div className="ml-7">
              <p className="text-earth-300">We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will notify users of any material changes by posting the new Terms within the app.</p>
            </div>
          </div>

          {/* Section 7 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Mail className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">7. Contact Us</h2>
            </div>
            
            <div className="ml-7">
              <p className="text-earth-300">If you have any questions about these Terms, please contact us at: <a href="mailto:volunteertrackinfo@gmail.com" className="text-brand-400 hover:text-brand-300">volunteertrackinfo@gmail.com</a></p>
            </div>
          </div>

          {/* Parent/Student Access Section */}
          <div className="bg-brand-900/20 border border-brand-800/30 rounded-lg p-6 mt-8">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-brand-400" />
              <h2 className="text-xl font-semibold text-white">Parent and Student Account Access</h2>
            </div>
            
            <div className="space-y-4 ml-7">
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Parent Account Creation</h3>
                <p className="text-earth-300">Parents and legal guardians may create their own accounts to monitor their child's volunteer hours and progress. Parent accounts require verification through a unique linking code provided by the student or school administration.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Parent-Student Linking System</h3>
                <p className="text-earth-300">Parents can link to their child's account using a secure, time-limited linking code generated by the student. Once linked, parents have read-only access to view volunteer hours, activities, and progress reports. This linking can be revoked by the student or school administrator at any time.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Parent Access Limitations</h3>
                <p className="text-earth-300">Parent accounts provide read-only access and cannot modify student data. Parents may view historical volunteer hours, current progress, and achievements but cannot log hours on behalf of the student or modify existing entries.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Student Control and Privacy</h3>
                <p className="text-earth-300">Students maintain control over their account privacy. Students can generate and revoke parent linking codes, choose which data to share, and manage access permissions. All linking activities are logged and can be reviewed by the student.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Teacher Access Privileges</h3>
                <p className="text-earth-300">Teachers and school staff have expanded access through school-administered accounts. Teachers can view student volunteer hours, approve submissions, provide feedback, and monitor progress across multiple students. Teacher accounts are created and managed by the school administration.</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-brand-300 mb-2">Account Verification and Security</h3>
                <p className="text-earth-300">All parent and teacher accounts must be verified through the school's official registration process or linking system. Unauthorized access to student data is strictly prohibited and may result in account termination and legal action. All access is logged and monitored for security purposes.</p>
              </div>
            </div>
          </div>

          <div className="border-t border-earth-800 mt-8 pt-6 text-center text-sm text-earth-500">
            <p>&copy; 2026 VolunTrack. All rights reserved.</p>
          </div>
        </div>
      </Card>
    </AppLayout>
  )
}