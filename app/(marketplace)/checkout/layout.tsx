import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Checkout - AI Marketplace',
  description: 'Complete your purchase securely on AI Marketplace',
  robots: 'noindex, nofollow', // Don't index checkout pages
};

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
