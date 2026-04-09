"use client";

import { Store, Users, Award, Heart, Truck, Shield } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f1419] py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About V Furnitures
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your trusted partner for quality furniture that transforms houses into homes
          </p>
        </div>

        {/* Our Story */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Store className="w-8 h-8 text-gray-900 dark:text-white" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Our Story
            </h2>
          </div>
          <div className="space-y-4 text-gray-700 dark:text-gray-300">
            <p className="leading-relaxed">
              V Furnitures was founded with a simple mission: to make quality furniture
              accessible to everyone. We believe that your home should reflect your personality
              and style, without breaking the bank.
            </p>
            <p className="leading-relaxed">
              What started as a small furniture store has grown into a trusted online
              destination for thousands of customers across India. We carefully curate our
              collection to bring you the best combination of style, quality, and affordability.
            </p>
            <p className="leading-relaxed">
              Today, we offer a wide range of furniture for every room in your home - from
              comfortable sofas and elegant dining sets to functional storage solutions and
              stylish bedroom furniture.
            </p>
          </div>
        </div>

        {/* Our Values */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Our Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Award className="w-7 h-7 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Quality First
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  We source only the finest materials and work with skilled craftsmen to
                  ensure every piece meets our high standards.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-7 h-7 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Customer Satisfaction
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your happiness is our priority. We go above and beyond to ensure you love
                  your furniture and have a great shopping experience.
                </p>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-6">
              <div className="flex flex-col items-center text-center">
                <div className="w-14 h-14 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-7 h-7 text-gray-900 dark:text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Transparency
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  No hidden costs, no surprises. What you see is what you get - honest
                  pricing and clear communication every step of the way.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Why Choose V Furnitures?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Truck className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Free Delivery
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Enjoy free delivery on all orders. We handle the logistics so you can
                  focus on enjoying your new furniture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Secure Payments
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Shop with confidence using our secure payment gateway. Your financial
                  information is always protected.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Quality Guarantee
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Every product is carefully inspected before shipping. We stand behind
                  the quality of our furniture.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-gray-900 dark:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white mb-2">
                  Expert Support
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Our friendly customer support team is always ready to help with any
                  questions or concerns.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="bg-gray-900 dark:bg-gray-800 border border-gray-800 dark:border-gray-700 rounded-lg shadow-sm p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Get in Touch
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Have questions or need assistance? We're here to help! Reach out to our team
            and we'll get back to you as soon as possible.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="mailto:vfurnitureshelp@gmail.com"
              className="px-6 py-3 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Email Us
            </a>
            <a
              href="tel:+911234567890"
              className="px-6 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg font-medium hover:bg-gray-700 transition-colors"
            >
              Call Us
            </a>
          </div>
          <div className="mt-6 text-sm text-gray-400">
            <p>Email: vfurnitureshelp@gmail.com</p>
            <p>Phone: +91 123 456 7890</p>
            <p>Hours: Monday - Saturday, 9 AM - 6 PM IST</p>
          </div>
        </div>
      </div>
    </div>
  );
}
