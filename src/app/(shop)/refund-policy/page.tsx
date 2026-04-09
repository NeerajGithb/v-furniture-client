"use client";

import { RotateCcw, Package, Clock, CheckCircle, AlertCircle } from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
          {/* Header */}
          <div className="border-b border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-2">
              <RotateCcw className="w-8 h-8 text-gray-900 dark:text-white" />
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Refund & Return Policy
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
                  At V Furnitures, we want you to be completely satisfied with your purchase.
                  If you're not happy with your order, we're here to help with returns and
                  refunds according to the policy outlined below.
                </p>
              </div>
            </section>

            {/* Return Window */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Return Window
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      You have 7 days from the date of delivery to initiate a return. To be
                      eligible for a return, your item must be:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Unused and in the same condition that you received it</li>
                      <li>In the original packaging with all tags and labels attached</li>
                      <li>Accompanied by the original invoice or proof of purchase</li>
                      <li>Free from any damage, stains, or alterations</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Eligible Items */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Eligible for Return
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Defective or damaged products upon delivery</li>
                      <li>Wrong item delivered (different from what you ordered)</li>
                      <li>Products with manufacturing defects</li>
                      <li>Items that don't match the product description</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Non-Returnable Items */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    Non-Returnable Items
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      The following items cannot be returned:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Custom-made or personalized furniture</li>
                      <li>Items marked as "Final Sale" or "Non-Returnable"</li>
                      <li>Products damaged due to misuse or improper assembly</li>
                      <li>Items without original packaging or tags</li>
                      <li>Products purchased during clearance sales (unless defective)</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Return Process */}
            <section>
              <div className="flex items-start gap-3 mb-4">
                <Package className="w-5 h-5 text-gray-700 dark:text-gray-300 mt-1" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                    How to Return
                  </h2>
                  <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                    <p className="leading-relaxed">
                      To initiate a return, please follow these steps:
                    </p>
                    <ol className="list-decimal list-inside space-y-3 ml-4">
                      <li>
                        <span className="font-medium">Contact Us:</span> Email us at
                        vfurnitureshelp@gmail.com or call +91 123 456 7890 within 7 days
                        of delivery
                      </li>
                      <li>
                        <span className="font-medium">Provide Details:</span> Include your
                        order number, reason for return, and photos if the item is damaged
                      </li>
                      <li>
                        <span className="font-medium">Get Approval:</span> Wait for our team
                        to review and approve your return request
                      </li>
                      <li>
                        <span className="font-medium">Schedule Pickup:</span> Once approved,
                        we'll arrange a pickup from your address at no extra cost
                      </li>
                      <li>
                        <span className="font-medium">Pack Securely:</span> Ensure the item
                        is packed in its original packaging with all accessories
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </section>

            {/* Refund Process */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Refund Process
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Once we receive and inspect your returned item, we will notify you of the
                  approval or rejection of your refund.
                </p>
                <p className="leading-relaxed">
                  If approved, your refund will be processed within 7-10 business days to
                  your original payment method. The time it takes for the refund to appear
                  in your account depends on your bank or payment provider.
                </p>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <p className="font-medium mb-2">Refund Timeline:</p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Credit/Debit Card: 5-7 business days</li>
                    <li>UPI: 2-3 business days</li>
                    <li>Net Banking: 5-7 business days</li>
                    <li>Wallet: 2-3 business days</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Exchanges */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Exchanges
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  We currently do not offer direct exchanges. If you need a different item,
                  please return the original product for a refund and place a new order for
                  the item you want.
                </p>
                <p className="leading-relaxed">
                  For defective or damaged items, we will replace them at no additional cost
                  if the same product is available in stock.
                </p>
              </div>
            </section>

            {/* Damaged or Defective Items */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Damaged or Defective Items
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  If you receive a damaged or defective item:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Contact us immediately with photos of the damage</li>
                  <li>Do not discard the packaging or the item</li>
                  <li>We will arrange for a replacement or full refund</li>
                  <li>Pickup will be scheduled at no cost to you</li>
                </ul>
                <p className="leading-relaxed">
                  Please inspect your items upon delivery and report any damage within 48
                  hours to ensure a smooth resolution.
                </p>
              </div>
            </section>

            {/* Cancellations */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Order Cancellations
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  You can cancel your order before it is shipped at no charge. Once the order
                  has been shipped, cancellation is not possible, but you can return the item
                  after delivery according to our return policy.
                </p>
                <p className="leading-relaxed">
                  To cancel an order, contact us immediately at vfurnitureshelp@gmail.com or
                  call +91 123 456 7890 with your order number.
                </p>
              </div>
            </section>

            {/* Shipping Costs */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Return Shipping Costs
              </h2>
              <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                <p className="leading-relaxed">
                  Return shipping is free for:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Defective or damaged products</li>
                  <li>Wrong items delivered</li>
                  <li>Products with manufacturing defects</li>
                </ul>
                <p className="leading-relaxed mt-3">
                  For returns due to change of mind or other non-defect reasons, return
                  shipping costs may apply and will be deducted from your refund amount.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Questions About Returns?
              </h2>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                If you have any questions about our return and refund policy, please contact us:
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
