"use client";

import {
  Shield,
  Lock,
  Eye,
  Database,
  Users,
  Mail,
  FileText,
  AlertCircle,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-8 h-8 text-gray-900 dark:text-white" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Privacy Policy
            </h1>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Last updated: January 21, 2026
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            At VFurniture, we are committed to protecting your privacy and
            ensuring the security of your personal information. This Privacy
            Policy explains how we collect, use, disclose, and safeguard your
            information when you visit our website and use our services. Please
            read this policy carefully to understand our practices regarding
            your personal data.
          </p>
        </div>

        {/* Table of Contents */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5 mb-6">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-3">
            Table of Contents
          </h2>
          <div className="space-y-2">
            <a
              href="#information-collection"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              1. Information We Collect
            </a>
            <a
              href="#how-we-use"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              2. How We Use Your Information
            </a>
            <a
              href="#information-sharing"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              3. Information Sharing and Disclosure
            </a>
            <a
              href="#data-security"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              4. Data Security
            </a>
            <a
              href="#cookies"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              5. Cookies and Tracking Technologies
            </a>
            <a
              href="#your-rights"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              6. Your Privacy Rights
            </a>
            <a
              href="#third-party"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              7. Third-Party Services
            </a>
            <a
              href="#data-retention"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              8. Data Retention
            </a>
            <a
              href="#children"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              9. Children's Privacy
            </a>
            <a
              href="#changes"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              10. Changes to This Policy
            </a>
            <a
              href="#contact"
              className="block text-sm text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              11. Contact Us
            </a>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {/* Section 1 */}
          <section
            id="information-collection"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                1. Information We Collect
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Personal Information
                </h3>
                <p className="leading-relaxed mb-2">
                  When you create an account or place an order, we collect:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Name and contact information (email, phone number)</li>
                  <li>Shipping and billing addresses</li>
                  <li>
                    Payment information (processed securely through payment
                    providers)
                  </li>
                  <li>Order history and preferences</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Automatically Collected Information
                </h3>
                <p className="leading-relaxed mb-2">
                  When you visit our website, we automatically collect:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website addresses</li>
                  <li>Click patterns and browsing behavior</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Information from Third Parties
                </h3>
                <p className="leading-relaxed">
                  We may receive information about you from third-party services
                  such as social media platforms if you choose to connect your
                  account, or from payment processors to verify transactions.
                </p>
              </div>
            </div>
          </section>

          {/* Section 2 */}
          <section
            id="how-we-use"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Eye className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                2. How We Use Your Information
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We use the collected information for the following purposes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Order Processing:</strong> To process and fulfill your
                  orders, including payment processing, shipping, and delivery
                </li>
                <li>
                  <strong>Customer Service:</strong> To respond to your
                  inquiries, provide support, and resolve issues
                </li>
                <li>
                  <strong>Account Management:</strong> To create and manage your
                  account, including authentication and security
                </li>
                <li>
                  <strong>Communication:</strong> To send order confirmations,
                  shipping updates, and important account notifications
                </li>
                <li>
                  <strong>Marketing:</strong> To send promotional emails about
                  new products, special offers, and updates (with your consent)
                </li>
                <li>
                  <strong>Personalization:</strong> To customize your shopping
                  experience and show relevant product recommendations
                </li>
                <li>
                  <strong>Analytics:</strong> To analyze website usage, improve
                  our services, and enhance user experience
                </li>
                <li>
                  <strong>Legal Compliance:</strong> To comply with legal
                  obligations and protect our rights
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3 */}
          <section
            id="information-sharing"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                3. Information Sharing and Disclosure
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We do not sell your personal information to third parties. We
                may share your information with:
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Service Providers
                </h3>
                <p className="leading-relaxed">
                  We work with trusted third-party service providers who assist
                  us in operating our website, processing payments, shipping
                  orders, and providing customer service. These providers have
                  access to your information only to perform specific tasks on
                  our behalf and are obligated to protect your data.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Legal Requirements
                </h3>
                <p className="leading-relaxed">
                  We may disclose your information if required by law, court
                  order, or government regulation, or if we believe disclosure
                  is necessary to protect our rights, your safety, or the safety
                  of others.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Business Transfers
                </h3>
                <p className="leading-relaxed">
                  In the event of a merger, acquisition, or sale of assets, your
                  information may be transferred to the acquiring entity. We
                  will notify you of any such change in ownership.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4 */}
          <section
            id="data-security"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Lock className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                4. Data Security
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We implement industry-standard security measures to protect your
                personal information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>SSL/TLS encryption for data transmission</li>
                <li>
                  Secure payment processing through certified payment gateways
                </li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection and privacy</li>
              </ul>
              <p className="leading-relaxed mt-3">
                While we strive to protect your information, no method of
                transmission over the internet or electronic storage is 100%
                secure. We cannot guarantee absolute security but continuously
                work to improve our security practices.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section
            id="cookies"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                5. Cookies and Tracking Technologies
              </h2>
            </div>

            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to enhance your
                browsing experience and collect information about how you use
                our website.
              </p>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Types of Cookies We Use
                </h3>
                <ul className="list-disc list-inside space-y-2 ml-2">
                  <li>
                    <strong>Essential Cookies:</strong> Required for website
                    functionality, including authentication and shopping cart
                  </li>
                  <li>
                    <strong>Performance Cookies:</strong> Help us understand how
                    visitors interact with our website
                  </li>
                  <li>
                    <strong>Functional Cookies:</strong> Remember your
                    preferences and settings
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Track your browsing
                    activity to show relevant advertisements
                  </li>
                </ul>
              </div>

              <p className="leading-relaxed">
                You can control cookies through your browser settings. However,
                disabling certain cookies may affect website functionality and
                your user experience.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section
            id="your-rights"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                6. Your Privacy Rights
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                You have the following rights regarding your personal
                information:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  <strong>Access:</strong> Request a copy of the personal
                  information we hold about you
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information (subject to legal requirements)
                </li>
                <li>
                  <strong>Opt-Out:</strong> Unsubscribe from marketing
                  communications at any time
                </li>
                <li>
                  <strong>Data Portability:</strong> Request your data in a
                  structured, machine-readable format
                </li>
                <li>
                  <strong>Restriction:</strong> Request restriction of
                  processing in certain circumstances
                </li>
                <li>
                  <strong>Object:</strong> Object to processing of your personal
                  information for certain purposes
                </li>
              </ul>
              <p className="leading-relaxed mt-3">
                To exercise these rights, please contact us at
                vfurnitureshelp@gmail.com. We will respond to your request
                within 30 days.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section
            id="third-party"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Users className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                7. Third-Party Services
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                Our website may contain links to third-party websites and
                services. We are not responsible for the privacy practices of
                these external sites. We encourage you to review their privacy
                policies before providing any personal information.
              </p>
              <p className="leading-relaxed">
                We use the following third-party services:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Payment processors (for secure payment processing)</li>
                <li>Shipping carriers (for order delivery)</li>
                <li>Email service providers (for communication)</li>
                <li>Analytics tools (for website performance analysis)</li>
              </ul>
            </div>
          </section>

          {/* Section 8 */}
          <section
            id="data-retention"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Database className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                8. Data Retention
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We retain your personal information for as long as necessary to
                fulfill the purposes outlined in this Privacy Policy, unless a
                longer retention period is required by law.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>
                  Account information: Retained while your account is active
                </li>
                <li>
                  Order history: Retained for 7 years for tax and legal purposes
                </li>
                <li>
                  Marketing data: Retained until you opt-out or request deletion
                </li>
                <li>Website analytics: Typically retained for 26 months</li>
              </ul>
              <p className="leading-relaxed mt-3">
                When we no longer need your information, we will securely delete
                or anonymize it.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section
            id="children"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                9. Children's Privacy
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                Our website is not intended for children under the age of 18. We
                do not knowingly collect personal information from children. If
                you are a parent or guardian and believe your child has provided
                us with personal information, please contact us immediately, and
                we will take steps to delete such information.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section
            id="changes"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <FileText className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                10. Changes to This Policy
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                We may update this Privacy Policy from time to time to reflect
                changes in our practices or legal requirements. We will notify
                you of any material changes by posting the updated policy on our
                website and updating the "Last updated" date at the top of this
                page.
              </p>
              <p className="leading-relaxed">
                We encourage you to review this Privacy Policy periodically to
                stay informed about how we protect your information. Your
                continued use of our website after any changes indicates your
                acceptance of the updated policy.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section
            id="contact"
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6"
          >
            <div className="flex items-start gap-3 mb-4">
              <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                11. Contact Us
              </h2>
            </div>

            <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
              <p className="leading-relaxed">
                If you have any questions, concerns, or requests regarding this
                Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-2">
                <p>
                  <strong>Email:</strong> vfurnitureshelp@gmail.com
                </p>
                <p>
                  <strong>Phone:</strong> +91 123 456 7890
                </p>
                <p>
                  <strong>Business Hours:</strong> Monday - Saturday, 9:00 AM -
                  6:00 PM IST
                </p>
              </div>
              <p className="leading-relaxed mt-3">
                We are committed to resolving any privacy concerns you may have
                and will respond to your inquiry within 30 days.
              </p>
            </div>
          </section>
        </div>

        {/* Footer Notice */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                Your Privacy is Our Priority
              </h3>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                At VFurniture, we are committed to transparency and protecting
                your personal information. If you have any questions or concerns
                about how we handle your data, please don't hesitate to reach
                out to our support team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
