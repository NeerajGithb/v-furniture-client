import { Shield } from 'lucide-react';
import { Card } from '../ui/Card';
import { OrderStatus } from '@/types/order';

interface QuickActionsCardProps {
    orderNumber: string;
    status: OrderStatus;
    navigate: any;
}

export function QuickActionsCard({ orderNumber, status, navigate }: QuickActionsCardProps) {
    const handleDownloadInvoice = () => {
        window.open(`/api/orders/number/${orderNumber}/invoice`, "_blank");
    };

    return (
        <Card title="Quick Actions" icon={<Shield size={18} className="text-green-600 dark:text-green-400" />}>
            <div className="space-y-3">
                <button
                    onClick={handleDownloadInvoice}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xs transition-colors duration-200 text-left"
                >
                    <span className="text-lg">📄</span>
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">Download Invoice</p>
                        <p className="text-gray-600 dark:text-gray-400 text-xs">Get your order invoice and receipt</p>
                    </div>
                </button>
                {status === 'delivered' && (
                    <button
                        onClick={() => navigate.push(`/orders/${orderNumber}/return`)}
                        className="w-full flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-xs transition-colors duration-200 text-left"
                    >
                        <span className="text-lg">🔄</span>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white text-sm">Return or Exchange Items</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs">Easy returns within 30 days of delivery</p>
                        </div>
                    </button>
                )}
            </div>
        </Card>
    );
}