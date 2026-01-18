import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Order Confirmation - AI Marketplace',
  description: 'Your order has been confirmed. Download your products and access your license keys.',
  robots: 'noindex, nofollow', // Don't index order confirmation pages
};

export default function SuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
