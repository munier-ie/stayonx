import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../src/utils/canvasUtils';
import { supabase } from '../src/lib/supabase';
import { Upload, X, ZoomIn } from 'lucide-react';

export const AdSubmit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  // Dodo returns payment_id (snake_case), but we also check paymentId for compatibility
  const paymentId = searchParams.get('payment_id') || searchParams.get('paymentId');
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Cropper State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const [formData, setFormData] = useState({
    sponsorName: '',
    title: '',
    description: '',
    ctaText: 'Secure your slot',
    ctaUrl: '',
    email: ''
  });

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    if (!paymentId) {
      toast.error('No payment ID found. Please purchase a slot first.');
      navigate('/advertise');
      return;
    }

    // Verify Payment - redirect immediately if invalid or already used
    const verifyPayment = async () => {
      try {
        setIsVerifying(true);
        setIsValid(false);
        const res = await fetch(`http://localhost:3050/api/payment/verify/${paymentId}`);
        const data = await res.json();
        
        // Check if ad was already submitted - redirect immediately
        // Check this FIRST since backend returns valid: false with alreadySubmitted: true
        if (data.alreadySubmitted) {
          toast.error('This payment has already been used to submit an ad.');
          navigate('/advertise');
          return;
        }
        
        if (!res.ok || !data.valid) {
          toast.error('Invalid or unpaid payment session.');
          navigate('/advertise');
          return;
        }
        
        // Payment is valid and unused - allow form to render
        setIsValid(true);
        setIsVerifying(false);
      } catch (e) {
        console.error('Verification failed', e);
        toast.error('Failed to verify payment. Please try again.');
        navigate('/advertise');
      }
    };
    
    verifyPayment();

  }, [paymentId, navigate]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
       if (file.size > 5 * 1024 * 1024) { // 5MB limit for raw upload before crop
        toast.error('Image is too large. Max 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setCropSrc(reader.result as string);
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!cropSrc || !croppedAreaPixels) return;
    try {
      const croppedBlob = await getCroppedImg(cropSrc, croppedAreaPixels);
      if (croppedBlob) {
        // Create a File from Blob
        const file = new File([croppedBlob], "ad_image.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
        setIsCropping(false);
        setCropSrc(null); // Cleanup
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to crop image.');
    }
  };
  
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    try {
      setUploading(true);
      const fileExt = "jpg"; // We are converting to jpeg in cropper
      const fileName = `${paymentId}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('ad-assets')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('ad-assets')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      // console.error('Upload error:', error);
      toast.error('Failed to upload image.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
        toast.error('Please upload an image for your ad.');
        return;
    }
    
    setLoading(true);

    try {
      // 1. Upload Image
      const publicUrl = await uploadImage();
      if (!publicUrl) throw new Error('Image upload failed');

      // 2. Submit Data
      const res = await fetch('http://localhost:3050/api/ads/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, imageUrl: publicUrl, paymentId })
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle specific error cases
        if (data.alreadySubmitted) {
          toast.error('This payment has already been used to submit an ad.');
          navigate('/advertise');
          return;
        }
        if (data.invalidPayment) {
          toast.error('Invalid payment ID. Please purchase a slot first.');
          navigate('/advertise');
          return;
        }
        throw new Error(data.error || 'Submission failed');
      }

      toast.success('Ad submitted successfully! It is now live.');
      navigate('/dashboard'); 
    } catch (err) {
      // console.error(err);
      toast.error('Failed to submit ad. Please try again.');
      // Redirect to advertise page on error
      navigate('/advertise');
    } finally {
      setLoading(false);
    }
  };

  if (!paymentId) return null;

  // Show loading while verifying payment
  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-steel text-sm">Verifying payment...</p>
        </motion.div>
      </div>
    );
  }

  // If payment is not valid (invalid, used, or error), don't render the form
  // The redirect will have been triggered in the useEffect
  if (!isValid) return null;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-12">
       <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full bg-white border border-[rgba(0,0,0,0.06)] rounded-3xl p-8 shadow-sm"
        >
          <div className="mb-8 text-center">
             <h1 className="text-2xl font-light text-obsidian mb-2">Setup your Ad</h1>
             <p className="text-steel text-sm">Payment Verified: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{paymentId}</span></p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
             {/* Sponsor Name */}
             <div>
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Sponsor Name</label>
               <input 
                  required
                  type="text"
                  placeholder="e.g. Acme Corp"
                  className="w-full px-4 py-3 bg-vapor rounded-xl border-none focus:ring-1 focus:ring-obsidian transition-all outline-none text-charcoal"
                  value={formData.sponsorName}
                  onChange={e => setFormData({...formData, sponsorName: e.target.value})}
               />
             </div>

             {/* Email */}
             <div>
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Contact Email</label>
               <input 
                  required
                  type="email"
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 bg-vapor rounded-xl border-none focus:ring-1 focus:ring-obsidian transition-all outline-none text-charcoal"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
               />
             </div>

             {/* Title */}
             <div>
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Ad Headline (Max 40 chars)</label>
               <input 
                  required
                  maxLength={40}
                  type="text"
                  placeholder="Boost your X growth"
                  className="w-full px-4 py-3 bg-vapor rounded-xl border-none focus:ring-1 focus:ring-obsidian transition-all outline-none text-charcoal"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
               />
             </div>

             {/* Description */}
             <div>
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Description (Max 120 chars)</label>
               <textarea 
                  required
                  maxLength={120}
                  placeholder="Tools for creators and operators on X."
                  className="w-full px-4 py-3 bg-vapor rounded-xl border-none focus:ring-1 focus:ring-obsidian transition-all outline-none text-charcoal resize-none h-24"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
               />
             </div>

             {/* Image Upload */}
             <div>
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Ad Image (Square / Logo)</label>
               <div className="flex items-center justify-center w-full">
                 {!imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-vapor hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500">Click to upload (Max 2MB)</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                    </label>
                 ) : (
                    <div className="relative w-full h-32 bg-vapor rounded-xl border border-gray-200 flex items-center justify-center overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="h-full object-contain" />
                        <button 
                            type="button"
                            onClick={() => { setImageFile(null); setImagePreview(null); }}
                            className="absolute top-2 right-2 p-1 bg-white/80 rounded-full hover:bg-white text-gray-600 shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                 )}
               </div>
             </div>

             {/* CTA Button Text */}
             <div>
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Button Text</label>
               <input 
                  required
                  type="text"
                  maxLength={20}
                  placeholder="Secure your slot"
                  className="w-full px-4 py-3 bg-vapor rounded-xl border-none focus:ring-1 focus:ring-obsidian transition-all outline-none text-charcoal"
                  value={formData.ctaText}
                  onChange={e => setFormData({...formData, ctaText: e.target.value})}
               />
             </div>

             {/* CTA URL */}
             <div className="pb-4">
               <label className="block text-xs font-medium uppercase tracking-wider text-steel mb-2">Destination URL</label>
               <input 
                  required
                  type="url"
                  placeholder="https://your-site.com"
                  className="w-full px-4 py-3 bg-vapor rounded-xl border-none focus:ring-1 focus:ring-obsidian transition-all outline-none text-charcoal"
                  value={formData.ctaUrl}
                  onChange={e => setFormData({...formData, ctaUrl: e.target.value})}
               />
             </div>
             
             {/* Sticky Bottom Bar for Mobile or just visible button */}
             <div className="sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-100 mt-6">
                <button 
                    disabled={loading || uploading}
                    type="submit"
                    className="w-full py-4 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
                >
                    {loading || uploading ? 'Publishing...' : 'Launch Ad'}
                </button>
             </div>
          </form>
       </motion.div>

      {/* Cropper Modal - Portaled to body to escape Layout stacking context */}
      {isCropping && cropSrc && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
             <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-medium text-gray-900">Crop Image</h3>
                    <button onClick={() => setIsCropping(false)} className="text-gray-500 hover:text-gray-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                
                <div className="relative w-full h-80 bg-gray-900">
                     <Cropper
                        image={cropSrc}
                        crop={crop}
                        zoom={zoom}
                        aspect={1}
                        onCropChange={setCrop}
                        onCropComplete={onCropComplete}
                        onZoomChange={setZoom}
                      />
                </div>

                <div className="p-6 space-y-4 bg-white">
                     <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Zoom</label>
                        <input
                          type="range"
                          value={zoom}
                          min={1}
                          max={3}
                          step={0.1}
                          aria-labelledby="Zoom"
                          onChange={(e) => setZoom(Number(e.target.value))}
                          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-obsidian"
                        />
                     </div>
                     <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsCropping(false)} 
                            className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-50 rounded-xl transition-colors border border-gray-200"
                        >
                            Cancel
                        </button>
                        <button 
                            type="button" 
                            onClick={handleCropSave} 
                            className="flex-1 py-3 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors"
                        >
                            Apply Crop
                        </button>
                     </div>
                </div>
             </div>
        </div>,
        document.body
      )}
    </div>
  );
};
