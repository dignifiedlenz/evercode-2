"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface FAQ {
  question: string;
  answer: string;
}

export default function SupportPage() {
  const pathname = usePathname();
  const [semesterId, setSemesterId] = useState<string>("");

  // Extract semesterId from URL path
  useEffect(() => {
    const pathSegments = pathname.split('/');
    setSemesterId(pathSegments[2] || "");
  }, [pathname]);

  const [activeTab, setActiveTab] = useState<'faqs' | 'contact'>('faqs');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const faqs: FAQ[] = [
    {
      question: "How do I track my progress in the course?",
      answer: "Your progress is automatically tracked as you complete units and lessons. You can view your progress on the main dashboard, which shows completed units and achievement badges."
    },
    {
      question: "Can I download course materials for offline viewing?",
      answer: "Yes, most course materials are available for download. Look for the download icon next to videos and resources. Note that quizzes and interactive elements require an internet connection."
    },
    {
      question: "How do I reset my password?",
      answer: "To reset your password, click on the 'Forgot Password' link on the login page. You'll receive an email with instructions to create a new password. If you don't receive the email, check your spam folder or contact support."
    },
    {
      question: "Can I get a certificate after completing the course?",
      answer: "Yes, upon successful completion of all course units and passing the final assessment, you'll receive a certificate of completion that you can download and share on your professional profiles."
    },
    {
      question: "How long do I have access to the course materials?",
      answer: "You have lifetime access to all course materials after enrollment. This includes any future updates or additional resources added to the course."
    },
    {
      question: "What if I'm having technical difficulties with videos or quizzes?",
      answer: "If you're experiencing technical issues, try refreshing the page or clearing your browser cache. Make sure you're using a supported browser (Chrome, Firefox, Safari, or Edge). If problems persist, contact our support team through the Contact form."
    }
  ];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      // Reset the submitted state after 5 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  return (
    <div className="p-4 md:p-8 backdrop-blur-sm bg-black/30 rounded-lg max-w-6xl mx-auto mt-16">
      <h1 className="text-4xl font-morion text-white mb-8">Support Center</h1>
      
      {/* Tabs */}
      <div className="flex border-b border-white/20 mb-8">
        <button
          onClick={() => setActiveTab('faqs')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'faqs' 
              ? 'text-secondary border-b-2 border-secondary' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          Frequently Asked Questions
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'contact' 
              ? 'text-secondary border-b-2 border-secondary' 
              : 'text-white/70 hover:text-white'
          }`}
        >
          Contact Support
        </button>
      </div>
      
      {/* FAQs Tab */}
      {activeTab === 'faqs' && (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-white/10 rounded-lg overflow-hidden"
            >
              <div 
                className="flex justify-between items-center p-4 cursor-pointer bg-white/5 hover:bg-white/10"
                onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
              >
                <h3 className="text-white font-medium">{faq.question}</h3>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-5 w-5 text-white/70 transition-transform ${expandedFAQ === index ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              
              {expandedFAQ === index && (
                <div className="p-4 bg-white/5 border-t border-white/10">
                  <p className="text-white/80">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
          
          <div className="mt-8 bg-secondary/10 border border-secondary/30 rounded-lg p-4">
            <h3 className="text-secondary font-medium mb-2">Still have questions?</h3>
            <p className="text-white/80 mb-4">Can't find the answer you're looking for? Please contact our support team.</p>
            <button 
              onClick={() => setActiveTab('contact')}
              className="bg-secondary/80 hover:bg-secondary text-white px-4 py-2 rounded-md"
            >
              Contact Support
            </button>
          </div>
        </div>
      )}
      
      {/* Contact Tab */}
      {activeTab === 'contact' && (
        <div>
          {submitted ? (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-6 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h2 className="text-2xl text-white font-medium mb-2">Message Sent!</h2>
              <p className="text-white/80">Thank you for contacting support. We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-white mb-2">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={contactForm.name}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-secondary/50"
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-white mb-2">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleInputChange}
                    required
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-secondary/50"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-white mb-2">Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={contactForm.subject}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-secondary/50"
                >
                  <option value="" disabled>Select a topic</option>
                  <option value="technical">Technical Issue</option>
                  <option value="account">Account Issue</option>
                  <option value="billing">Billing Question</option>
                  <option value="content">Course Content Query</option>
                  <option value="feedback">Feedback</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-white mb-2">Your Message</label>
                <textarea
                  id="message"
                  name="message"
                  value={contactForm.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full bg-white/10 border border-white/20 rounded-lg p-3 text-white placeholder-white/40 focus:outline-none focus:border-secondary/50"
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-6 py-3 rounded-lg text-white ${
                    isSubmitting 
                      ? 'bg-secondary/50 cursor-not-allowed' 
                      : 'bg-secondary/80 hover:bg-secondary'
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>
              </div>
            </form>
          )}
          
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Email Support</h3>
              <p className="text-white/70">support@evermode.com</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Live Chat</h3>
              <p className="text-white/70">Available Mon-Fri, 9AM-5PM EST</p>
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-2">Phone Support</h3>
              <p className="text-white/70">+1 (888) 123-4567</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 