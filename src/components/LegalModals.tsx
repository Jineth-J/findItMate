import React, { useEffect, useState } from 'react';
import { X, FileText, Shield, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

interface LegalModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}

function LegalModal({ isOpen, onClose, title, icon, children }: LegalModalProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.body.style.overflow = 'unset';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isVisible && !isOpen) return null;

    return (
        <div
            className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div
                className={`relative w-full max-w-4xl bg-[#FAF9F6] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] transform transition-all duration-300 ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#E8E0D5] bg-white rounded-t-3xl sticky top-0 z-10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#3E2723]/10 rounded-xl flex items-center justify-center text-[#3E2723]">
                            {icon}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-[#3E2723]">{title}</h2>
                            <p className="text-sm text-[#795548]">FindItMate Legal & Compliance</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[#F5F0E8] rounded-full transition-colors text-[#5D4037]"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="overflow-y-auto p-6 md:p-10 space-y-6 text-[#5D4037] leading-relaxed">
                    {children}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#E8E0D5] bg-white rounded-b-3xl flex justify-end gap-3 sticky bottom-0 z-10">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-[#3E2723] text-white font-medium rounded-xl hover:bg-[#2D1B18] transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                    >
                        I Understand
                        <ArrowRight className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

// ================= TERMS OF SERVICE CONTENT =================

export function TermsModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <LegalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Terms of Service"
            icon={<FileText className="h-6 w-6" />}
        >
            <div className="prose prose-brown max-w-none">
                <div className="bg-[#EFEBE9] p-6 rounded-2xl mb-8 flex gap-4 border border-[#D7CCC8]">
                    <AlertCircle className="h-6 w-6 text-[#3E2723] flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-[#3E2723] text-lg mb-2">Last Updated: February 9, 2026</h4>
                        <p className="text-sm">Please read these Terms of Service carefully before using the FindItMate platform. By accessing or using our services, you agree to be bound by these terms.</p>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#3E2723] mb-4">1. Acceptance of Terms</h3>
                <p>By accessing and using FindItMate ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement. In addition, when using these particular services, you shall be subject to any posted guidelines or rules applicable to such services.</p>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">2. Description of Service</h3>
                <p>FindItMate provides a digital platform connecting students with landlords for accommodation purposes. We act as an intermediary to facilitate listings, bookings, and communication but are not a party to any rental agreement between students and landlords.</p>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">3. User Obligations</h3>
                <div className="space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-[#E8E0D5]">
                        <h4 className="font-bold text-[#3E2723] mb-2">For Landlords</h4>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Must provide accurate and truthful information about properties.</li>
                            <li>Must have legal authority to rent usage of the property.</li>
                            <li>Must comply with all local housing laws and regulations.</li>
                            <li>Responsible for maintaining the condition of the property.</li>
                        </ul>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E8E0D5]">
                        <h4 className="font-bold text-[#3E2723] mb-2">For Students</h4>
                        <ul className="list-disc pl-5 space-y-2 text-sm">
                            <li>Must use provided identity for verification purposes.</li>
                            <li>Responsible for reading the full listing before booking.</li>
                            <li>Must respect property rules and community guidelines.</li>
                            <li>Agrees to pay fees and rent as specified in bookings.</li>
                        </ul>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">4. Privacy Policy</h3>
                <p>Your use of the Platform is also subject to our Privacy Policy. Please review our Privacy Policy, which also governs the Site and informs users of our data collection practices.</p>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">5. Limitation of Liability</h3>
                <p>FindItMate shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages resulting from legitimate use or misuse of our services.</p>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">6. Termination</h3>
                <p>We may terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
            </div>
        </LegalModal>
    );
}

// ================= PRIVACY POLICY CONTENT =================

export function PrivacyPolicyModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <LegalModal
            isOpen={isOpen}
            onClose={onClose}
            title="Privacy Policy"
            icon={<Shield className="h-6 w-6" />}
        >
            <div className="prose prose-brown max-w-none">
                <div className="bg-[#E8F5E9] p-6 rounded-2xl mb-8 flex gap-4 border border-[#C8E6C9]">
                    <CheckCircle className="h-6 w-6 text-green-700 flex-shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-[#1B5E20] text-lg mb-2">Your Privacy is Our Priority</h4>
                        <p className="text-sm text-[#2E7D32]">FindItMate is committed to protecting the privacy of its users. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.</p>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#3E2723] mb-4">1. Information We Collect</h3>
                <p>We collect information that identifies, relates to, describes, references, is capable of being associated with, or could reasonably be linked, directly or indirectly, with a particular consumer or device.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
                    <div className="bg-white p-4 rounded-xl border border-[#E8E0D5] hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EFEBE9] flex items-center justify-center text-xs">1</span>
                            Personal Identity
                        </h4>
                        <p className="text-sm text-[#5D4037]">Name, National ID (NIC), Passport details, Date of Birth, and profile photographs.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E8E0D5] hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EFEBE9] flex items-center justify-center text-xs">2</span>
                            Contact Data
                        </h4>
                        <p className="text-sm text-[#5D4037]">Email address, telephone numbers, and physical addresses.</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E8E0D5] hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EFEBE9] flex items-center justify-center text-xs">3</span>
                            Financial Data
                        </h4>
                        <p className="text-sm text-[#5D4037]">Payment method details and transaction history (processed securely via Stripe).</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-[#E8E0D5] hover:shadow-md transition-shadow">
                        <h4 className="font-bold text-[#3E2723] mb-2 flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#EFEBE9] flex items-center justify-center text-xs">4</span>
                            Property Data
                        </h4>
                        <p className="text-sm text-[#5D4037]">Property deeds, location data, photos, and amenities for listed accommodations.</p>
                    </div>
                </div>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">2. How We Use Your Information</h3>
                <ul className="list-disc pl-5 space-y-2 markers:text-[#3E2723]">
                    <li>To verify your identity and ensure the safety of our community.</li>
                    <li>To facilitate bookings and process payments.</li>
                    <li>To communicate with you regarding your account or bookings.</li>
                    <li>To improve our platform and user experience via analytics.</li>
                </ul>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">3. Data Protection</h3>
                <p>We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems.</p>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">4. Third-Party Disclosure</h3>
                <p>We do not sell, trade, or otherwise transfer to outside parties your Personally Identifiable Information unless we provide users with advance notice. This does not include website hosting partners and other parties who assist us in operating our website, conducting our business, or serving our users.</p>

                <h3 className="text-xl font-bold text-[#3E2723] mt-8 mb-4">5. Contact Us</h3>
                <p>If there are any questions regarding this privacy policy, you may contact us using the information in the Support section of our website.</p>
            </div>
        </LegalModal>
    );
}
