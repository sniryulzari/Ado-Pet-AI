import React, { useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../utils/toast";
import { UsersContext } from "../Context/Context-Users";
import { getUserInfo, updateUserInfo } from "../api/users";
import { FiCamera, FiUser, FiLock, FiPhone, FiMail, FiFileText } from "react-icons/fi";

const ProfileSettings = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    password: "",
    bio: "",
  });
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState("");
  const [imageFile, setImageFile]       = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const fileInputRef = useRef(null);
  const navigate     = useNavigate();
  const { setFirstName, setLastName, setProfileImage, firstName } = useContext(UsersContext);

  useEffect(() => {
    getUserInfo()
      .then((res) => {
        const { firstName, lastName, phoneNumber, email, bio, profileImage } = res.data;
        setForm({ firstName, lastName, phoneNumber, email, bio: bio || "", password: "" });
        setProfileImageUrl(profileImage || "");
      })
      .catch(() => toast.error("Failed to load profile."))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleImageClick = () => fileInputRef.current?.click();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (imageFile) {
        const formData = new FormData();
        formData.append("firstName",   form.firstName);
        formData.append("lastName",    form.lastName);
        formData.append("phoneNumber", form.phoneNumber);
        formData.append("email",       form.email);
        if (form.bio)      formData.append("bio",      form.bio);
        if (form.password) formData.append("password", form.password);
        formData.append("profileImage", imageFile);
        const res = await updateUserInfo(formData);
        if (res.data?.ok) {
          // Backend returns the Cloudinary URL directly — no second round-trip needed.
          const newImage = res.data.profileImage || "";
          setProfileImageUrl(newImage);
          setProfileImage(newImage);
          setImageFile(null);
          setImagePreview("");
        }
      } else {
        await updateUserInfo(form);
      }
      setFirstName(form.firstName);
      setLastName(form.lastName);
      toast.success("Profile saved!");
      setTimeout(() => navigate("/"), 1500);
    } catch {
      toast.error("Failed to save profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const displayImage = imagePreview || profileImageUrl;
  const initials     = form.firstName ? form.firstName[0].toUpperCase() : (firstName?.[0]?.toUpperCase() || "?");

  if (loading) {
    return (
      <div className="ps-page">
        <div className="ps-loading">Loading your profile…</div>
      </div>
    );
  }

  return (
    <div className="ps-page">
      <div className="ps-inner">
        <h1 className="ps-title">Profile Settings</h1>
        <p className="ps-subtitle">Manage your personal information and security settings</p>

        <form onSubmit={handleSubmit} className="ps-form">

          {/* ── Photo card ───────────────────────────── */}
          <div className="ps-card ps-card--photo">
            <div className="ps-card-header">
              <FiCamera className="ps-card-icon" />
              <span className="ps-card-title">Profile Photo</span>
            </div>
            <div className="ps-photo-body">
              <div className="ps-avatar-wrap" onClick={handleImageClick} title="Click to change photo">
                {displayImage ? (
                  <img src={displayImage} alt="Profile" className="ps-avatar-img" />
                ) : (
                  <span className="ps-avatar-initials">{initials}</span>
                )}
                <div className="ps-avatar-overlay">
                  <FiCamera size="1.4em" />
                  <span>Change</span>
                </div>
              </div>
              <div className="ps-photo-meta">
                <p className="ps-photo-hint">Click the avatar to upload a new photo</p>
                <p className="ps-photo-hint ps-photo-hint--small">JPG, PNG or WebP · max 5 MB</p>
                {imagePreview && (
                  <span className="ps-photo-preview-badge">Preview — save to apply</span>
                )}
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: "none" }}
              onChange={handleImageChange}
            />
          </div>

          {/* ── Personal info card ───────────────────── */}
          <div className="ps-card">
            <div className="ps-card-header">
              <FiUser className="ps-card-icon" />
              <span className="ps-card-title">Personal Information</span>
            </div>
            <div className="ps-card-body">
              <div className="ps-row">
                <div className="ps-field">
                  <label className="ps-label" htmlFor="ps-firstName">First Name</label>
                  <input
                    id="ps-firstName"
                    className="ps-input"
                    name="firstName"
                    type="text"
                    value={form.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ps-field">
                  <label className="ps-label" htmlFor="ps-lastName">Last Name</label>
                  <input
                    id="ps-lastName"
                    className="ps-input"
                    name="lastName"
                    type="text"
                    value={form.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="ps-row">
                <div className="ps-field">
                  <label className="ps-label" htmlFor="ps-email">
                    <FiMail className="ps-label-icon" /> Email
                  </label>
                  <input
                    id="ps-email"
                    className="ps-input"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="ps-field">
                  <label className="ps-label" htmlFor="ps-phone">
                    <FiPhone className="ps-label-icon" /> Phone Number
                  </label>
                  <input
                    id="ps-phone"
                    className="ps-input"
                    name="phoneNumber"
                    type="text"
                    value={form.phoneNumber}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="ps-field">
                <label className="ps-label" htmlFor="ps-bio">
                  <FiFileText className="ps-label-icon" /> Bio
                </label>
                <textarea
                  id="ps-bio"
                  className="ps-input ps-textarea"
                  name="bio"
                  rows={4}
                  placeholder="Tell us a little about yourself…"
                  value={form.bio}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* ── Security card ────────────────────────── */}
          <div className="ps-card">
            <div className="ps-card-header">
              <FiLock className="ps-card-icon" />
              <span className="ps-card-title">Security</span>
            </div>
            <div className="ps-card-body">
              <div className="ps-field ps-field--half">
                <label className="ps-label" htmlFor="ps-password">New Password</label>
                <input
                  id="ps-password"
                  className="ps-input"
                  name="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={form.password}
                  onChange={handleChange}
                />
                <span className="ps-field-hint">Minimum 6 characters</span>
              </div>
            </div>
          </div>

          {/* ── Save button ──────────────────────────── */}
          <div className="ps-actions">
            <button type="button" className="ps-btn ps-btn--cancel" onClick={() => navigate(-1)}>
              Cancel
            </button>
            <button type="submit" className="ps-btn ps-btn--save" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default ProfileSettings;
