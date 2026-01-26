import React from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

interface MessageBannerProps {
  type: 'success' | 'error' | 'info';
  message: string;
  onClose: () => void;
}

const MessageBanner: React.FC<MessageBannerProps> = ({ type, message, onClose }) => {
  const styles = {
    success: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-800 dark:text-green-300',
      icon: 'text-green-600 dark:text-green-400',
      closeHover: 'hover:text-green-800 dark:hover:text-green-300',
      Icon: CheckCircle,
    },
    error: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-300',
      icon: 'text-red-600 dark:text-red-400',
      closeHover: 'hover:text-red-800 dark:hover:text-red-300',
      Icon: AlertCircle,
    },
    info: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-300',
      icon: 'text-blue-600 dark:text-blue-400',
      closeHover: 'hover:text-blue-800 dark:hover:text-blue-300',
      Icon: CheckCircle,
    },
  };

  const style = styles[type];
  const IconComponent = style.Icon;

  return (
    <div className={`${style.bg} border ${style.border} rounded-sm p-3 flex items-center gap-2`}>
      <IconComponent className={`w-4 h-4 ${style.icon} shrink-0`} />
      <span className={`text-sm ${style.text}`}>{message}</span>
      <button
        onClick={onClose}
        className={`ml-auto ${style.icon} ${style.closeHover}`}
        aria-label="Close message"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MessageBanner;