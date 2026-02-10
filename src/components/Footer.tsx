import React from 'react';
import {
  Home,
  Facebook,
  Twitter,
  Instagram,
  MapPinned,
  Mail,
  Phone
} from
  'lucide-react';
import { Page, User } from '../types';
import { TermsModal, PrivacyPolicyModal } from './LegalModals';
interface FooterProps {
  onNavigate: (page: Page) => void;
  onFooterSecretClick: () => void;
  user?: User | null;
}
export function Footer({
  onNavigate,
  onFooterSecretClick,
  user = null
}: FooterProps) {
  const [isTermsOpen, setIsTermsOpen] = React.useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = React.useState(false);

  return (
    <footer className="bg-[#3E2723] text-white py-16 px-4 sm:px-6 lg:px-8 mt-auto">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl">FindItMate</span>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              AI-powered student accommodation platform connecting students with
              verified, safe, and affordable hostels near Sri Lankan
              universities.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">

                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">

                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">

                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('rooms')}
                  className="hover:text-white transition-colors text-left">

                  Find Hostels
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    if (!user) {
                      onNavigate('login');
                    } else {
                      onNavigate('tour-planner');
                    }
                  }}
                  className="hover:text-white transition-colors text-left">

                  Tour Planner
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('landlord-login')}
                  className="hover:text-white transition-colors text-left">

                  List Your Property
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  Safety Guidelines
                </span>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsTermsOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Terms of Service
                </button>
              </li>
              <li>
                <button
                  onClick={() => setIsPrivacyOpen(true)}
                  className="hover:text-white transition-colors text-left"
                >
                  Privacy Policy
                </button>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li>
                <a
                  href="https://www.google.com/maps/search/UCSC+Reid+Avenue+Colombo+07"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-white transition-colors">

                  <MapPinned className="h-4 w-4 flex-shrink-0" />
                  <span>UCSC, Reid Avenue, Colombo 07</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:damikarajithuru@gmail.com"
                  className="flex items-center gap-2 hover:text-white transition-colors">

                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span>damikarajithuru@gmail.com</span>
                </a>
              </li>
              <li>
                <a
                  href="tel:+94701926192"
                  className="flex items-center gap-2 hover:text-white transition-colors">

                  <Phone className="h-4 w-4 flex-shrink-0" />
                  <span>+94 701 926 192</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div
          className="mt-12 pt-8 border-t border-white/10 text-center text-gray-500 text-sm cursor-default select-none"
          onClick={onFooterSecretClick}>

          © 2026 FindItMate. All rights reserved. Made with ❤️ for Sri Lankan
          students.
        </div>
      </div>
      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </footer>);

}