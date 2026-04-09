"use client";

import { Shield, FileText, AlertCircle, CheckCircle } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-8 h-8 text-gray-900 dark:text-white" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Terms of Service
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Last Updated: January 2025
            </p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Introduction */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Agreement to Terms
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      Welcome to V Furnitures. By accessing or using our website and services,
                      you agree to be bound by these Terms of Service. If you do not agree to
                      these terms, please do not use our services.
                    </p>
                    <p className="leading-relaxed">
                      These terms apply to all visitors, users, and others who access or use
                      our service. Please read these terms carefully before using our website.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Use of Service */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Use of Service
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  You must be at least 18 years old to use our services. By using our website,
                  you represent and warrant that you are of legal age to form a binding contract.
                </p>
                <p className="leading-relaxed">
                  You agree to use our services only for lawful purposes and in accordance with
                  these Terms. You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Use the service in any way that violates applicable laws or regulations</li>
                  <li>Engage in any conduct that restricts or inhibits anyone's use of the service</li>
                  <li>Attempt to gain unauthorized access to any portion of the service</li>
                  <li>Use any automated system to access the service without our permission</li>
                  <li>Impersonate or attempt to impersonate the company or another user</li>
                </ul>
              </div>
            </section>

            {/* Account Registration */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Account Registration
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  To access certain features of our service, you may be required to create an
                  account. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate, current, and complete information during registration</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
              </div>
            </section>

            {/* Products and Orders */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Products and Orders
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  All product descriptions, images, and prices are subject to change without
                  notice. We reserve the right to limit quantities and discontinue products.
                </p>
                <p className="leading-relaxed">
                  We strive to display product colors and images as accurately as possible.
                  However, actual colors may vary due to monitor settings and lighting conditions.
                </p>
                <p className="leading-relaxed">
                  By placing an order, you make an offer to purchase products. We reserve the
                  right to accept or decline your order for any reason, including product
                  availability, errors in pricing, or suspected fraud.
                </p>
              </div>
            </section>

            {/* Pricing and Payment */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Pricing and Payment
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  All prices are listed in Indian Rupees (INR) and include applicable taxes
                  unless otherwise stated. We reserve the right to change prices at any time.
                </p>
                <p className="leading-relaxed">
                  Payment must be made at the time of order placement. We accept various payment
                  methods including credit/debit cards, UPI, and net banking through our secure
                  payment gateway.
                </p>
                <p className="leading-relaxed">
                  If payment fails or is declined, your order will not be processed. You are
                  responsible for ensuring sufficient funds and valid payment information.
                </p>
              </div>
            </section>

            {/* Shipping and Delivery */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping and Delivery
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Delivery times are estimates and not guaranteed. We are not liable for delays
                  caused by shipping carriers or circumstances beyond our control.
                </p>
                <p className="leading-relaxed">
                  Risk of loss and title for products pass to you upon delivery to the carrier.
                  You are responsible for inspecting products upon delivery and reporting any
                  damage within 48 hours.
                </p>
              </div>
            </section>

            {/* Returns and Refunds */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Returns and Refunds
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Please refer to our Refund and Return Policy for detailed information about
                  returns, exchanges, and refunds. By making a purchase, you agree to our
                  return policy terms.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Intellectual Property Rights
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  The service and its original content, features, and functionality are owned
                  by V Furnitures and are protected by international copyright, trademark,
                  patent, trade secret, and other intellectual property laws.
                </p>
                <p className="leading-relaxed">
                  You may not reproduce, distribute, modify, create derivative works of,
                  publicly display, or exploit any content from our service without our prior
                  written permission.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Limitation of Liability
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  To the maximum extent permitted by law, V Furnitures shall not be liable for
                  any indirect, incidental, special, consequential, or punitive damages resulting
                  from your use of or inability to use the service.
                </p>
                <p className="leading-relaxed">
                  Our total liability for any claims arising from your use of the service shall
                  not exceed the amount you paid for products purchased through our service.
                </p>
              </div>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Disclaimer
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  The service is provided on an "AS IS" and "AS AVAILABLE" basis without
                  warranties of any kind, either express or implied. We do not warrant that
                  the service will be uninterrupted, secure, or error-free.
                </p>
              </div>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Governing Law
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws
                  of India, without regard to its conflict of law provisions.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Changes to Terms
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  We reserve the right to modify these Terms at any time. We will notify you
                  of any changes by posting the new Terms on this page and updating the "Last
                  Updated" date.
                </p>
                <p className="leading-relaxed">
                  Your continued use of the service after changes are posted constitutes your
                  acceptance of the modified Terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Contact Us
                  </h2>
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      <span className="font-medium">Email:</span> vfurnitureshelp@gmail.com
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> +91 123 456 7890
                    </p>
                    <p>
                      <span className="font-medium">Address:</span> V Furnitures, India
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
