'use client';

import { Notification, NotificationType } from '@prisma/client';
import {
  ShoppingCart,
  CheckCircle,
  DollarSign,
  XCircle,
  FileCheck,
  FileX,
  ClipboardCheck,
  ClipboardList,
  Star,
  MessageCircle,
  Megaphone,
  Banknote,
  FileText,
  Send,
  Lock,
  Unlock,
  CreditCard,
  RefreshCw,
} from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';

interface NotificationItemProps {
  notification: Notification;
  onClick: () => void;
}

function getNotificationIcon(type: NotificationType) {
  const iconMap: Record<NotificationType, React.ReactNode> = {
    ORDER_PLACED: <ShoppingCart className="h-5 w-5" />,
    ORDER_COMPLETED: <CheckCircle className="h-5 w-5" />,
    PAYMENT_RECEIVED: <DollarSign className="h-5 w-5" />,
    PAYMENT_FAILED: <XCircle className="h-5 w-5" />,
    REFUND_APPROVED: <CheckCircle className="h-5 w-5" />,
    REFUND_REJECTED: <XCircle className="h-5 w-5" />,
    PRODUCT_APPROVED: <FileCheck className="h-5 w-5" />,
    PRODUCT_REJECTED: <FileX className="h-5 w-5" />,
    VERIFICATION_REQUESTED: <ClipboardList className="h-5 w-5" />,
    VERIFICATION_COMPLETED: <ClipboardCheck className="h-5 w-5" />,
    VERIFICATION_ASSIGNED: <ClipboardCheck className="h-5 w-5" />,
    SETTLEMENT_READY: <Banknote className="h-5 w-5" />,
    SETTLEMENT_PAID: <CheckCircle className="h-5 w-5" />,
    REVIEW_RECEIVED: <Star className="h-5 w-5" />,
    MESSAGE_RECEIVED: <MessageCircle className="h-5 w-5" />,
    SYSTEM_ANNOUNCEMENT: <Megaphone className="h-5 w-5" />,
    REQUEST_CREATED: <FileText className="h-5 w-5" />,
    PROPOSAL_SUBMITTED: <Send className="h-5 w-5" />,
    PROPOSAL_SELECTED: <CheckCircle className="h-5 w-5" />,
    PROPOSAL_REJECTED: <XCircle className="h-5 w-5" />,
    ESCROW_INITIATED: <Lock className="h-5 w-5" />,
    ESCROW_RELEASED: <Unlock className="h-5 w-5" />,
    SUBSCRIPTION_CREATED: <CreditCard className="h-5 w-5" />,
    SUBSCRIPTION_UPDATED: <RefreshCw className="h-5 w-5" />,
    SUBSCRIPTION_CANCELLED: <XCircle className="h-5 w-5" />,
    SUBSCRIPTION_PAYMENT_FAILED: <XCircle className="h-5 w-5" />,
  };

  return iconMap[type] || <MessageCircle className="h-5 w-5" />;
}

function getNotificationColor(type: NotificationType): string {
  const colorMap: Record<NotificationType, string> = {
    ORDER_PLACED: 'text-blue-500',
    ORDER_COMPLETED: 'text-green-500',
    PAYMENT_RECEIVED: 'text-green-500',
    PAYMENT_FAILED: 'text-red-500',
    REFUND_APPROVED: 'text-green-500',
    REFUND_REJECTED: 'text-red-500',
    PRODUCT_APPROVED: 'text-green-500',
    PRODUCT_REJECTED: 'text-red-500',
    VERIFICATION_REQUESTED: 'text-blue-500',
    VERIFICATION_COMPLETED: 'text-green-500',
    VERIFICATION_ASSIGNED: 'text-blue-500',
    SETTLEMENT_READY: 'text-green-500',
    SETTLEMENT_PAID: 'text-green-500',
    REVIEW_RECEIVED: 'text-yellow-500',
    MESSAGE_RECEIVED: 'text-blue-500',
    SYSTEM_ANNOUNCEMENT: 'text-purple-500',
    REQUEST_CREATED: 'text-blue-500',
    PROPOSAL_SUBMITTED: 'text-blue-500',
    PROPOSAL_SELECTED: 'text-green-500',
    PROPOSAL_REJECTED: 'text-red-500',
    ESCROW_INITIATED: 'text-blue-500',
    ESCROW_RELEASED: 'text-green-500',
    SUBSCRIPTION_CREATED: 'text-blue-500',
    SUBSCRIPTION_UPDATED: 'text-blue-500',
    SUBSCRIPTION_CANCELLED: 'text-red-500',
    SUBSCRIPTION_PAYMENT_FAILED: 'text-red-500',
  };

  return colorMap[type] || 'text-gray-500';
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const icon = getNotificationIcon(notification.type);
  const color = getNotificationColor(notification.type);

  return (
    <button
      onClick={onClick}
      className={`w-full border-b p-4 text-left transition-colors hover:bg-gray-50 ${
        !notification.read ? 'bg-blue-50/50' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className={`flex-shrink-0 ${color}`}>{icon}</div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm text-gray-900">{notification.title}</p>
          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.message}</p>
          <p className="mt-1 text-xs text-gray-500">
            {formatRelativeTime(notification.created_at)}
          </p>
        </div>

        {/* Unread indicator */}
        {!notification.read && (
          <div className="flex-shrink-0">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
          </div>
        )}
      </div>
    </button>
  );
}
