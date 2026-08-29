import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Camera, X, Check, Upload, User as UserIcon, Sparkles, MapPin, Briefcase, Phone, Mail, Image as ImageIcon } from "lucide-react";
import { useApp } from "../context/AppContext";
import { User } from "../types";
import poojaAvatar from "../assets/images/pooja_avatar.jpg";

interface EditPersonaModalProps {
  isOpen: boolean;
  onClose: () => void;
  personaUser?: User;
}

export const EditPersonaModal: React.FC<EditPersonaModalProps> = ({
  isOpen,
  onClose,
  personaUser,
}) => {
  const { state, currentUser, updateUserProfile } = useApp();
  const targetUser = personaUser || currentUser;
  const isCoach = targetUser.role === "coach" || targetUser.id === "user_coach_pooja";

  const [name, setName] = useState(targetUser.name);
  const [bio, setBio] = useState(targetUser.bio || "");
  const [specialty, setSpecialty] = useState(targetUser.specialty || "Somatic Grounding & Stress Resilience");
  const [location, setLocation] = useState(targetUser.location || "Bangalore, India");
  const [phone, setPhone] = useState(targetUser.phone || "+91 98450 12345");
  const [photo, setPhoto] = useState(targetUser.photo || (isCoach ? poojaAvatar : ""));
  const [savedSuccess, setSavedSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever modal opens or targetUser changes
  useEffect(() => {
    if (isOpen) {
      setName(targetUser.name || "");
      setBio(targetUser.bio || "");
      setSpecialty(targetUser.specialty || (isCoach ? "Somatic Grounding & Stress Resilience" : ""));
      setLocation(targetUser.location || "Bangalore, India");
      setPhone(targetUser.phone || "+91 98450 12345");
      setPhoto(targetUser.photo || (isCoach ? poojaAvatar : ""));
      setSavedSuccess(false);
    }
  }, [isOpen, targetUser, isCoach]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetToDefaultPooja = () => {
    setPhoto(poojaAvatar);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(targetUser.id, {
      name: name.trim(),
      bio: bio.trim(),
      specialty: isCoach ? specialty.trim() : undefined,
      location: location.trim(),
      phone: phone.trim(),
      photo,
    });
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-[#1E1A17] text-stone-900 dark:text-stone-100 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden my-6"
          id="edit-persona-modal"
        >
          {/* Header */}
          <div className="p-6 bg-stone-50 dark:bg-stone-900/90 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 dark:bg-emerald-600 text-white flex items-center justify-center shadow-md shrink-0">
                <UserIcon className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-stone-900 dark:text-stone-100">
                  {isCoach ? "Edit Coach Persona Profile" : "Edit Personal Profile"}
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 font-medium">
                  {isCoach
                    ? "Update Coach Pooja's portrait, bio, specialty, and contact details"
                    : `Update your name, bio, and profile picture on HEAVEN`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
              id="close-edit-persona-btn"
              aria-label="Close edit profile modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave}>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Photo Upload & Preview */}
              <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-stone-50 dark:bg-stone-900/70 border border-stone-200 dark:border-stone-800">
                <div className="relative group shrink-0">
                  <img
                    src={photo || targetUser.photo}
                    alt={name}
                    referrerPolicy="no-referrer"
                    className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-600/60 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    title="Change photo"
                    id="change-avatar-overlay-btn"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="text-sm font-bold text-stone-900 dark:text-stone-100">
                    Profile Portrait
                  </div>
                  <p className="text-xs text-stone-600 dark:text-stone-400">
                    Choose a photo or upload an image file from your device.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
                      id="upload-custom-photo-btn"
                    >
                      <Upload className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                      <span className="text-white">Upload Photo</span>
                    </button>
                    {isCoach && (
                      <button
                        type="button"
                        onClick={handleResetToDefaultPooja}
                        className="px-3.5 py-2 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors cursor-pointer"
                        id="reset-pooja-avatar-btn"
                      >
                        Reset to Pooja Portrait
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {isCoach ? "Coach Full Name & Title" : "Display Name"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="e.g. Pooja V. or Ananya Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-2xs"
                  id="edit-persona-name-input"
                />
              </div>

              {/* Specialty (Coach only) */}
              {isCoach && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                      <span>Coaching Specialty & Core Focus</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    placeholder="e.g. Somatic Grounding & Stress Resilience"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-2xs"
                    id="edit-persona-specialty-input"
                  />
                </div>
              )}

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                  {isCoach ? "Coach Bio & Philosophy" : "About You / Daily Intention"}
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-2xs resize-none"
                  placeholder={
                    isCoach
                      ? "Share your coaching philosophy, background, and approach..."
                      : "Share what brings you to HEAVEN and your personal grounding practice..."
                  }
                  id="edit-persona-bio-input"
                />
              </div>

              {/* Location & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                      <span>City / Location</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, India"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-2xs"
                    id="edit-persona-location-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-500" />
                      <span>Contact / Phone</span>
                    </span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98450 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 shadow-2xs"
                    id="edit-persona-phone-input"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 bg-stone-50 dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-stone-700 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                id="save-persona-btn"
              >
                {savedSuccess ? <Check className="w-4 h-4 text-white stroke-[3]" /> : null}
                <span className="text-white font-bold">{savedSuccess ? "Saved!" : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

