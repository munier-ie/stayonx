import React, { useState } from 'react';
import { BentoCard } from '../components/BentoCard';
import { Shield, Lock, FileText, Scale } from 'lucide-react';

export const PrivacyTerms: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Header */}
      <div className="pt-24 pb-12 text-center max-w-3xl mx-auto px-6">
        <h1 className="text-4xl md:text-5xl font-light text-gray-900 tracking-tight mb-6">
          Legal & <span className="font-normal">Privacy.</span>
        </h1>
        <p className="text-lg text-gray-500 font-light mb-10">
          Transparency is core to our mission. Here is how we handle your data and the rules of the game.
        </p>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <div className="bg-gray-100 p-1 rounded-lg flex items-center">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`px-8 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'privacy'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Shield className="w-4 h-4" />
              Privacy Policy
            </button>
            <button
              onClick={() => setActiveTab('terms')}
              className={`px-8 py-2.5 text-sm font-medium rounded-md transition-all duration-200 flex items-center gap-2 ${
                activeTab === 'terms'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              <Scale className="w-4 h-4" />
              Terms of Service
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6">
        <BentoCard className="p-8 md:p-12 min-h-[600px]" noPadding>
          {activeTab === 'privacy' ? (
            <div className="space-y-12 animate-fade-in-up">
              <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-blue-50 rounded-lg">
                        <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-medium text-gray-900">Privacy Policy</h2>
                </div>
                <p className="text-sm text-gray-500 border-b border-gray-100 pb-8">Last updated: December 16, 2024</p>
              </div>

              {/* Quick Summary Box */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">The Short Version</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We built StayOnX to help you stay consistent on X, not to harvest your data. We only collect what we need to make the features work, and we're upfront about every bit of it. Your tweet content and DMs? We never see them. Your personal browsing? None of our business. Everything we collect is explained in plain English below—no legal gymnastics required.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">1. What We Collect (and What We Don't)</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Let's be specific. Here's exactly what data the extension accesses when you install and use StayOnX:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                    <li><strong>Your X Profile Basics:</strong> Your handle (like @yourname), display name, and profile picture URL. We grab these so you show up on leaderboards and your team can recognize you in Spaces. This data leaves your browser and is stored on our servers—it's essential for the social features to work across devices and for other users to see you on leaderboards.</li>
                    <li><strong>Activity Counts Only:</strong> We count how many tweets, replies, and DMs you send while using the extension. That's it—just the numbers and timestamps. We never read, store, or transmit the actual content of anything you write. Your thoughts, opinions, and conversations remain entirely yours. The counts are synced to our servers to power your streaks, consistency scores, and leaderboard rankings.</li>
                    <li><strong>Session Info:</strong> When you log in through our authentication flow, we store secure tokens locally in your browser to keep you signed in between sessions. These tokens are also sent to our servers to verify your identity when syncing data. This is standard practice for any app that needs to remember who you are.</li>
                    <li><strong>Space Membership:</strong> If you join or create a Space (team), we store your membership information so you can participate in team leaderboards and see your teammates' progress. This includes which Spaces you belong to and your role within them.</li>
                    <li><strong>Goal Settings:</strong> Any personal or team goals you set within the extension (like "post 5 tweets daily") are stored on our servers so they persist across devices and can be shared with your Space if you choose.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  <strong>What we explicitly don't collect:</strong> The text of your tweets, replies, or DMs—ever. Your browsing history outside of X. Your followers or following lists. Your location or IP address for tracking purposes. Your direct messages or private conversations. Your email contacts. Any data from other websites or apps. Basically, anything that isn't directly needed for tracking your posting consistency metrics stays completely private.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">2. Why We Collect This Data</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Every piece of data we collect has a clear, specific purpose. We believe in the principle of data minimization—if we don't need it, we don't ask for it. Here's the reasoning behind each data point:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                    <li><strong>Profile info (handle, name, avatar):</strong> So you have a recognizable identity on leaderboards and in Spaces. Without this, the competitive and team features wouldn't work—you'd just be an anonymous number. Your teammates need to know who's who, and you deserve credit for your consistency.</li>
                    <li><strong>Activity counts:</strong> To calculate your daily streaks, weekly consistency score, and where you rank on leaderboards. This is literally the core of what StayOnX does. Without tracking these numbers, we couldn't tell you if you're hitting your goals or show you your progress over time.</li>
                    <li><strong>Session tokens:</strong> To keep you logged in so you don't have to re-authenticate every single time you open X or switch devices. Nobody wants to log in repeatedly—this makes your experience smooth and seamless.</li>
                    <li><strong>Space membership:</strong> To enable team features like shared leaderboards, collective goals, and team challenges. If you're building in public with a community, you need to be connected to that community within the app.</li>
                    <li><strong>Goal settings:</strong> So your goals persist and sync across all your devices. Set a goal on your laptop, see it on your phone. Simple as that.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  We don't collect data "just in case" or for future features we haven't built yet. We don't build shadow profiles or collect data we might find useful someday. If we don't need it right now for a feature you're actively using, we don't ask for it. And if we ever need new data for a new feature, we'll update this policy and let you know.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">3. Where Your Data Goes</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Transparency matters. Here's exactly what stays on your device and what gets transmitted to our servers:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                    <li><strong>Data that leaves your browser:</strong> Your profile info (handle, name, avatar URL), activity counts (number of tweets, replies, DMs with timestamps), authentication tokens, Space memberships, and goal settings are all sent to our servers. This transmission happens over encrypted HTTPS connections. We need this data on our servers to power cross-device sync, calculate leaderboard rankings, aggregate team statistics, and ensure your progress is never lost if you switch browsers or devices.</li>
                    <li><strong>Data that stays in your browser:</strong> Some cached data is stored locally in your browser's extension storage for faster loading—things like your recent activity display and UI preferences. However, all the core data mentioned above does get transmitted to and stored on our servers. The local cache is just for performance; the source of truth lives on our infrastructure.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  <strong>Our infrastructure providers:</strong> Your data is stored on Supabase (our database provider, hosted on AWS infrastructure) and served through Vercel (our hosting provider). These companies have their own strict security and privacy standards. They process data on our behalf under agreements that require them to protect your information.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  <strong>Who else sees your data?</strong> We don't sell, rent, trade, or give away your information to advertisers, data brokers, or anyone else looking to profit from your data. Period. The only third parties with any access are: (1) our infrastructure providers mentioned above, who only process data as needed to run the service, and (2) law enforcement, but only if legally compelled by a valid court order or subpoena—and we'd push back on overly broad requests.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">4. Cookies and Local Storage</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Let's talk about cookies and browser storage, since these terms get thrown around a lot:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                    <li><strong>Extension storage:</strong> The browser extension uses Chrome/Firefox's built-in extension storage APIs to cache your session data and preferences. This is local to your browser and helps the extension load faster.</li>
                    <li><strong>Website cookies:</strong> Our website (stayonx.com) uses essential cookies to keep you logged in and remember your session. We don't use tracking cookies, advertising cookies, or third-party analytics cookies that follow you around the web.</li>
                    <li><strong>No cross-site tracking:</strong> We don't participate in any ad networks or tracking systems. We don't know or care what other websites you visit.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  The data stored locally in your browser (via extension storage or cookies) stays on your device unless explicitly synced to our servers as described above. You can clear this local data anytime through your browser settings, though this may log you out.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">5. How We Keep It Safe</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Security isn't just a checkbox for us—it's fundamental to earning your trust. Here's what we do to protect your data:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                    <li><strong>Encryption in transit:</strong> All data transmitted between your browser and our servers uses HTTPS/TLS encryption. This means anyone trying to intercept the data would only see scrambled nonsense.</li>
                    <li><strong>Encryption at rest:</strong> Your data is encrypted when stored in our database. Even if someone somehow accessed the raw database files, they couldn't read your information without the encryption keys.</li>
                    <li><strong>Secure authentication:</strong> We use industry-standard OAuth flows and secure token handling. Passwords (if applicable) are hashed using modern algorithms—we never store them in plain text.</li>
                    <li><strong>Reputable providers:</strong> We use Supabase and Vercel, companies with dedicated security teams, regular audits, and compliance certifications. We're standing on the shoulders of experts.</li>
                    <li><strong>Minimal access:</strong> Only essential team members have access to production data, and even then, access is logged and audited.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  That said, let's be honest: no system is 100% bulletproof. We can't guarantee absolute security because nobody can. What we can promise is that we take it seriously, follow best practices, and continuously work to improve. If we ever discover a breach affecting your data, we'll notify affected users within 72 hours with details about what happened and what we're doing about it.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">6. Data Retention</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We keep your data for as long as you're actively using StayOnX. If you stop using the service, your data remains on our servers in case you come back—we don't want you to lose your streaks and history. However, if you want your data deleted, just ask and we'll remove it within 30 days. After account deletion, we may retain anonymized, aggregated statistics (like "X users achieved 30-day streaks this month") that can't be traced back to you—this helps us understand how the product is used and improve it for everyone.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">7. Your Rights and Control</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You're in control of your data. Here's what you can do:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600">
                    <li><strong>Access your data:</strong> Want to see what we have on you? Just ask. We'll send you a copy of all the data associated with your account.</li>
                    <li><strong>Correct your data:</strong> If something's wrong, let us know and we'll fix it.</li>
                    <li><strong>Delete your data:</strong> You can request complete deletion of your account and all associated data. We'll process this within 30 days.</li>
                    <li><strong>Stop collection immediately:</strong> Uninstall the extension and all data collection stops that instant. Your historical data remains on our servers unless you request deletion.</li>
                    <li><strong>Export your data:</strong> We can provide your data in a standard format if you want to take it elsewhere.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-4">
                  No hoops to jump through, no 47-step processes, no "please call this number during business hours" nonsense. Just reach out to us and we'll take care of it promptly.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">8. Children's Privacy</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX is not intended for children under 13 years old. We don't knowingly collect personal information from children under 13. If you're a parent or guardian and believe your child has provided us with personal information, please contact us immediately and we'll delete it. Since our service is tied to X (Twitter) accounts, users should also comply with X's own age requirements.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">9. Changes to This Policy</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We may update this Privacy Policy from time to time. When we do, we'll update the "Last updated" date at the top. For significant changes—like collecting new types of data or sharing with additional third parties—we'll notify you through the extension or via email if you've provided one. We encourage you to review this policy periodically. Your continued use of StayOnX after changes constitutes acceptance of the updated policy.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">10. Contact Us</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Questions? Concerns? Want to exercise your data rights? We're real people who actually read and respond to messages. Reach out to us on X @StayOnX or through our website. We aim to respond to all privacy-related inquiries within 48 hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-12 animate-fade-in-up">
              <div>
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gray-50 rounded-lg">
                        <FileText className="w-5 h-5 text-gray-900" />
                    </div>
                    <h2 className="text-2xl font-medium text-gray-900">Terms of Service</h2>
                </div>
                <p className="text-sm text-gray-500 border-b border-gray-100 pb-8">Last updated: December 16, 2024</p>
              </div>

              {/* Quick Summary Box */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">The Gist</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX is a tool to help you build consistent posting habits on X. Use it fairly, don't try to game the system, and respect other users. We'll do our best to keep the service running smoothly. Below are the full details, written in plain language.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">1. Acceptance of Terms</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  By installing the StayOnX browser extension or accessing our website and services (collectively, the "Service"), you agree to be bound by these Terms of Service. This is a legal agreement between you and StayOnX. If you disagree with any part of these terms, please don't use the Service—we'd rather you walk away happy than stay and be frustrated.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  These terms apply to all users, whether you're using StayOnX for free or as part of a paid plan. Some features may have additional terms that we'll present when you access them.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">2. What StayOnX Does</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX is a productivity and habit-tracking tool designed specifically for X (formerly Twitter) users. The Service helps you:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Track your posting activity (tweets, replies, DMs) to build consistency</li>
                    <li>Maintain streaks and view your progress over time</li>
                    <li>Set personal or team goals for your X activity</li>
                    <li>Join or create Spaces to track progress with teammates, friends, or communities</li>
                    <li>Compete on leaderboards and earn achievement badges</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  We track activity counts only—we never read, store, or analyze the actual content of your posts or messages. StayOnX is about building habits, not surveilling conversations.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">3. Account Responsibilities</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  When you create a StayOnX account (by logging in through X), you're responsible for:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>Keeping your account secure:</strong> Don't share your login credentials. If you suspect unauthorized access, let us know immediately.</li>
                    <li><strong>Accurate information:</strong> The profile information pulled from X (your handle, name, avatar) should be your real account. Don't use StayOnX with accounts that impersonate others.</li>
                    <li><strong>Your activity:</strong> You're responsible for all activity that occurs under your account. If your little brother uses your laptop and does something against these terms, that's still on you.</li>
                    <li><strong>One account per person:</strong> Please don't create multiple StayOnX accounts to game leaderboards or circumvent any restrictions.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">4. Acceptable Use</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX is a tool for building genuine posting habits. We want everyone to have a fair, positive experience. You agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>Spam or harass:</strong> Don't use StayOnX as motivation to spam X with low-quality content or to harass other users. Quality matters more than quantity.</li>
                    <li><strong>Game the system:</strong> Don't use bots, automation tools, or other software to artificially inflate your activity counts. If your streaks aren't earned through genuine activity, what's the point?</li>
                    <li><strong>Reverse engineer:</strong> Don't attempt to reverse engineer, decompile, or extract the source code of our extension or APIs. If you're curious how something works, just ask us.</li>
                    <li><strong>Abuse the service:</strong> Don't attempt to overload our servers, exploit vulnerabilities, or interfere with other users' access to the Service.</li>
                    <li><strong>Violate X's terms:</strong> Your use of StayOnX should also comply with X's Terms of Service. If your X account gets suspended, your StayOnX account may be affected too.</li>
                    <li><strong>Misrepresent yourself:</strong> Don't impersonate StayOnX staff, other users, or claim false affiliations in Spaces.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  <strong>Consequences:</strong> Violation of these rules may result in warnings, temporary suspension, or permanent termination of your account, depending on severity. We aim to be fair but firm—we want StayOnX to be a positive community.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">5. Spaces and Community Features</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Spaces are shared areas where groups of users can track progress together. If you create or join a Space:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>Space creators</strong> are responsible for moderating their Space and can remove members who violate community standards.</li>
                    <li><strong>Public Spaces</strong> are visible to all StayOnX users. Be mindful that your activity and stats will be visible to anyone who joins.</li>
                    <li><strong>Private Spaces</strong> require an invite to join. Content and member lists are only visible to Space members.</li>
                    <li>We reserve the right to remove Spaces that violate these terms or are used to coordinate harassment or other harmful activities.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">6. Intellectual Property</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Let's be clear about who owns what:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>Our stuff:</strong> The StayOnX name, logo, extension code, website design, and all associated intellectual property belong to us. You can't use our branding without permission.</li>
                    <li><strong>Your stuff:</strong> Your X content remains yours. We don't claim any ownership over your tweets, profile, or anything you create on X. We only track activity counts, remember?</li>
                    <li><strong>Feedback:</strong> If you send us suggestions or feedback, we may use those ideas to improve StayOnX without any obligation to compensate you. Of course, we appreciate the help!</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">7. Third-Party Services</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX integrates with X (Twitter) and relies on their platform. We also use third-party services for infrastructure (Supabase, Vercel). A few things to note:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Changes to X's platform or API could affect StayOnX functionality. We'll do our best to adapt, but some disruptions may be beyond our control.</li>
                    <li>We're not responsible for X's policies, outages, or decisions. If X changes something that affects your experience, that's between you and X.</li>
                    <li>Links to third-party websites from our Service don't imply endorsement. Visit external sites at your own discretion.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">8. Service Availability</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We work hard to keep StayOnX running smoothly, but we can't promise 100% uptime. The Service is provided "as is" and we make no guarantees about:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Uninterrupted availability—servers need maintenance, bugs happen, and sometimes things break.</li>
                    <li>Complete accuracy of activity tracking—while we strive for precision, edge cases may result in minor discrepancies.</li>
                    <li>Preservation of data forever—we recommend you don't rely solely on StayOnX as a permanent record of your X activity.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  We reserve the right to modify, suspend, or discontinue any part of the Service at any time. If we're shutting down entirely, we'll give reasonable notice so you can export your data.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">9. Disclaimer of Warranties</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX is provided "as is" and "as available" without warranties of any kind, either express or implied. We don't warrant that the Service will meet your specific requirements, be error-free, or that any defects will be corrected. You use StayOnX at your own risk. This doesn't affect any rights you have under consumer protection laws that can't be waived by contract.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">10. Limitation of Liability</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  To the maximum extent permitted by law, StayOnX and its creators, employees, partners, and affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li>Loss of profits, data, use, goodwill, or other intangible losses</li>
                    <li>Damages resulting from your access to, use of, or inability to use the Service</li>
                    <li>Any conduct or content of any third party on the Service</li>
                    <li>Unauthorized access, use, or alteration of your data</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  In plain English: if something goes wrong, we're not liable for damages beyond what you've paid us (if anything). We're a small team doing our best, not a giant corporation with unlimited resources.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">11. Indemnification</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You agree to defend, indemnify, and hold harmless StayOnX and its team from any claims, damages, losses, or expenses (including legal fees) arising from your use of the Service, your violation of these Terms, or your violation of any rights of another person or entity. Basically, if you do something that gets us in trouble, you're responsible for cleaning up the mess.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">12. Termination</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Either party can end this relationship at any time:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                    <li><strong>You can leave:</strong> Uninstall the extension and stop using the Service whenever you want. Request account deletion if you want your data removed.</li>
                    <li><strong>We can terminate:</strong> We may suspend or terminate your account for violations of these Terms, prolonged inactivity, or at our discretion with reasonable notice.</li>
                </ul>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  Upon termination, your right to use the Service ends. Sections of these Terms that should survive termination (like limitations of liability) will continue to apply.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">13. Disclaimer About X (Twitter)</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  StayOnX is an independent product created by third-party developers. We are not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with X Corp (formerly Twitter, Inc.), or any of its subsidiaries or affiliates. The official X website can be found at x.com. The name "X" and related marks are trademarks of X Corp.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  We built StayOnX because we love the platform and wanted a better way to stay consistent. But we're just enthusiastic users ourselves, not X employees or partners.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">14. Governing Law</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles. Any disputes arising from these Terms or your use of the Service will be resolved through good-faith negotiation first. If that fails, disputes will be handled through binding arbitration or in courts of competent jurisdiction.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">15. Changes to These Terms</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  We may update these Terms from time to time. When we make significant changes, we'll update the "Last updated" date and notify you through the extension or our website. Your continued use of StayOnX after changes take effect means you accept the new Terms. If you don't agree with changes, you should stop using the Service.
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  We encourage you to review these Terms periodically—boring as they may be, they're important.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">16. Contact Us</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Questions about these Terms? Want to report a violation? Just want to say hi? Reach out to us on X @StayOnX or through our website. We're real people who actually read our messages, and we'll get back to you as quickly as we can.
                </p>
              </div>
            </div>
          )}
        </BentoCard>
      </div>
    </div>
  );
};