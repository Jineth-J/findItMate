import React, { useState, useRef } from 'react';
import {
  ArrowLeft,
  Upload,
  User,
  Phone,
  Home,
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle,
  X,
  ShieldCheck
} from 'lucide-react';
import { CalendarPopover } from '../components/CalendarPopover';
import { TermsModal, PrivacyPolicyModal } from '../components/LegalModals';
import { uploadAPI, verificationsAPI } from '../services/api';

interface LandlordVerificationPageProps {
  onBack?: () => void;
  onSubmit: () => void;
}

export function LandlordVerificationPage({
  onBack,
  onSubmit
}: LandlordVerificationPageProps) {
  // === FORM STATE ===
  // 1. Personal Information
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [nicNumber, setNicNumber] = useState('');
  const [nicFrontFile, setNicFrontFile] = useState<File | null>(null);
  const [nicBackFile, setNicBackFile] = useState<File | null>(null);

  // 2. Contact Details
  const [mobileNumber, setMobileNumber] = useState('');
  const [secondaryPhone, setSecondaryPhone] = useState('');

  // 3. Residential Address
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // 4. Property Ownership
  const [ownershipDoc, setOwnershipDoc] = useState<File | null>(null);
  const [experienceDesc, setExperienceDesc] = useState('');

  // 5. Agreement
  const [confirmAccurate, setConfirmAccurate] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const nicFrontInputRef = useRef<HTMLInputElement>(null);
  const nicBackInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  // Legal Modal States
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);

  // Constants
  const DISTRICTS = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Mullaitivu', 'Vavuniya', 'Trincomalee', 'Batticaloa', 'Ampara',
    'Puttalam', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
  ];

  // === HANDLERS ===
  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (
        file.type === 'image/jpeg' ||
        file.type === 'image/png' ||
        file.type === 'image/webp' ||
        file.type === 'application/pdf'
      ) {
        setter(file);
      } else {
        alert('Please upload JPG, PNG, WebP images or PDF documents.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName || !dob || !nicNumber || !nicFrontFile || !nicBackFile) {
      setError('Please complete the Personal Information section, including NIC photos.');
      window.scrollTo(0, 0);
      return;
    }
    if (!mobileNumber) {
      setError('Please provide a mobile number.');
      window.scrollTo(0, 300);
      return;
    }
    if (!addressLine1 || !city || !district || !postalCode) {
      setError('Please complete your Residential Address.');
      return;
    }
    if (!ownershipDoc) {
      setError('Please upload a Property Ownership Document.');
      return;
    }
    if (!confirmAccurate || !agreeTerms) {
      setError('You must agree to the terms and confirm accuracy.');
      return;
    }

    try {
      setIsSubmitting(true);

      // 1. Upload NIC Front
      const nicFrontResponse = await uploadAPI.upload(nicFrontFile);
      if (!nicFrontResponse.success || !nicFrontResponse.data?.url) throw new Error('Failed to upload NIC Front');
      const nicFrontUrl = nicFrontResponse.data.url;

      // 2. Upload NIC Back
      const nicBackResponse = await uploadAPI.upload(nicBackFile);
      if (!nicBackResponse.success || !nicBackResponse.data?.url) throw new Error('Failed to upload NIC Back');
      const nicBackUrl = nicBackResponse.data.url;

      // 3. Upload Ownership Doc
      const ownershipResponse = await uploadAPI.upload(ownershipDoc);
      if (!ownershipResponse.success || !ownershipResponse.data?.url) throw new Error('Failed to upload Ownership Document');
      const ownershipUrl = ownershipResponse.data.url;

      // 4. Submit Verification Data
      const verificationData = {
        dob,
        address: {
          line1: addressLine1,
          line2: addressLine2,
          city,
          district,
          postalCode
        },
        nicFrontUrl: nicFrontUrl,
        nicBackUrl: nicBackUrl,
        ownershipDocUrl: ownershipUrl,
        experienceDescription: experienceDesc
      };

      await verificationsAPI.submit(verificationData);

      onSubmit(); // Navigate to success or dashboard

    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Verification submission failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* Header */}
      <div className="bg-[#E8E0D5] py-6 px-4 sm:px-6 lg:px-8 mb-8 sticky top-0 z-40 border-b border-[#D7CCC8]">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 hover:bg-[#3E2723]/10 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-[#3E2723]" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">
              Landlord Identity Verification
            </h1>
            <p className="text-[#5D4037] text-sm">
              Complete this form to become a verified landlord
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Information */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F5F0E8]">
              <div className="w-10 h-10 bg-[#3E2723]/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">
                Personal Information
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="As per NIC/Passport"
                  className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <CalendarPopover
                    value={dob}
                    onChange={(date) => setDob(date)}
                    placeholder="Select date of birth" />

                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    NIC Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={nicNumber}
                    onChange={(e) => setNicNumber(e.target.value)}
                    placeholder="Old or New format"
                    className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Upload NIC Photos (Front & Back){' '}
                  <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-2 gap-4">
                  {/* Front */}
                  <div
                    onClick={() => nicFrontInputRef.current?.click()}
                    className={`border-2 border-dashed ${nicFrontFile ? 'border-green-500 bg-green-50' : 'border-[#D7CCC8] hover:bg-[#F5F0E8]'} rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden`}
                  >
                    {nicFrontFile ? (
                      <>
                        <img src={URL.createObjectURL(nicFrontFile)} alt="Front" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <div className="z-10 flex flex-col items-center">
                          <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
                          <span className="text-xs font-medium text-green-700">Front Uploaded</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-[#A1887F] mb-1" />
                        <span className="text-xs font-medium text-[#A1887F]">Front Side</span>
                      </>
                    )}
                    <input type="file" ref={nicFrontInputRef} accept="image/*" onChange={(e) => handleFileSelect(e, setNicFrontFile)} className="hidden" />
                  </div>

                  {/* Back */}
                  <div
                    onClick={() => nicBackInputRef.current?.click()}
                    className={`border-2 border-dashed ${nicBackFile ? 'border-green-500 bg-green-50' : 'border-[#D7CCC8] hover:bg-[#F5F0E8]'} rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden`}
                  >
                    {nicBackFile ? (
                      <>
                        <img src={URL.createObjectURL(nicBackFile)} alt="Back" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                        <div className="z-10 flex flex-col items-center">
                          <CheckCircle className="h-6 w-6 text-green-600 mb-1" />
                          <span className="text-xs font-medium text-green-700">Back Uploaded</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <Upload className="h-6 w-6 text-[#A1887F] mb-1" />
                        <span className="text-xs font-medium text-[#A1887F]">Back Side</span>
                      </>
                    )}
                    <input type="file" ref={nicBackInputRef} accept="image/*" onChange={(e) => handleFileSelect(e, setNicBackFile)} className="hidden" />
                  </div>
                </div>

                <p className="text-xs text-[#A1887F] mt-2">
                  Please upload clear photos of both sides of your National
                  Identity Card.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Contact Details */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F5F0E8]">
              <div className="w-10 h-10 bg-[#3E2723]/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">
                Contact Details
              </h2>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Mobile Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+94 7X XXX XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Secondary Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="+94 XX XXX XXXX"
                    className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

                </div>
              </div>
            </div>
          </div>

          {/* 3. Residential Address */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F5F0E8]">
              <div className="w-10 h-10 bg-[#3E2723]/10 rounded-full flex items-center justify-center">
                <Home className="h-5 w-5 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">
                Residential Address
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  placeholder="House No, Street Name"
                  className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

              </div>
              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Address Line 2 (Optional)
                </label>
                <input
                  type="text"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  placeholder="Apartment, Suite, Unit, etc."
                  className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    District <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6] appearance-none">

                    <option value="">Select District</option>
                    {DISTRICTS.map((d) =>
                      <option key={d} value={d}>
                        {d}
                      </option>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6]" />

                </div>
              </div>
            </div>
          </div>

          {/* 4. Property Ownership */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F5F0E8]">
              <div className="w-10 h-10 bg-[#3E2723]/10 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">
                Property Ownership
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Property Ownership Document{' '}
                  <span className="text-red-500">*</span>
                </label>

                {!ownershipDoc ?
                  <div
                    onClick={() => docInputRef.current?.click()}
                    className="border-2 border-dashed border-[#D7CCC8] rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-[#F5F0E8] transition-colors">

                    <Upload className="h-8 w-8 text-[#A1887F] mb-3" />
                    <span className="text-[#3E2723] font-medium">
                      Click to upload document
                    </span>
                    <span className="text-[#A1887F] text-xs mt-1">
                      PDF or Image (Max 5MB)
                    </span>
                    <span className="text-[#A1887F] text-xs mt-1">
                      Deed, Utility Bill, or Tax Document
                    </span>
                  </div> :

                  <div className="relative bg-[#F5F0E8] rounded-xl p-4 flex items-center gap-4 border border-[#D7CCC8]">
                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-[#3E2723]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#3E2723] truncate">
                        {ownershipDoc.name}
                      </p>
                      <p className="text-xs text-[#795548]">
                        {(ownershipDoc.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOwnershipDoc(null)}
                      className="p-2 hover:bg-[#D7CCC8] rounded-full transition-colors">

                      <X className="h-4 w-4 text-[#5D4037]" />
                    </button>
                  </div>
                }
                <input
                  type="file"
                  ref={docInputRef}
                  onChange={(e) => {
                    if (e.target.files?.[0]) setOwnershipDoc(e.target.files[0]);
                  }}
                  className="hidden"
                  accept="image/*,application/pdf" />

              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={experienceDesc}
                  onChange={(e) => setExperienceDesc(e.target.value)}
                  placeholder="Describe your properties and rental experience..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] bg-[#FAF9F6] resize-none" />

              </div>
            </div>
          </div>

          {/* 5. Agreement */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-[#E8E0D5]">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#F5F0E8]">
              <div className="w-10 h-10 bg-[#3E2723]/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">Declaration</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${confirmAccurate ? 'bg-[#3E2723] border-[#3E2723]' : 'bg-white border-[#D7CCC8]'}`}>
                  {confirmAccurate &&
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                  }
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={confirmAccurate}
                  onChange={() => setConfirmAccurate(!confirmAccurate)} />
                <span className="text-sm text-[#5D4037]">
                  I confirm that all information provided above is accurate and
                  true to the best of my knowledge.
                </span>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <div
                  className={`mt-1 w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${agreeTerms ? 'bg-[#3E2723] border-[#3E2723]' : 'bg-white border-[#D7CCC8]'}`}>
                  {agreeTerms &&
                    <CheckCircle className="h-3.5 w-3.5 text-white" />
                  }
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms(!agreeTerms)} />
                <span className="text-sm text-[#5D4037]">
                  I agree to the{' '}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmAccurate(confirmAccurate); // Prevent checkbox toggle if clicked
                      setIsTermsOpen(true);
                    }}
                    className="text-[#3E2723] font-bold hover:underline cursor-pointer"
                  >
                    Terms of Service
                  </span>{' '}
                  and{' '}
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      setConfirmAccurate(confirmAccurate); // Prevent checkbox toggle if clicked
                      setIsPrivacyOpen(true);
                    }}
                    className="text-[#3E2723] font-bold hover:underline cursor-pointer"
                  >
                    Privacy Policy
                  </span>
                  .
                </span>
              </label>
            </div>
          </div>
          {error &&
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 animate-in slide-in-from-top-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              {error}
            </div>
          }
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-[#3E2723] text-white font-bold text-lg rounded-xl hover:bg-[#2D1B18] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {isSubmitting ?
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting Verification...
              </> :
              'Submit Verification'
            }
          </button>
        </form>
      </div>

      <TermsModal isOpen={isTermsOpen} onClose={() => setIsTermsOpen(false)} />
      <PrivacyPolicyModal isOpen={isPrivacyOpen} onClose={() => setIsPrivacyOpen(false)} />
    </div>
  );
}