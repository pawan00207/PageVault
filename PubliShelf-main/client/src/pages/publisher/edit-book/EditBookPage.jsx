import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getBook, updateBook } from "../../../services/publisher.services";
import { useForm } from "react-hook-form";

const genreOptions = ["Fiction", "Non-Fiction", "Mystery", "Science Fiction", "Romance", "Thriller", "Other"];

const EditBookPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({ mode: "onBlur" });

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const stateBook = location?.state?.book;

        const data = stateBook || (await getBook(id))?.data;
        if (!data) throw new Error();

        setBook(data);
        reset({
          title: data.title || "",
          author: data.author || "",
          genre: data.genre || "",
          price: data.price || data.basePrice || "",
          description: data.description || "",
          quantity: data.quantity ?? 0,
        });
        setImagePreview(data.image || "");

      } catch {
        toast.error("Failed to fetch book");
        navigate("/publisher/dashboard");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, location, navigate, reset]);

  const handleFileChange = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file) handleFileChange(file);
  }, []);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const onSubmit = async (data) => {
    try {
      setActionLoading(true);

      const payload = new FormData();
      payload.append("title", data.title.trim());
      payload.append("author", data.author.trim());
      payload.append("genre", data.genre);
      payload.append("price", Number(data.price));
      payload.append("description", data.description.trim());
      payload.append("quantity", Number(data.quantity));
      if (imageFile) payload.append("imageFile", imageFile);

      const res = await updateBook(id, payload);

      if (res?.success) {
        toast.success("Book updated successfully!");
        navigate("/publisher/dashboard");
      } else {
        toast.error(res.message || "Failed to update book");
      }
    } catch {
      toast.error("Update failed");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  const baseInput =
    "mt-1 px-2 py-2 block w-full shadow-sm hover:shadow-md focus:ring-2 focus:ring-purple-500 focus:outline-none rounded-lg border-gray-300";

  return (
    <div className="bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="rounded-xl bg-white shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-300">
            <h1 className="text-2xl font-bold">Edit Book</h1>
            <p className="text-gray-500 mt-1">Update the details of your book</p>
          </div>

          <form className="p-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label>Book Title</label>
                <input
                  {...register("title", {
                    required: "Title is required",
                    minLength: { value: 3, message: "Minimum 3 characters" },
                    // Allow letters, spaces, and common punctuation
                    pattern: { value: /^[A-Za-z\s.,:;!?'"()&/-]+$/, message: "Letters, spaces, and punctuation only" }
                  })}
                  className={`${baseInput} ${errors.title ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-xs">{errors.title?.message}</p>
              </div>

              <div>
                <label>Author</label>
                <input
                  {...register("author", {
                    required: "Author is required",
                    minLength: { value: 3, message: "Minimum 3 characters" },
                    pattern: { value: /^[A-Za-z\s]+$/, message: "Only alphabets allowed" },
                    validate: {
                      noEdgeSpaces: (v) => v.trim() === v || "No leading or trailing spaces",
                    }
                  })}
                  className={`${baseInput} ${errors.author ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-xs">{errors.author?.message}</p>
              </div>
            </div>

            <div>
              <label>Description</label>
              <textarea
                rows="4"
                {...register("description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Minimum 10 characters" }
                })}
                className={`${baseInput} ${errors.description ? "border-red-500" : ""}`}
              />
              <p className="text-red-500 text-xs">{errors.description?.message}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label>Genre</label>
                <select
                  {...register("genre", { required: "Genre is required" })}
                  className={`${baseInput} ${errors.genre ? "border-red-500" : ""}`}
                >
                  <option value="" hidden>Select</option>
                  {genreOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <p className="text-red-500 text-xs">{errors.genre?.message}</p>
              </div>

              <div>
                <label>Price ₹</label>
                <input
                  type="number"
                  {...register("price", {
                    required: "Price is required",
                    min: { value: 1, message: "Must be greater than 0" },
                    max: { value: 100000, message: "Max ₹100,000" }
                  })}
                  className={`${baseInput} ${errors.price ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-xs">{errors.price?.message}</p>
              </div>

              <div>
                <label>Quantity</label>
                <input
                  type="number"
                  {...register("quantity", {
                    required: "Quantity required",
                    min: { value: 0, message: "Cannot be negative" },
                    max: { value: 10000, message: "Max 10,000" }
                  })}
                  className={`${baseInput} ${errors.quantity ? "border-red-500" : ""}`}
                />
                <p className="text-red-500 text-xs">{errors.quantity?.message}</p>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Book Cover Image (Optional)</label>
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                className={`mt-2 rounded-lg border-2 border-dashed ${imageFile ? "border-gray-300 bg-gray-50" : "border-gray-300 bg-gray-50"} p-4`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-md bg-white border">
                    <i className="fas fa-image text-gray-500"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">Upload a clear cover image</p>
                    <p className="text-xs text-gray-500">JPG, PNG, WebP up to 10MB</p>
                  </div>
                  <label className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md cursor-pointer hover:bg-indigo-700">
                    Browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e.target.files?.[0])}
                      className="hidden"
                    />
                  </label>
                </div>

                {imagePreview && (
                  <div className="mt-3 relative inline-block group">
                    {/* Match auction card aspect and sizing (w-40 h-56) */}
                    <img src={imagePreview} alt="Cover Preview" className="w-40 h-56 object-cover rounded-lg shadow-md" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(""); }}
                      className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
                      aria-label="Remove cover image"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm font-medium">
                  Published Date:
                  <span className="ml-1 text-gray-600">
                    {new Date(book.publishedAt).toLocaleDateString()}
                  </span>
                </p>
              </div>

              <div className="flex gap-3">
                <Link to="/publisher/dashboard" className="px-4 py-2 border rounded-lg">
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg disabled:opacity-60"
                >
                  {actionLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default EditBookPage;
