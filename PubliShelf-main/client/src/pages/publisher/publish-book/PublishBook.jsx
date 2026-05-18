import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { publishBook } from "../../../services/publisher.services.js";

import {
  validateAlphaField,
  validateDescription,
  validatePrice,
  validateQuantity,
  validateBookImage
} from "./publishBookValidation.js";

const PublishBook = () => {
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, setError, clearErrors, formState: { errors, touchedFields, isSubmitted } } = useForm({
    mode: "onBlur",
    reValidateMode: "onChange",
    defaultValues: {
      title: "",
      author: "",
      description: "",
      genre: "",
      price: "",
      quantity: "",
      imageFile: null,
    }
  });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setValue("imageFile", file || null, { shouldValidate: true });
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImagePreview(null);
    }
    const imgErr = validateBookImage(file);
    if (imgErr) setError("imageFile", { message: imgErr }); else clearErrors("imageFile");
  };
  const onSubmit = async (data) => {
    if (loading) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", data.title.trim());
      fd.append("author", data.author.trim());
      fd.append("description", data.description.trim());
      fd.append("genre", data.genre);
      fd.append("price", data.price);
      fd.append("quantity", data.quantity);
      fd.append("imageFile", data.imageFile);
      await publishBook(fd);
      toast.success("Book published successfully!");
      navigate("/publisher/dashboard");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to publish book.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Publish New Book</h1>
            <p className="text-gray-500 mt-1">Fill in the details to list your book for sale</p>
          </div>

          {/* FORM */}
          <form className="p-6 space-y-6 animate-fade-in" onSubmit={handleSubmit(onSubmit)}>
            {/* Title + Author */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Book Title</label>
                <input
                  type="text"
                  {...register("title", { validate: (v) => {
                    const trimmed = (v || "").trim();
                    if (!trimmed) return "Title is required.";
                    if (trimmed.length < 2) return "Title must be at least 2 characters.";
                    // Allow letters, numbers, spaces, and common punctuation
                    const allowed = /^[A-Za-z0-9\s.,:;"'!?&()\-–—]+$/;
                    if (!allowed.test(trimmed)) return "Title contains invalid characters.";
                    return true;
                  } })}
                  aria-invalid={errors.title ? "true" : "false"}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.title && (touchedFields.title || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Author</label>
                <input
                  type="text"
                  {...register("author", { validate: (v) => validateAlphaField(v, "Author", 2) || true })}
                  aria-invalid={errors.author ? "true" : "false"}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.author && (touchedFields.author || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.author.message}</p>}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-700">Description</label>
              <textarea
                rows="4"
                {...register("description", { validate: (v) => validateDescription(v) || true })}
                aria-invalid={errors.description ? "true" : "false"}
                className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
              />
              {(errors.description && (touchedFields.description || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
            </div>

            {/* Genre + Price + Quantity */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Genre</label>
                <select
                  {...register("genre", { validate: (v) => (v?.trim() ? true : "Genre is required.") })}
                  aria-invalid={errors.genre ? "true" : "false"}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
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
                <label className="text-sm font-medium text-gray-700">Price (₹)</label>
                <input
                  type="number"
                  {...register("price", { validate: (v) => validatePrice(v) || true })}
                  aria-invalid={errors.price ? "true" : "false"}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.price && (touchedFields.price || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  {...register("quantity", { validate: (v) => validateQuantity(v) || true })}
                  aria-invalid={errors.quantity ? "true" : "false"}
                  className={`mt-1 w-full px-3 py-2 rounded-lg bg-white shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:border-transparent transition`}
                />
                {(errors.quantity && (touchedFields.quantity || isSubmitted)) && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="text-sm font-medium text-gray-700">Book Cover Image</label>
              <div className={`mt-2 rounded-lg bg-white p-4 shadow-sm hover:shadow-md transition ${errors.imageFile ? "ring-2 ring-red-400" : ""}`}> 
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-gray-100">
                    <i className="fas fa-image text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload a clear cover image</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WebP up to 10MB</p>
                  </div>
                  <label className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700">
                    Browse
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                {errors.imageFile && <p className="text-red-500 text-xs mt-2">{errors.imageFile.message}</p>}
                {imagePreview && (
                  <div className="mt-3 relative inline-block">
                    {/* Enforce same aspect as auction cards for consistency */}
                    <img src={imagePreview} alt="Cover Preview" className="w-40 h-56 object-cover rounded-lg shadow-md" />
                  </div>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <Link to="/publisher/dashboard" className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-100 transition">Cancel</Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {loading ? "Publishing..." : "Publish Book"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PublishBook;
