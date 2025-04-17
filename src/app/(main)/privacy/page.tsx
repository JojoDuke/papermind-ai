'use client';

import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import Link from "next/link";

export default function PrivacyPolicyPage() {
  return (
    <MaxWidthWrapper className="py-16 md:py-24">
      <div className="prose prose-lg max-w-none">
        <h1 className="mb-8">Privacy Policy for Papermind AI</h1>
        <p className="mb-10"><strong>Last Updated:</strong> {new Date().toLocaleDateString()}</p>

        <section className="mb-12">
          <p className="mb-6">
            Welcome to Papermind AI (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website usepapermind.com (the &quot;Site&quot;) and our services (collectively, the &quot;Services&quot;).
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">1. Information We Collect</h2>
          <p className="mb-6">
            We may collect personal information that you provide to us directly, information collected automatically when you use our Services, and information from third-party sources.
          </p>
          <ul className="space-y-6 mb-6">
            <li>
              <strong>Personal Information You Provide:</strong>
              <ul className="list-disc pl-8 mt-4 space-y-2">
                <li><strong>Account Information:</strong> When you register for an account, we collect information such as your first name, last name, email address, and password (hashed).</li>
                <li><strong>Payment Information:</strong> If you subscribe to our premium plan, our payment processor, Dodo Payments, collects your payment information. We do not store your full payment card details but receive information about your subscription status linked to your user ID.</li>
                <li><strong>Communications:</strong> If you contact us directly, we may receive additional information about you.</li>
              </ul>
            </li>
            <li>
              <strong>Information Collected Automatically:</strong>
              <ul className="list-disc pl-8 mt-4 space-y-2">
                <li><strong>Log and Usage Data:</strong> We collect information about your interactions with our Services, including IP address, browser type, operating system, referring URLs, pages viewed, links clicked, and timestamps.</li>
                <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar tracking technologies to track activity on our Services and hold certain information. We use cookies for session management (Supabase Auth) and analytics (Google Analytics). You can instruct your browser to refuse all cookies or indicate when a cookie is being sent.</li>
                <li><strong>Device Information:</strong> We may collect information about the device you use to access our Services, including hardware model, operating system and version, and unique device identifiers.</li>
              </ul>
            </li>
            <li>
              <strong>Information from Third-Party Sources:</strong>
              <ul className="list-disc pl-8 mt-4 space-y-2">
                <li><strong>Third-Party Authentication:</strong> If you choose to log in using a third-party service like Google, we may receive information from that service, such as your name, email address, and profile picture, as permitted by your privacy settings on that service.</li>
              </ul>
            </li>
            <li>
              <strong>Uploaded Content:</strong>
              <ul className="list-disc pl-8 mt-4 space-y-2">
                <li><strong>Documents:</strong> We collect the documents (e.g., PDFs) you upload to our Services. These are stored securely and processed to provide you with the core features of Papermind AI.</li>
              </ul>
            </li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect for various purposes, including:</p>
          <ul className="list-disc pl-8 space-y-2 mb-6">
            <li>To provide, operate, and maintain our Services.</li>
            <li>To process your transactions and manage your subscriptions.</li>
            <li>To improve, personalize, and expand our Services.</li>
            <li>To understand and analyze how you use our Services.</li>
            <li>To develop new products, services, features, and functionality.</li>
            <li>To communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the Service, and for marketing and promotional purposes (where permitted by law).</li>
            <li>To detect and prevent fraud and security issues.</li>
            <li>For compliance purposes, including enforcing our Terms of Service, or other legal rights.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">3. How We Share Your Information</h2>
          <p className="mb-4">We do not sell your personal information. We may share the information we collect in the following circumstances:</p>
          <ul className="list-disc pl-8 space-y-2 mb-6">
            <li><strong>Service Providers:</strong> We may share your information with third-party vendors and service providers that perform services on our behalf, such as payment processing (Dodo Payments), cloud hosting and storage (Supabase), document processing (Wetro API), and analytics (Google Analytics). These third parties are obligated to protect your information and use it only for the purposes for which it was disclosed.</li>
            <li><strong>Business Transfers:</strong> Information may be disclosed or transferred as part of, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your information if required to do so by law or in the good faith belief that such action is necessary to comply with a legal obligation, protect and defend our rights or property, prevent or investigate possible wrongdoing in connection with the Services, protect the personal safety of users of the Services or the public, or protect against legal liability.</li>
            <li><strong>With Your Consent:</strong> We may share your information with your consent or at your direction.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">4. Data Security</h2>
          <p className="mb-6">
            We implement reasonable security measures designed to protect your information from unauthorized access, use, or disclosure. However, no internet or email transmission is ever fully secure or error-free. While we strive to use commercially acceptable means to protect your personal information, we cannot guarantee its absolute security.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">5. Data Retention</h2>
          <p className="mb-6">
            We retain your personal information for as long as necessary to provide the Services and fulfill the transactions you have requested, or for other essential purposes such as complying with our legal obligations, resolving disputes, and enforcing our agreements. Uploaded documents are retained while your account is active or until you delete them.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">6. Your Privacy Rights</h2>
          <p className="mb-4">
            Depending on your location, you may have certain rights regarding your personal information, including:
          </p>
          <ul className="list-disc pl-8 space-y-2 mb-4">
            <li>The right to access, update, or delete the information we have on you.</li>
            <li>The right to object to processing or restrict processing of your personal information.</li>
            <li>The right to data portability.</li>
            <li>The right to withdraw consent at any time where we relied on your consent to process your personal information.</li>
          </ul>
          <p className="mb-6">
            You can usually manage your account information through your account settings. To exercise other rights, please contact us using the contact information below.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">7. Third-Party Services</h2>
          <p className="mb-4">
            Our Services may contain links to other websites or services not operated or controlled by us (Third-Party Sites). The information that you share with Third-Party Sites will be governed by the specific privacy policies and terms of service of the Third-Party Sites and not by this Privacy Policy. We encourage you to review the privacy policies of any Third-Party Sites you visit.
          </p>
          <p className="mb-4">We specifically use the following key third-party services:</p>
          <ul className="list-disc pl-8 space-y-2 mb-6">
              <li><strong>Supabase:</strong> For authentication, database storage, and file storage. See <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase Privacy Policy</a>.</li>
              <li><strong>Dodo Payments:</strong> For processing subscription payments. See their privacy policy on their website.</li>
              <li><strong>Wetro API:</strong> For processing uploaded documents to enable chat features. See their privacy policy.</li>
              <li><strong>Google Analytics:</strong> For website usage analytics. See <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google's Privacy Policy</a>.</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">8. Children's Privacy</h2>
          <p className="mb-6">
            Our Services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">9. Changes to This Privacy Policy</h2>
          <p className="mb-6">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date. You are advised to review this Privacy Policy periodically for any changes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="mb-6">10. Contact Us</h2>
          <p className="mb-6">
            If you have any questions about this Privacy Policy, please contact us at: [Your Contact Email Address]
          </p>
        </section>
      </div>
    </MaxWidthWrapper>
  );
} 