import { Mail, MapPin, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-display text-4xl font-bold text-foreground">Contact Us</h1>
          <p className="text-muted-foreground mt-3">Have questions? We'd love to hear from you.</p>
        </div>
        <div className="grid md:grid-cols-[1fr_300px] gap-12">
          <div className="bg-card rounded-lg border border-border p-8">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">First Name</label>
                  <input className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Last Name</label>
                  <input className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Email</label>
                <input type="email" className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Message</label>
                <textarea className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none h-32" />
              </div>
              <Button variant="hero" className="w-full">Send Message</Button>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "hello@greataukbooks.com" },
              { icon: Phone, label: "Phone", value: "+1 (555) 123-4567" },
              { icon: MapPin, label: "Address", value: "123 Publishing Lane\nNew York, NY 10001" },
            ].map((item) => (
              <div key={item.label} className="flex gap-3">
                <item.icon className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
