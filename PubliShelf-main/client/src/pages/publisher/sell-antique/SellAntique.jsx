import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { sellAntique } from "../../../services/publisher.services.js";

// New validation helpers
import {
  alphabetsOnlyRegex,
  descriptionRegex,
  validateAuthFiles,
  validateItemImage,
  MAX_AUTH_DOCS
} from "./sellAntiqueValidations.js";

const SellAntique = () => {
  const [imagePreview1, setImagePreview1] = useState(null);
  const [authPreviews, setAuthPreviews] = useState([]); // previews for multiple files
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, setError, clearErrors, formState: { errors, touchedFields, isSubmitted } } = useForm({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: {
      title: '',
      author: '',
      description: '',
      genre: '',
      condition: '',
      basePrice: '',
      auctionStart: '',
      auctionEnd: '',
      itemImage: null,
      authenticationImages: []
    }
  });
  const formData = watch();

  // ----------------------------
  // Date minimum setters
  // ----------------------------
  useEffect(() => {
    const now = new Date();
    const localISOTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    const startInput = document.getElementById("auctionStart");
    const endInput = document.getElementById("auctionEnd");

    if (startInput) startInput.min = localISOTime;
    if (endInput) endInput.min = localISOTime;
  }, []);

  // Ensure auction end >= start + 1 hour
  useEffect(() => {
    const start = formData.auctionStart;
    const endInput = document.getElementById("auctionEnd");
    if (!start || !endInput) return;

    const minEnd = new Date(new Date(start).getTime() + 60 * 60 * 1000);
    const minISO = new Date(minEnd.getTime() - minEnd.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);

    endInput.min = minISO;

    if (formData.auctionEnd && formData.auctionEnd < minISO) {
      setValue('auctionEnd', '', { shouldValidate: true });
    }
  }, [formData.auctionStart, formData.auctionEnd, setValue]);

  // ----------------------------
  // Input Handlers
  // ----------------------------
  const handleReactiveDateChecks = () => {
    const start = formData.auctionStart;
    const end = formData.auctionEnd;
    if (start) {
      const startDate = new Date(start);
      const now = new Date();
      if (startDate < now) setError('auctionStart', { message: 'Auction start must be in the future.' }); else clearErrors('auctionStart');
      if (end) {
        const endDate = new Date(end);
        if (endDate <= new Date(startDate.getTime() + 60 * 60 * 1000)) setError('auctionEnd', { message: 'Auction end must be at least 1 hour after start.' }); else clearErrors('auctionEnd');
      }
    }
  };
  // Reactive validation between start/end times
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { handleReactiveDateChecks(); }, [formData.auctionStart, formData.auctionEnd]);

  // ----------------------------
  // Item Image Upload
  // ----------------------------
  const handleItemImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const errorMsg = validateItemImage(file);
    if (errorMsg) { setError('itemImage', { message: errorMsg }); return; }
    setValue('itemImage', file, { shouldValidate: true });
    clearErrors('itemImage');

    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview1(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ----------------------------
  // Authentication Document Upload (IMAGE + PDF + DOC + TXT)
  // ----------------------------
  const handleAuthFilesChange = (e) => {
    const incoming = Array.from(e.target.files || []);
    if (!incoming.length) return;

    // Merge with existing, avoid duplicates by name+size
    const existing = formData.authenticationImages || [];
      const merged = [...existing];
      incoming.forEach(f => {
        if (!merged.some(m => m.name === f.name && m.size === f.size)) merged.push(f);
      });
      // Enforce max
      if (merged.length > MAX_AUTH_DOCS) {
        setError('authenticationImages', { message: `You can upload up to ${MAX_AUTH_DOCS} documents.` });
        return;
      }
      const errorMsg = validateAuthFiles(merged);
      if (errorMsg) {
        setError('authenticationImages', { message: errorMsg });
        return;
      }
      // Rebuild previews
      const previewsPromises = merged.map((file) => {
        if (file.type.startsWith("image/")) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ isImage: true, src: ev.target.result, name: file.name });
            reader.readAsDataURL(file);
          });
        }
        return Promise.resolve({ isImage: false, name: file.name });
      });
      Promise.all(previewsPromises).then(setAuthPreviews);
      clearErrors('authenticationImages');
      setValue('authenticationImages', merged, { shouldValidate: true });
  };

  const removeAuthFile = (index) => {
    const arr = [...(formData.authenticationImages || [])];
      arr.splice(index, 1);
      const previewsPromises = arr.map((file) => {
        if (file.type.startsWith("image/")) {
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve({ isImage: true, src: ev.target.result, name: file.name });
            reader.readAsDataURL(file);
          });
        }
        return Promise.resolve({ isImage: false, name: file.name });
      });
      Promise.all(previewsPromises).then(setAuthPreviews);
      // Revalidate remaining
      const errorMsg = validateAuthFiles(arr);
    if (errorMsg) setError('authenticationImages', { message: errorMsg }); else clearErrors('authenticationImages');
    setValue('authenticationImages', arr, { shouldValidate: true });
  };

  const clearItemImage = () => {
    // When the user removes the item image, mark the field as empty and re-validate
    setValue('itemImage', null, { shouldValidate: true });
    setImagePreview1(null);
    const err = validateItemImage(null);
    if (err) {
      setError('itemImage', { message: err });
    } else {
      clearErrors('itemImage');
    }
  };

  // ----------------------------
  // Validation
  // ----------------------------
  const extraSubmitChecks = () => {
    // item image
    const itemErr = validateItemImage(formData.itemImage);
    if (itemErr) setError('itemImage', { message: itemErr }); else clearErrors('itemImage');
    const docsErr = validateAuthFiles(formData.authenticationImages);
    if (docsErr) setError('authenticationImages', { message: docsErr }); else clearErrors('authenticationImages');
    // date relationship already handled reactively
    return !errors.itemImage && !errors.authenticationImages;
  };

  // ----------------------------
  // Submit
  // ----------------------------
  const onSubmit = async () => {
    if (!extraSubmitChecks()) { window.scrollTo({ top:0, behavior:'smooth'}); return; }
    const submitData = new FormData();
    const { authenticationImages, itemImage, auctionStart, auctionEnd, ...rest } = formData;
    
    Object.entries(rest).forEach(([k,v]) => { if (v !== null && v !== undefined) submitData.append(k, v); });
    
    if (auctionStart) {
      const startDate = new Date(auctionStart);
      submitData.append('auctionStart', startDate.toISOString());
    }
    if (auctionEnd) {
      const endDate = new Date(auctionEnd);
      submitData.append('auctionEnd', endDate.toISOString());
    }
    
    if (itemImage) submitData.append('itemImage', itemImage);
    (authenticationImages||[]).forEach(f => submitData.append('authenticationImages', f));
    try {
      setLoading(true);
      const response = await sellAntique(submitData);
      if (response.success) { toast.success('Successfully sent for verification'); navigate('/publisher/dashboard'); }
      else toast.error(response.message || 'Failed to submit form');
    } catch {
      toast.error('Error submitting form');
    } finally { setLoading(false); }
  };

  // ----------------------------
  // RENDER UI
  // ----------------------------
  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-white shadow-md overflow-hidden">

          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Sell Antique Book</h1>
            <p className="text-gray-500 mt-1">Create an auction for your antique book</p>
          </div>

          {/* FORM */}
          <form className="p-6 space-y-6 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>

            {/* --- Title / Author --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Book Title</label>
                <input
                  type="text"
                  {...register('title', { validate: (v) => {
                    const trimmed = v.trim();
                    if (!trimmed) return 'Book title is required.';
                    if (trimmed.length < 2) return 'Book title must be at least 2 characters.';
                    return true; } })}
                  aria-invalid={errors.title ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.title && (touchedFields.title || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  {...register('author', { validate: (v)=> {
                    const trimmed = v.trim();
                    if (!trimmed) return 'Author name is required.';
                    if (!alphabetsOnlyRegex.test(trimmed)) return 'Author name must contain only alphabets.';
                    if (trimmed.length < 2) return 'Author name must be at least 2 characters.';
                    return true; } })}
                  aria-invalid={errors.author ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.author && (touchedFields.author || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
              </div>
            </div>

            {/* --- Description --- */}
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="4"
                {...register('description', { validate: (v)=> {
                  const trimmed = v.trim();
                  if (!trimmed) return 'Description is required.';
                  if (trimmed.length < 10) return 'Description must be at least 10 characters.';
                  if (!descriptionRegex.test(trimmed)) return 'Description contains invalid characters.';
                  return true; } })}
                aria-invalid={errors.description ? 'true' : 'false'}
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
              />
              {(errors.description && (touchedFields.description || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* --- Genre / Condition --- */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Genre</label>
                <select
                  {...register('genre', { validate: (v)=> v ? true : 'Please select a genre.' })}
                  aria-invalid={errors.genre ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                >
                  <option value="" hidden>Select Genre</option>
                  <option>Fiction</option>
                  <option>Non-Fiction</option>
                  <option>Mystery</option>
                  <option>Science Fiction</option>
                  <option>Romance</option>
                  <option>Thriller</option>
                  <option>Other</option>
                </select>
                {(errors.genre && (touchedFields.genre || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.genre.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Condition</label>
                <select
                  {...register('condition', { validate: (v)=> v ? true : 'Please select a condition.' })}
                  aria-invalid={errors.condition ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                >
                  <option value="" hidden>Select Condition</option>
                  <option>Mint</option>
                  <option>Near Mint</option>
                  <option>Excellent</option>
                  <option>Very Good</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
                {(errors.condition && (touchedFields.condition || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.condition.message}</p>}
              </div>
            </div>

            {/* --- Base Price + Dates --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Base Price (₹)</label>
                <input
                  type="number"
                  {...register('basePrice', { validate: (v)=> {
                    if (!v?.toString().trim()) return 'Base price is required.';
                    const num = Number(v); if (isNaN(num) || num <=0) return 'Base price must be a positive number.'; return true; } })}
                  aria-invalid={errors.basePrice ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.basePrice && (touchedFields.basePrice || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.basePrice.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Auction Start</label>
                <input
                  type="datetime-local"
                  id="auctionStart"
                  {...register('auctionStart', { validate: (v)=> v ? true : 'Auction start date & time is required.' })}
                  aria-invalid={errors.auctionStart ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.auctionStart && (touchedFields.auctionStart || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.auctionStart.message}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Auction End</label>
                <input
                  type="datetime-local"
                  id="auctionEnd"
                  {...register('auctionEnd', { validate: (v)=> v ? true : 'Auction end date & time is required.' })}
                  aria-invalid={errors.auctionEnd ? 'true' : 'false'}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.auctionEnd && (touchedFields.auctionEnd || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.auctionEnd.message}</p>}
              </div>
            </div>

            {/* --- Item Image Upload --- */}
            <div>
              <label className="text-sm font-medium text-gray-700">Item Image</label>
              <div className={`mt-2 rounded-lg border-2 border-dashed ${errors.itemImage ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"} p-4`}> 
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-white border">
                    <i className="fas fa-image text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload a clear photo of the book</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WebP up to 10MB</p>
                  </div>
                  <label className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700">
                    Browse
                    <input type="file" accept="image/*" onChange={handleItemImageChange} className="hidden" />
                  </label>
                </div>
                {errors.itemImage && <p className="text-red-500 text-xs mt-2">{errors.itemImage.message}</p>}
                {imagePreview1 && (
                  <div className="mt-3 relative inline-block group">
                    <img src={imagePreview1} className="w-48 h-64 object-cover rounded-lg shadow-md" alt="Item Preview" />
                    <button type="button" onClick={clearItemImage} className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* --- Authentication File Upload (multi-type) --- */}
            <div>
              <label className="text-sm font-medium text-gray-700">Authentication Documents</label>
              <div className={`mt-2 rounded-lg border-2 border-dashed ${errors.authenticationImages ? "border-red-400 bg-red-50" : "border-gray-300 bg-gray-50"} p-4`}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-white border">
                    <i className="fas fa-file-upload text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload authentication documents (up to {MAX_AUTH_DOCS})</p>
                    <p className="text-xs text-gray-500">PDF, JPG, PNG, WebP, HEIC, DOC, DOCX, TXT up to 10MB each</p>
                  </div>
                  <label className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700">
                    Browse
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.heic,.doc,.docx,.txt"
                      multiple
                      onChange={handleAuthFilesChange}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.authenticationImages && <p className="text-red-500 text-xs mt-2">{errors.authenticationImages.message}</p>}
                {authPreviews.length > 0 && (
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {authPreviews.map((p, idx) => (
                      <div key={idx} className="relative border rounded-md bg-white p-2 flex items-center gap-2 shadow-sm group">
                        {p.isImage ? (
                          <img src={p.src} alt={p.name || `auth-${idx}`} className="w-16 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-16 h-16 flex items-center justify-center rounded bg-gray-100">
                            <i className="fas fa-file-alt text-gray-500"></i>
                          </div>
                        )}
                        <div className="text-xs text-gray-700 truncate flex-1" title={p.name}>{p.name || `file-${idx + 1}`}</div>
                        <button type="button" onClick={() => removeAuthFile(idx)} className="absolute top-1 right-1 bg-black/60 text-white rounded px-1 py-0.5 text-[10px] opacity-0 group-hover:opacity-100 transition" aria-label="Remove document">✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- Submit Button --- */}
            <div className="flex justify-end gap-3">
              <Link to="/publisher/dashboard" className="px-4 py-2 border rounded-lg">
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 ${loading && "opacity-50 cursor-not-allowed"}`}
              >
                {loading ? "Submitting…" : "Send for Verification"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default SellAntique;
