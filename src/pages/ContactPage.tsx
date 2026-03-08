import { useState } from "react";
import { Mail, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const subject = encodeURIComponent(`Contact from ${firstName} ${lastName}`);
    const body = encodeURIComponent(`From: ${firstName} ${lastName}\nEmail: ${email}\n\n${message}`);
    window.location.href = `mailto:greataukpublishing@gmail.com?subject=${subject}&body=${body}`;
  };

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
                  <input value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
                <div>
                  <label className="text-sm font-medium text-card-foreground block mb-1">Last Name</label>
                  <input value={lastName} onChange={e => setLastName(e.target.value)} className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium text-card-foreground block mb-1">Message</label>
                <textarea value={message} onChange={e => setMessage(e.target.value)} className="w-full p-3 rounded-lg border border-input bg-background text-foreground text-sm resize-none h-32" />
              </div>
              <Button variant="hero" className="w-full" onClick={handleSend}>Send Message</Button>
            </div>
          </div>
          <div className="space-y-6">
            {[
              { icon: Mail, label: "Email", value: "greataukpublishing@gmail.com" },
              { icon: MapPin, label: "Address", value: "Pillion Intelligence Ltd\nOffice 130, Unit 5\n399-405 Oxford Street\nMayfair, London, UK" },
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
