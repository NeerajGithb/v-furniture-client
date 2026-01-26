export const Card = ({
    title,
    icon,
    children,
    className = '',
}: {
    title: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xs shadow-sm dark:shadow-gray-900 overflow-hidden ${className}`}
    >
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            {icon}
            <span className="text-gray-800 dark:text-white font-semibold text-sm">{title}</span>
        </div>
        <div className="p-4 text-sm space-y-3">{children}</div>
    </div>
);