import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Terms &amp; Conditions</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: March 12, 2026</p>

        <div className="prose prose-lg text-foreground/80 space-y-6">
          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">1. Acceptance of Terms</h2>
          <p>By accessing or using the Great Auk Publishing website ("the Site"), you agree to be bound by these Terms and Conditions. If you do not agree, please do not use the Site.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">2. Use of the Site</h2>
          <p>You may use this Site for lawful purposes only. You agree not to use the Site in any way that could damage, disable, or impair the Site, or interfere with any other party's use of the Site.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">3. Intellectual Property</h2>
          <p>All content on this Site, including text, graphics, logos, images, and software, is the property of Great Auk Publishing or its content suppliers and is protected by international copyright laws. Unauthorised reproduction or distribution is prohibited.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">4. Products &amp; Purchases</h2>
          <p>All prices are listed in Indian Rupees (₹). We reserve the right to modify pricing at any time. Digital products (eBooks) are delivered electronically and are non-refundable once accessed. Print orders are subject to our shipping and returns policy.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">5. Affiliate Links &amp; Third-Party Sites</h2>
          <p>Our Site may contain links to third-party websites, including affiliate partner sites such as Amazon.in. These links are provided for your convenience and do not signify endorsement. We are not responsible for the content or practices of linked sites. Purchases made through affiliate links may result in a commission to Great Auk Publishing at no additional cost to you.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">6. User Accounts</h2>
          <p>When you create an account, you are responsible for maintaining the confidentiality of your credentials and for all activities under your account. You agree to notify us immediately of any unauthorised use.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">7. User-Generated Content</h2>
          <p>By submitting reviews, comments, or other content, you grant Great Auk Publishing a non-exclusive, royalty-free licence to use, reproduce, and display such content in connection with our services. You agree not to submit content that is unlawful, defamatory, or infringing.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">8. Limitation of Liability</h2>
          <p>Great Auk Publishing shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of or inability to use the Site or its services.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">9. Governing Law</h2>
          <p>These terms shall be governed by and construed in accordance with the laws of the United Kingdom, without regard to conflict of law principles.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">10. Changes to Terms</h2>
          <p>We reserve the right to update these Terms at any time. Continued use of the Site constitutes acceptance of any changes.</p>

          <h2 className="font-display text-xl font-semibold text-foreground !mt-8">11. Contact</h2>
          <p>For questions regarding these Terms, please contact us at legal@greataukpublishing.com or visit our <a href="/contact" className="text-accent hover:underline">Contact page</a>.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}
