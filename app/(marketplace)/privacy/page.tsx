import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - AI Marketplace',
  description: 'How we collect, use, and protect your data',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto prose prose-lg">
        <h1>Privacy Policy</h1>
        <p className="text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

        <h2>1. Introduction</h2>
        <p>
          AI Marketplace ("we", "our", or "us") is committed to protecting your privacy. This
          Privacy Policy explains how we collect, use, disclose, and safeguard your information.
        </p>

        <h2>2. Information We Collect</h2>
        <h3>2.1 Personal Information</h3>
        <ul>
          <li>Name and email address</li>
          <li>Payment information (processed securely by our payment processor)</li>
          <li>Profile information</li>
          <li>Bank account details (for sellers receiving payments)</li>
        </ul>

        <h3>2.2 Automatically Collected Information</h3>
        <ul>
          <li>IP address and browser type</li>
          <li>Device information</li>
          <li>Usage data and analytics</li>
          <li>Cookies and similar technologies</li>
        </ul>

        <h2>3. How We Use Your Information</h2>
        <h3>3.1 Service Delivery</h3>
        <ul>
          <li>Process transactions and payments</li>
          <li>Provide customer support</li>
          <li>Send transactional emails</li>
          <li>Manage user accounts</li>
        </ul>

        <h3>3.2 Platform Improvement</h3>
        <ul>
          <li>Analyze usage patterns</li>
          <li>Improve platform features</li>
          <li>Detect and prevent fraud</li>
          <li>Ensure platform security</li>
        </ul>

        <h3>3.3 Communication</h3>
        <ul>
          <li>Send important updates</li>
          <li>Respond to inquiries</li>
          <li>Send marketing communications (with your consent)</li>
        </ul>

        <h2>4. Information Sharing</h2>
        <h3>4.1 We Share Information With:</h3>
        <ul>
          <li><strong>Payment Processors</strong>: To process transactions securely</li>
          <li><strong>Service Providers</strong>: For platform hosting and analytics</li>
          <li><strong>Legal Authorities</strong>: When required by law</li>
        </ul>

        <h3>4.2 We Do NOT:</h3>
        <ul>
          <li>Sell your personal information to third parties</li>
          <li>Share your data for advertising purposes without consent</li>
          <li>Disclose sensitive financial information</li>
        </ul>

        <h2>5. Data Security</h2>
        <p>
          We implement industry-standard security measures to protect your data:
        </p>
        <ul>
          <li>Encryption in transit (HTTPS/TLS)</li>
          <li>Encrypted password storage (bcrypt)</li>
          <li>Secure payment processing (PCI-DSS compliant)</li>
          <li>Regular security audits</li>
          <li>Access controls and authentication</li>
        </ul>

        <h2>6. Your Rights</h2>
        <h3>6.1 Access and Control</h3>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Request data deletion</li>
          <li>Export your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>

        <h3>6.2 Data Retention</h3>
        <p>
          We retain your data for as long as your account is active or as needed to provide
          services. Financial records are retained for 7 years per legal requirements.
        </p>

        <h2>7. Cookies</h2>
        <h3>7.1 Types of Cookies We Use:</h3>
        <ul>
          <li><strong>Essential</strong>: Required for platform functionality</li>
          <li><strong>Analytics</strong>: Help us understand usage patterns</li>
          <li><strong>Preferences</strong>: Remember your settings</li>
        </ul>

        <h3>7.2 Managing Cookies</h3>
        <p>
          You can control cookies through your browser settings. Note that disabling essential
          cookies may affect platform functionality.
        </p>

        <h2>8. Third-Party Services</h2>
        <p>
          Our platform uses third-party services:
        </p>
        <ul>
          <li><strong>Payment Processing</strong>: Stripe (see Stripe Privacy Policy)</li>
          <li><strong>Analytics</strong>: Usage tracking and performance monitoring</li>
          <li><strong>Email Service</strong>: Transactional email delivery</li>
        </ul>

        <h2>9. Children's Privacy</h2>
        <p>
          Our platform is not intended for users under 18 years old. We do not knowingly collect
          information from children.
        </p>

        <h2>10. International Data Transfers</h2>
        <p>
          Your data may be transferred to and processed in countries other than your own. We
          ensure appropriate safeguards are in place.
        </p>

        <h2>11. Changes to Privacy Policy</h2>
        <p>
          We may update this policy periodically. We'll notify you of significant changes via
          email or platform notification.
        </p>

        <h2>12. Contact Us</h2>
        <p>
          For privacy-related questions or to exercise your rights, contact us at:
        </p>
        <ul>
          <li>Email: <a href="mailto:privacy@aimarketplace.com">privacy@aimarketplace.com</a></li>
          <li>Data Protection Officer: <a href="mailto:dpo@aimarketplace.com">dpo@aimarketplace.com</a></li>
        </ul>

        <h2>13. GDPR Compliance (EU Users)</h2>
        <p>
          If you're in the EU, you have additional rights under GDPR:
        </p>
        <ul>
          <li>Right to be forgotten</li>
          <li>Right to data portability</li>
          <li>Right to object to processing</li>
          <li>Right to lodge a complaint with supervisory authority</li>
        </ul>
      </div>
    </div>
  )
}
