import { useState } from "react";

const PublicFeedback = () => {
  const [form, setForm] = useState({ description: "", category: "", location: "" });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  const categories = ["Water Supply", "Roads", "Electricity", "Healthcare", "Education", "Sanitation", "Security", "Public Transport"];

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("description", form.description);
      formData.append("category", form.category);
      formData.append("location", form.location);
      if (image) formData.append("image", image);

      const res = await fetch("http://localhost:5000/api/feedback", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(data.data);
        setForm({ description: "", category: "", location: "" });
        setImage(null);
        setImagePreview(null);
      } else {
        setError(data.errors?.[0]?.msg || data.message || "Submission failed");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🗳️ Digital Democracy</h1>
          <p style={styles.subtitle}>Submit your feedback to your constituency representative</p>
        </div>

        {success && (
          <div style={styles.success}>
            <div style={styles.successIcon}>✅</div>
            <div style={styles.successContent}>
              <div style={styles.successTitle}>Feedback Submitted Successfully!</div>
              <div style={styles.successMeta}>Sentiment detected: <strong>{success.sentiment}</strong></div>
              <div style={styles.successMeta}>Topic classified as: <strong>{success.topic}</strong></div>
              {success.image_url && (
                <div style={styles.successMeta}>Image uploaded ✅</div>
              )}
              <button onClick={() => setSuccess(null)} style={styles.submitAnother}>
                Submit Another
              </button>
            </div>
          </div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} style={styles.form}>
            {error && <div style={styles.error}>{error}</div>}

            <div style={styles.inputGroup}>
              <label style={styles.label}>Your Feedback / Complaint</label>
              <textarea
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Describe your issue or feedback in detail..."
                style={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div style={styles.row}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  style={styles.select}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>Location / Area</label>
                <input
                  value={form.location}
                  onChange={e => setForm({ ...form, location: e.target.value })}
                  placeholder="e.g. Sector 5, Faridabad"
                  style={styles.input}
                  required
                />
              </div>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Attach Image (Optional)</label>
              {!imagePreview ? (
                <label style={styles.uploadArea}>
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageChange}
                    style={{ display: "none" }}
                  />
                  <div style={styles.uploadIcon}>📷</div>
                  <div style={styles.uploadText}>Click to upload an image</div>
                  <div style={styles.uploadHint}>JPEG, JPG, PNG, WEBP (max 5MB)</div>
                </label>
              ) : (
                <div style={styles.previewContainer}>
                  <img src={imagePreview} alt="Preview" style={styles.preview} />
                  <button type="button" onClick={removeImage} style={styles.removeImg}>
                    ✕ Remove Image
                  </button>
                </div>
              )}
            </div>

            <button
              type="submit"
              style={submitting ? styles.btnDisabled : styles.btn}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit Feedback"}
            </button>
          </form>
        )}

        <div style={styles.footer}>
          <a href="/login" style={styles.adminLink}>Admin Login →</a>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: { minHeight: "100vh", background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" },
  card: { background: "white", borderRadius: "16px", padding: "40px", width: "100%", maxWidth: "600px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" },
  header: { textAlign: "center", marginBottom: "30px" },
  title: { fontSize: "28px", fontWeight: "800", color: "#1a1a2e", margin: "0 0 8px 0" },
  subtitle: { fontSize: "14px", color: "#666", margin: 0 },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  error: { background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", padding: "12px", borderRadius: "8px", fontSize: "14px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "6px", flex: 1 },
  label: { fontSize: "14px", fontWeight: "600", color: "#333" },
  textarea: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px", resize: "vertical" },
  select: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  input: { padding: "12px", borderRadius: "8px", border: "1px solid #ddd", fontSize: "14px" },
  row: { display: "flex", gap: "16px" },
  uploadArea: { border: "2px dashed #ddd", borderRadius: "12px", padding: "30px", textAlign: "center", cursor: "pointer", display: "block", transition: "border 0.2s" },
  uploadIcon: { fontSize: "36px", marginBottom: "8px" },
  uploadText: { fontSize: "14px", fontWeight: "600", color: "#444", marginBottom: "4px" },
  uploadHint: { fontSize: "12px", color: "#888" },
  previewContainer: { position: "relative", display: "inline-block", width: "100%" },
  preview: { width: "100%", maxHeight: "200px", objectFit: "cover", borderRadius: "8px", border: "1px solid #ddd" },
  removeImg: { position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", color: "white", border: "none", borderRadius: "6px", padding: "6px 12px", cursor: "pointer", fontSize: "12px", fontWeight: "600" },
  btn: { padding: "14px", background: "linear-gradient(135deg, #0f3460, #1a1a2e)", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "pointer" },
  btnDisabled: { padding: "14px", background: "#ccc", color: "white", border: "none", borderRadius: "8px", fontSize: "16px", fontWeight: "700", cursor: "not-allowed" },
  success: { background: "#f0fdf4", border: "1px solid #22c55e", borderRadius: "12px", padding: "20px", display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "20px" },
  successIcon: { fontSize: "32px" },
  successContent: { flex: 1 },
  successTitle: { fontSize: "16px", fontWeight: "700", color: "#15803d", marginBottom: "8px" },
  successMeta: { fontSize: "13px", color: "#166534", marginBottom: "4px" },
  submitAnother: { marginTop: "12px", padding: "8px 16px", background: "#22c55e", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" },
  footer: { textAlign: "center", marginTop: "24px" },
  adminLink: { fontSize: "13px", color: "#0f3460", fontWeight: "600" }
};

export default PublicFeedback;