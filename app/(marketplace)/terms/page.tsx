import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms of Service - AI Marketplace',
  description: 'Terms and conditions for using AI Marketplace',
}

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Terms of Service</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing and using AI Marketplace, you accept and agree to be bound by the terms
          and provision of this agreement.
        </p>

        <h2>2. User Accounts</h2>
        <h3>2.1 Account Creation</h3>
        <p>
          You must create an account to use certain features of the platform. You are responsible
          for maintaining the confidentiality of your account credentials.
        </p>
        <h3>2.2 Account Types</h3>
        <ul>
          <li><strong>Buyer</strong>: Can purchase and download products</li>
          <li><strong>Seller</strong>: Can list and sell products (15% platform fee)</li>
          <li><strong>Verifier</strong>: Can verify products (earn 70% of verification fees)</li>
          <li><strong>Admin</strong>: Platform administrators</li>
        </ul>

        <h2>3. Seller Terms</h2>
        <h3>3.1 Platform Fees</h3>
        <p>
          Sellers agree to pay a 15% platform fee on all sales. Verified sellers (Level 2+) pay
          a reduced 12% fee.
        </p>
        <h3>3.2 Product Listings</h3>
        <p>
          Sellers must ensure their products are original, functional, and accurately described.
          Misrepresentation may result in account suspension.
        </p>

        <h2>4. Buyer Terms</h2>
        <h3>4.1 Purchases</h3>
        <p>
          All purchases are final unless the product has technical issues or doesn't match its
          description.
        </p>
        <h3>4.2 Refunds</h3>
        <p>
          Refund requests must be submitted within 14 days of purchase with valid reasons.
        </p>

        <h2>5. Verification System</h2>
        <h3>5.1 Verification Levels</h3>
        <ul>
          <li><strong>Level 0</strong>: Automated verification (Free)</li>
          <li><strong>Level 1</strong>: Basic manual review ($10)</li>
          <li><strong>Level 2</strong>: Standard verification ($50)</li>
          <li><strong>Level 3</strong>: Comprehensive audit ($200)</li>
        </ul>
        <h3>5.2 Verifier Obligations</h3>
        <p>
          Verifiers must provide honest, thorough reviews and maintain professional standards.
        </p>

        <h2>6. Payment Terms</h2>
        <h3>6.1 Settlements</h3>
        <p>
          Seller earnings are settled monthly. Payments are processed within 5 business days
          after the settlement period ends.
        </p>
        <h3>6.2 Payment Methods</h3>
        <p>
          We support various payment methods through secure payment processors.
        </p>

        <h2>7. Intellectual Property</h2>
        <p>
          Sellers retain ownership of their products but grant AI Marketplace a license to
          display and distribute them through the platform.
        </p>

        <h2>8. Prohibited Activities</h2>
        <ul>
          <li>Uploading malicious or harmful content</li>
          <li>Fraudulent transactions or chargebacks</li>
          <li>Impersonating other users</li>
          <li>Violating intellectual property rights</li>
          <li>Manipulating reviews or ratings</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>
          AI Marketplace is not liable for any damages arising from the use of products purchased
          on the platform. Sellers are responsible for their products.
        </p>

        <h2>10. Termination</h2>
        <p>
          We reserve the right to suspend or terminate accounts that violate these terms or
          engage in fraudulent activities.
        </p>

        <h2>11. Changes to Terms</h2>
        <p>
          We may update these terms at any time. Continued use of the platform constitutes
          acceptance of updated terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          For questions about these terms, contact us at:{' '}
          <a href="mailto:legal@aimarketplace.com">legal@aimarketplace.com</a>
        </p>
      </div>
    </div>
  )
}
