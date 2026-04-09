"use client";

import { Truck, MapPin, Clock, Package, CheckCircle, AlertCircle } from "lucide-react";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <Truck className="w-8 h-8 text-gray-900 dark:text-white" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Shipping & Delivery Policy
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
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  At V Furnitures, we strive to deliver your furniture safely and on time.
                  This policy outlines our shipping process, delivery timelines, and what
                  you can expect when ordering from us.
                </p>
              </div>
            </section>

            {/* Shipping Coverage */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Shipping Coverage
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      We currently ship to all major cities and towns across India. Our
                      delivery network covers:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>All metro cities and state capitals</li>
                      <li>Tier 2 and Tier 3 cities</li>
                      <li>Most towns with accessible road connectivity</li>
                    </ul>
                    <p className="leading-relaxed">
                      For remote or hard-to-reach locations, please contact us to confirm
                      delivery availability before placing your order.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Delivery Timeline */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Delivery Timeline
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      Delivery times vary based on your location and product availability:
                    </p>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="font-medium mb-1">Metro Cities:</p>
                        <p className="text-sm">5-7 business days</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Tier 2 Cities:</p>
                        <p className="text-sm">7-10 business days</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Tier 3 Cities & Towns:</p>
                        <p className="text-sm">10-14 business days</p>
                      </div>
                      <div>
                        <p className="font-medium mb-1">Remote Areas:</p>
                        <p className="text-sm">14-21 business days</p>
                      </div>
                    </div>
                    <p className="leading-relaxed">
                      These are estimated delivery times and may vary during peak seasons,
                      festivals, or due to unforeseen circumstances. We will keep you updated
                      on your order status via SMS and email.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Shipping Costs */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Shipping Costs
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-green-900 dark:text-green-300 mb-1">
                      Free Shipping on All Orders
                    </p>
                    <p className="text-sm text-green-800 dark:text-green-400">
                      We offer free delivery across India on all furniture orders, regardless
                      of order value. No minimum purchase required!
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Order Processing */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Package className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Order Processing
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      Once you place an order, here's what happens:
                    </p>
                    <ol className="list-decimal list-inside space-y-3 ml-4">
                      <li>
                        <span className="font-medium">Order Confirmation:</span> You'll receive
                        an email confirmation within minutes of placing your order
                      </li>
                      <li>
                        <span className="font-medium">Processing:</span> Orders are processed
                        within 1-2 business days
                      </li>
                      <li>
                        <span className="font-medium">Quality Check:</span> Each item is
                        carefully inspected before packaging
                      </li>
                      <li>
                        <span className="font-medium">Dispatch:</span> You'll receive a
                        shipping confirmation with tracking details
                      </li>
                      <li>
                        <span className="font-medium">Delivery:</span> Our delivery partner
                        will contact you to schedule delivery
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Tracking Your Order */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Tracking Your Order
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Once your order is shipped, you can track it in real-time:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Check your email for the tracking link</li>
                  <li>Log in to your account and visit "My Orders"</li>
                  <li>Use the tracking number on the courier's website</li>
                  <li>Contact our support team for assistance</li>
                </ul>
              </div>
            </section>

            {/* Delivery Process */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delivery Process
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Our delivery partners will:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Contact you 24-48 hours before delivery to schedule a convenient time</li>
                  <li>Deliver the furniture to your doorstep</li>
                  <li>Help with basic unpacking (packaging material removal)</li>
                  <li>Ensure you inspect the product before signing the delivery receipt</li>
                </ul>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 flex items-start gap-3 mt-4">
                  <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-yellow-900 dark:text-yellow-300 mb-1">
                      Important: Inspect Before Accepting
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      Please inspect your furniture carefully before signing the delivery
                      receipt. Report any damage or defects immediately to our support team.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Assembly Services */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Assembly Services
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Most of our furniture comes ready to use or requires minimal assembly.
                  Detailed assembly instructions are included with products that require
                  assembly.
                </p>
                <p className="leading-relaxed">
                  For complex items, professional assembly services may be available at an
                  additional cost. Please contact us for more information.
                </p>
              </div>
            </section>

            {/* Delivery Delays */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Delivery Delays
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  While we strive for on-time delivery, delays may occur due to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Weather conditions or natural disasters</li>
                  <li>Political unrest or strikes</li>
                  <li>Incorrect or incomplete delivery address</li>
                  <li>Recipient unavailability</li>
                  <li>Peak season demand</li>
                </ul>
                <p className="leading-relaxed">
                  We will notify you immediately if any delays are expected and work to
                  resolve them as quickly as possible.
                </p>
              </div>
            </section>

            {/* Failed Delivery */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Failed Delivery Attempts
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  If delivery cannot be completed due to:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Recipient not available at the delivery address</li>
                  <li>Incorrect or incomplete address provided</li>
                  <li>Refusal to accept delivery</li>
                </ul>
                <p className="leading-relaxed">
                  The delivery partner will make up to 3 attempts. After failed attempts,
                  the order will be returned to our warehouse, and you may be charged for
                  re-delivery or return shipping costs.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Shipping Questions?
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                If you have any questions about shipping or delivery, please contact us:
              </p>
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <p>
                  <span className="font-medium">Email:</span> vfurnitureshelp@gmail.com
                </p>
                <p>
                  <span className="font-medium">Phone:</span> +91 123 456 7890
                </p>
                <p>
                  <span className="font-medium">Hours:</span> Monday - Saturday, 9 AM - 6 PM IST
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
