import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 12, 2026</p>

        <div className="prose prose-lg text-foreground/80 space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">1. Information We Collect</h2>
          <p>When you visit Great Auk Publishing, we may collect certain information automatically, including your IP address, browser type, referring URLs, pages visited, and the date and time of your visit. If you create an account or make a purchase, we collect your name, email address, and payment information as necessary to fulfil your order.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">2. How We Use Your Information</h2>
          <p>We use the information we collect to operate and improve our website, process transactions, communicate with you about your account or orders, personalise your experience, and analyse site usage to enhance our services.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">3. Cookies &amp; Tracking Technologies</h2>
          <p>Our website uses cookies and similar tracking technologies to enhance your browsing experience, remember your preferences, and analyse traffic. These include essential cookies required for site functionality, analytics cookies to understand how visitors interact with our site, and advertising or affiliate cookies used by our partners.</p>
          <p>You can manage cookie preferences through your browser settings. Disabling certain cookies may affect your experience on our site.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">4. Third-Party Services &amp; Affiliate Partnerships</h2>
          <p>Great Auk Publishing participates in affiliate programmes, including the Amazon Services LLC Associates Programme, an affiliate advertising programme designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in and affiliated sites. As an Amazon Associate, Great Auk Publishing earns from qualifying purchases.</p>
          <p>When you click on affiliate links on our site, our affiliate partners may place cookies on your device to track referrals. These third-party cookies are governed by the respective privacy policies of those partners.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">5. Data Sharing</h2>
          <p>We do not sell your personal information. We may share data with trusted service providers who assist in operating our website, conducting our business, or servicing you, provided those parties agree to keep your information confidential. We may also disclose information when required by law.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">6. Data Security</h2>
          <p>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, alteration, disclosure, or destruction.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal data. To exercise these rights, please contact us at greataukpublishing@gmail.com.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">8. Children's Privacy</h2>
          <p>Our services are not directed at individuals under the age of 13. We do not knowingly collect personal information from children.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">10. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us at greataukpublishing@gmail.com or through our <a href="/contact" className="text-accent hover:underline">Contact page</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
