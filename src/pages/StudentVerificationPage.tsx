import React, { useState, useRef } from 'react';
import { ArrowLeft, CreditCard, GraduationCap, Upload, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { uploadAPI, verificationsAPI } from '../services/api';

interface StudentVerificationPageProps {
  onBack?: () => void;
  onSubmit: () => void;
}

export function StudentVerificationPage({
  onBack,
  onSubmit
}: StudentVerificationPageProps) {
  // Form State
  const [nicNumber, setNicNumber] = useState('');
  const [universityId, setUniversityId] = useState('');

  // File State
  const [nicFrontFile, setNicFrontFile] = useState<File | null>(null);
  const [nicBackFile, setNicBackFile] = useState<File | null>(null);
  const [uniFile, setUniFile] = useState<File | null>(null);

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Refs
  const nicFrontInputRef = useRef<HTMLInputElement>(null);
  const nicBackInputRef = useRef<HTMLInputElement>(null);
  const uniInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (f: File | null) => void) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/webp') {
        setFile(file);
      } else {
        alert('Please upload JPG, PNG, or WebP images only.');
      }
    }
  };

  const handleSubmit = async () => {
    if (!nicNumber) {
      setError('Please enter your NIC number.');
      return;
    }
    if (!nicFrontFile || !nicBackFile) {
      setError('Please upload both front and back sides of your NIC.');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      // 1. Upload NIC Front
      const nicFrontResponse = await uploadAPI.upload(nicFrontFile);
      if (!nicFrontResponse.success || !nicFrontResponse.data?.url) throw new Error('Failed to upload NIC Front');
      const nicFrontUrl = nicFrontResponse.data.url;

      // 2. Upload NIC Back
      const nicBackResponse = await uploadAPI.upload(nicBackFile);
      if (!nicBackResponse.success || !nicBackResponse.data?.url) throw new Error('Failed to upload NIC Back');
      const nicBackUrl = nicBackResponse.data.url;

      // 3. Upload University ID (if provided)
      let uniIdUrl = '';
      if (uniFile) {
        const uniResponse = await uploadAPI.upload(uniFile);
        if (uniResponse.success && uniResponse.data?.url) {
          uniIdUrl = uniResponse.data.url;
        }
      }

      // 4. Submit Verification Data
      const verificationData = {
        nic: nicNumber,
        nicFrontUrl: nicFrontUrl,
        nicBackUrl: nicBackUrl,
        universityIdUrl: uniIdUrl,
        // universityId number is in state 'universityId' if needed, but schema didn't explicitly ask for it in verificationData, 
        // passing it anyway if the backend uses it or we add it to the schema.
        // The schema has `verificationData: { nic, nicFrontUrl, nicBackUrl, universityIdUrl }`.
        // I should probably save `universityId` to the student profile directly or add it to verificationData.
        // Let's stick to the schema I defined: nic, nicFrontUrl, nicBackUrl, universityIdUrl.
      };

      await verificationsAPI.submit(verificationData);

      onSubmit(); // Navigate to success or dashboard
    } catch (err: any) {
      console.error('Verification failed:', err);
      setError(err.message || 'Verification submission failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] pb-20">
      {/* Header */}
      <div className="bg-[#E8E0D5] py-6 px-4 sm:px-6 lg:px-8 mb-8 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          {onBack && (
            <button onClick={onBack} className="p-2 hover:bg-[#3E2723]/10 rounded-full transition-colors">
              <ArrowLeft className="h-6 w-6 text-[#3E2723]" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723]">
              Student Verification
            </h1>
            <p className="text-[#5D4037]">
              Complete your profile verification to access all features.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="space-y-8">

          {/* NIC Verification */}
          <div className="bg-white rounded-3xl p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-[#F5F0E8] pb-4">
              <div className="p-3 bg-[#EFEBE9] rounded-full">
                <CreditCard className="h-6 w-6 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">
                National Identity Card (NIC)
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#5D4037] mb-2">
                  NIC Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={nicNumber}
                  onChange={(e) => setNicNumber(e.target.value)}
                  placeholder="Enter your NIC Number"
                  className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Front Side */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Front Side <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed ${nicFrontFile ? 'border-green-500 bg-green-50' : 'border-[#D7CCC8] hover:border-[#795548] hover:bg-[#FAF9F6]'} rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]`}
                    onClick={() => nicFrontInputRef.current?.click()}
                  >
                    {nicFrontFile ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        <span className="text-green-700 text-sm font-medium text-center truncate w-full px-2">
                          {nicFrontFile.name}
                        </span>
                        <span className="text-xs text-green-600 mt-1">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#A1887F] mb-2" />
                        <span className="text-[#A1887F] text-sm font-medium">Upload Front Image</span>
                        <span className="text-xs text-[#BCAAA4] mt-1">JPG, PNG, WebP</span>
                      </>
                    )}
                    <input type="file" ref={nicFrontInputRef} accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, setNicFrontFile)} className="hidden" />
                  </div>
                </div>

                {/* Back Side */}
                <div>
                  <label className="block text-sm font-medium text-[#5D4037] mb-2">
                    Back Side <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`border-2 border-dashed ${nicBackFile ? 'border-green-500 bg-green-50' : 'border-[#D7CCC8] hover:border-[#795548] hover:bg-[#FAF9F6]'} rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]`}
                    onClick={() => nicBackInputRef.current?.click()}
                  >
                    {nicBackFile ? (
                      <>
                        <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                        <span className="text-green-700 text-sm font-medium text-center truncate w-full px-2">
                          {nicBackFile.name}
                        </span>
                        <span className="text-xs text-green-600 mt-1">Click to change</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-[#A1887F] mb-2" />
                        <span className="text-[#A1887F] text-sm font-medium">Upload Back Image</span>
                        <span className="text-xs text-[#BCAAA4] mt-1">JPG, PNG, WebP</span>
                      </>
                    )}
                    <input type="file" ref={nicBackInputRef} accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, setNicBackFile)} className="hidden" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* University ID Verification (Optional) */}
          <div className="bg-white rounded-3xl p-8 shadow-md">
            <div className="flex items-center gap-3 mb-6 border-b border-[#F5F0E8] pb-4">
              <div className="p-3 bg-[#EFEBE9] rounded-full">
                <GraduationCap className="h-6 w-6 text-[#3E2723]" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">
                University ID <span className="text-sm font-normal text-[#795548] ml-2">(Optional)</span>
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#5D4037] mb-2">
                  University ID Number
                </label>
                <input
                  type="text"
                  value={universityId}
                  onChange={(e) => setUniversityId(e.target.value)}
                  placeholder="Enter University ID Number"
                  className="w-full px-4 py-3 rounded-xl border border-[#D7CCC8] focus:outline-none focus:ring-2 focus:ring-[#795548] focus:border-transparent bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#5D4037] mb-2">
                  Upload ID Card Image
                </label>
                <div
                  className={`border-2 border-dashed ${uniFile ? 'border-green-500 bg-green-50' : 'border-[#D7CCC8] hover:border-[#795548] hover:bg-[#FAF9F6]'} rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all min-h-[160px]`}
                  onClick={() => uniInputRef.current?.click()}
                >
                  {uniFile ? (
                    <>
                      <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                      <span className="text-green-700 text-sm font-medium text-center truncate w-full px-2">
                        {uniFile.name}
                      </span>
                      <span className="text-xs text-green-600 mt-1">Click to change</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-[#A1887F] mb-2" />
                      <span className="text-[#A1887F] text-sm font-medium">Upload University ID</span>
                      <span className="text-xs text-[#BCAAA4] mt-1">JPG, PNG, WebP</span>
                    </>
                  )}
                  <input type="file" ref={uniInputRef} accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, setUniFile)} className="hidden" />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full py-4 bg-[#3E2723] text-white font-bold rounded-xl hover:bg-[#2D1B18] disabled:bg-[#A1887F] disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit for Verification'
              )}
            </button>
            <p className="text-center text-sm text-[#795548] mt-4">
              By submitting, you confirm that the uploaded documents are valid and belong to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}