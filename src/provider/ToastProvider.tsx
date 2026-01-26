'use client';

import { Toaster, toast, Toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { MouseEvent } from 'react';

interface CustomToastProps {
  t: Toast;
  message: string;
}

const CustomToast = ({ t, message }: CustomToastProps) => {
  const getBackgroundColor = () => {
    switch (t.type) {
      case 'success':
        return '#000000';
      case 'error':
        return '#000000';
      case 'loading':
        return '#000000';
      default:
        return '#000000';
    }
  };

  const getIcon = () => {
    switch (t.type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'loading':
        return '⏳';
      default:
        return null;
    }
  };

  const getIconColor = () => {
    switch (t.type) {
      case 'success':
        return '#22c55e';
      case 'error':
        return '#ef4444';
      case 'loading':
        return '#3b82f6';
      default:
        return '#ffffff';
    }
  };

  return (
    <div
      className={`custom-toast ${t.visible ? 'animate-enter' : 'animate-exit'}`}
      style={{
        background: getBackgroundColor(),
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#fff',
        boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        minWidth: '280px',
        maxWidth: '400px',
        lineHeight: '1.5',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {getIcon() && (
        <span 
          style={{ 
            fontSize: '18px',
            fontWeight: 'bold',
            color: getIconColor(),
            flexShrink: 0,
          }}
        >
          {getIcon()}
        </span>
      )}
      <span
        style={{
          flex: 1,
          wordBreak: 'break-word',
          whiteSpace: 'normal',
        }}
      >
        {message}
      </span>
      <button
        onClick={() => toast.dismiss(t.id)}
        style={{
          all: 'unset',
          color: 'rgba(255, 255, 255, 0.5)',
          cursor: 'pointer',
          padding: '4px',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          flexShrink: 0,
        }}
        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
          (e.target as HTMLButtonElement).style.background = 'rgba(255, 255, 255, 0.1)';
          (e.target as HTMLButtonElement).style.color = '#fff';
        }}
        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
          (e.target as HTMLButtonElement).style.background = 'transparent';
          (e.target as HTMLButtonElement).style.color = 'rgba(255, 255, 255, 0.5)';
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
};

const ToastProvider = () => {
  return (
    <>
      <Toaster
        position="bottom-center"
        toastOptions={{
          duration: 3000,
        }}
        containerStyle={{
          bottom: 32,
        }}
      >
        {(t) => <CustomToast t={t} message={t.message as string} />}
      </Toaster>

      <style jsx global>{`
        [data-rht-toaster] {
          z-index: 999999 !important;
        }

        @keyframes toast-slide-in {
          0% {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
          100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
        }

        @keyframes toast-slide-out {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(100%) scale(0.95);
            opacity: 0;
          }
        }

        .animate-enter {
          animation: toast-slide-in 0.3s cubic-bezier(0.21, 1.02, 0.73, 1) forwards;
        }

        .animate-exit {
          animation: toast-slide-out 0.2s ease-in forwards;
        }

        .custom-toast:hover {
          transform: translateY(-2px);
          transition: transform 0.2s ease;
        }
      `}</style>
    </>
  );
};

export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  loading: (message: string) => toast.loading(message),
  default: (message: string) => toast(message),
};

export default ToastProvider;