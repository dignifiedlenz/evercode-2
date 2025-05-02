'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-radial from-zinc-900 via-black to-black text-white flex flex-col items-center justify-center font-sans p-4">
      <div className="absolute top-6 left-6">
        <Link href="/" className="flex items-center text-white/70 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
      
      <div className="max-w-2xl w-full bg-black/50 backdrop-blur-md p-8 rounded-lg border border-zinc-800 shadow-lg text-center">
        <h1 className="text-4xl font-morion font-bold mb-6 text-secondary">Support</h1>
        
        <p className="text-lg mb-4 text-white/90">
          Need help with Evermode?
        </p>
        
        <p className="text-md mb-6 text-white/70">
          For technical issues, questions about course content, or feedback, please reach out to us.
        </p>

        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold font-morion mb-2 text-secondary/80">Contact Us</h2>
            <p className="text-white/80">
              Email: <a href="mailto:support@evermode.app" className="text-blue-400 hover:underline">support@evermode.app</a>
            </p>
            <p className="text-white/70 text-sm mt-1">
              We typically respond within 24-48 hours.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold font-morion mb-2 text-secondary/80">Frequently Asked Questions</h2>
            <p className="text-white/80">
              Check out our FAQ section for answers to common questions.
            </p>
            <Link href="/faq" className="mt-2 inline-block px-4 py-2 bg-secondary/80 hover:bg-secondary text-white rounded transition-colors">
              Go to FAQ (Coming Soon)
            </Link>
          </div>
        </div>

        <p className="mt-8 text-sm text-white/50">
          Thank you for using Evermode!
        </p>
      </div>
    </div>
  );
} 