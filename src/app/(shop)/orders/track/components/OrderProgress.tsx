import { Clock, RefreshCw } from "lucide-react";
import type { OrderStatus } from "@/types/order";
import { CheckCircle } from "lucide-react";

interface StatusStep {
  key: OrderStatus;
  label: string;
  icon: typeof CheckCircle;
  completed: boolean;
  active: boolean;
  description: string;
  estimatedDate?: string;
}

interface OrderProgressProps {
  statusSteps: StatusStep[];
  isOrderActive: boolean;
  isOverdue?: boolean;
}

export function OrderProgress({
  statusSteps,
  isOrderActive,
  isOverdue = false,
}: OrderProgressProps) {
  if (!isOrderActive) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm dark:shadow-gray-900">
      <div className="bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700 rounded-t-lg">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Order Progress
        </h3>
      </div>
      <div className="p-4">
        <div className="relative">
          {statusSteps.map((step, index) => (
            <div
              key={step.key}
              className="flex items-start gap-3 relative pb-6 last:pb-0"
            >
              {/* Connecting Line */}
              {index < statusSteps.length - 1 && (
                <div
                  className={`absolute left-4 top-8 w-0.5 h-full ${
                    step.completed
                      ? "bg-gray-900 dark:bg-gray-300"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}

              {/* Step Icon */}
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all duration-300 shadow-sm ${
                  step.completed
                    ? "bg-gray-900 dark:bg-gray-300 text-white dark:text-gray-900"
                    : step.active
                      ? "bg-gray-700 dark:bg-gray-500 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 border-2 border-gray-300 dark:border-gray-600"
                }`}
              >
                <step.icon className="w-4 h-4" />
              </div>

              {/* Step Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={`font-semibold text-sm ${
                      step.completed || step.active
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {step.label}
                  </h4>
                  {step.active && (
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        isOverdue
                          ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {isOverdue ? "Delayed" : "In Progress"}
                    </span>
                  )}
                  {step.completed && !step.active && (
                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                      Completed
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs ${
                    step.completed || step.active
                      ? "text-gray-600 dark:text-gray-400"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.description}
                </p>
                {step.active && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded inline-flex">
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    <span className="font-medium">Processing...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
