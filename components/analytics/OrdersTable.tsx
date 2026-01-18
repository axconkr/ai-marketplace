'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Order {
  id: string;
  amount: number;
  seller_amount: number;
  status: string;
  createdAt: Date;
  product: {
    id: string;
    name: string;
  };
  buyer: {
    email: string;
    name?: string | null;
  };
}

interface OrdersTableProps {
  orders: Order[];
  limit?: number;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  PENDING: { label: 'Pending', variant: 'outline' },
  PAID: { label: 'Paid', variant: 'default' },
  COMPLETED: { label: 'Completed', variant: 'secondary' },
  REFUNDED: { label: 'Refunded', variant: 'destructive' },
  CANCELLED: { label: 'Cancelled', variant: 'destructive' },
  FAILED: { label: 'Failed', variant: 'destructive' },
};

export function OrdersTable({ orders, limit }: OrdersTableProps) {
  const displayOrders = limit ? orders.slice(0, limit) : orders;

  if (displayOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No orders yet
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left">Order</th>
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3 text-center">Status</th>
            <th className="px-4 py-3 text-left">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {displayOrders.map((order) => {
            const status = statusConfig[order.status] || statusConfig.PENDING;
            return (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/products/${order.product.id}`}
                    className="text-sm text-gray-900 hover:text-blue-600 truncate max-w-[200px] inline-block"
                  >
                    {order.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">
                      {order.buyer.name || 'Anonymous'}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {order.buyer.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="text-sm">
                    <div className="font-semibold text-gray-900">
                      {formatCurrency(order.seller_amount)}
                    </div>
                    <div className="text-xs text-gray-500">
                      Total: {formatCurrency(order.amount)}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={status.variant}>
                    {status.label}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {format(new Date(order.createdAt), 'MMM dd, yyyy')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
