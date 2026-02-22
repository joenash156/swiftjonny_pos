import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AxiosError } from "axios";
import { useTheme } from "../../contexts/ThemeContext";
import { useAuth } from "../../contexts/AuthContext";
import { userService, type UpdateProfilePayload } from "../../services/userService";
import { formatDate } from "../../utils/formatDate";
import { ConfirmDialog, type ConfirmDialogConfig } from "../../components/shared/ConfirmDialog";
import { SectionCard } from "../../components/settings/SectionCard";
import { FieldRow } from "../../components/settings/FieldRow";
import { PwField } from "../../components/settings/PwField";

type Tab = "profile" | "security";

interface ConfirmConfig extends ConfirmDialogConfig {
  onConfirm: () => Promise<void>;
}


function Settings() {
  const { theme } = useTheme();
  const { user, logout, refreshUser } = useAuth();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [confirm, setConfirm] = useState<ConfirmConfig | null>(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Profile form state
  const [editing, setEditing] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [form, setForm] = useState({
    firstname: user?.firstname ?? "",
    lastname: user?.lastname ?? "",
    othername: user?.othername ?? "",
    phone: user?.phone ?? "",
    other_phone: user?.other_phone ?? "",
  });

  // Sync form when user data changes (e.g. after refresh)
  useEffect(() => {
    if (user && !editing) {
      setForm({
        firstname: user.firstname ?? "",
        lastname: user.lastname ?? "",
        othername: user.othername ?? "",
        phone: user.phone ?? "",
        other_phone: user.other_phone ?? "",
      });
    }
  }, [user, editing]);

  // Avatar state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Security form state
  const [pwForm, setPwForm] = useState({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });
  const [showPw, setShowPw] = useState({ current: false, newPw: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Delete account password
  const [deletePassword, setDeletePassword] = useState("");
  const [showDeletePw, setShowDeletePw] = useState(false);

  // Toast helper
  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // Confirm helper
  const openConfirm = (config: ConfirmConfig) => setConfirm(config);
  const closeConfirm = () => {
    if (!confirmLoading) setConfirm(null);
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      await confirm.onConfirm();
    } finally {
      setConfirmLoading(false);
      setConfirm(null);
    }
  };

  // Profile save
  const startSaveProfile = () => {
    openConfirm({
      title: "Save Profile Changes",
      message: "Are you sure you want to update your profile information?",
      confirmLabel: "Save Changes",
      variant: "success",
      iconClass: "fa-solid fa-user-pen",
      onConfirm: async () => {
        setProfileLoading(true);
        try {
          const payload: UpdateProfilePayload = {};
          if (form.firstname) payload.firstname = form.firstname;
          if (form.lastname) payload.lastname = form.lastname;
          if (form.othername !== undefined) payload.othername = form.othername;
          if (form.phone !== undefined) payload.phone = form.phone;
          if (form.other_phone !== undefined) payload.other_phone = form.other_phone;

          await userService.updateProfile(payload);
          await refreshUser();
          setEditing(false);
          showToast("Profile updated successfully.", true);
        } catch (err: unknown) {
          const msg =
            err instanceof AxiosError
              ? err.response?.data?.error ?? "Failed to update profile."
              : "Failed to update profile.";
          showToast(msg, false);
        } finally {
          setProfileLoading(false);
        }
      },
    });
  };

  // Avatar upload
  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    openConfirm({
      title: "Update Profile Photo",
      message: "Upload this new photo as your profile picture?",
      confirmLabel: "Upload",
      variant: "success",
      iconClass: "fa-solid fa-image",
      onConfirm: async () => {
        setAvatarLoading(true);
        try {
          await userService.updateAvatar(file);
          await refreshUser();
          showToast("Profile photo updated.", true);
        } catch (err: unknown) {
          const msg =
            err instanceof AxiosError
              ? err.response?.data?.error ?? "Failed to upload photo."
              : "Failed to upload photo.";
          showToast(msg, false);
        } finally {
          setAvatarLoading(false);
          setPreviewUrl(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        }
      },
    });
  };

  const handleRemoveAvatar = () => {
    openConfirm({
      title: "Remove Profile Photo",
      message: "Remove your current profile photo? Your initials will be shown instead.",
      confirmLabel: "Remove",
      variant: "danger",
      iconClass: "fa-solid fa-trash-can",
      onConfirm: async () => {
        setAvatarLoading(true);
        try {
          await userService.removeAvatar();
          await refreshUser();
          showToast("Profile photo removed.", true);
        } catch (err: unknown) {
          const msg =
            err instanceof AxiosError
              ? err.response?.data?.error ?? "Failed to remove photo."
              : "Failed to remove photo.";
          showToast(msg, false);
        } finally {
          setAvatarLoading(false);
        }
      },
    });
  };

  // Change password
  const handleChangePassword = () => {
    if (!pwForm.current_password || !pwForm.new_password || !pwForm.confirm_new_password) {
      showToast("All password fields are required.", false);
      return;
    }
    if (pwForm.new_password !== pwForm.confirm_new_password) {
      showToast("New passwords do not match.", false);
      return;
    }
    if (pwForm.new_password.length < 8) {
      showToast("New password must be at least 8 characters.", false);
      return;
    }

    openConfirm({
      title: "Change Password",
      message: (
        <span>
          Are you sure you want to change your password?{" "}
          <span className={`font-semibold ${isDark ? "text-amber-400" : "text-amber-600"}`}>
            You will be logged out immediately after.
          </span>
        </span>
      ),
      confirmLabel: "Change & Log Out",
      variant: "warning",
      iconClass: "fa-solid fa-lock",
      onConfirm: async () => {
        setPwLoading(true);
        try {
          await userService.changePassword({
            current_password: pwForm.current_password,
            new_password: pwForm.new_password,
          });
          showToast("Password changed. Logging you out…", true);
          setTimeout(() => logout(), 1200);
        } catch (err: unknown) {
          const msg =
            err instanceof AxiosError
              ? err.response?.data?.error ?? "Failed to change password."
              : "Failed to change password.";
          showToast(msg, false);
        } finally {
          setPwLoading(false);
        }
      },
    });
  };

  // Delete account
  const handleDeleteAccount = () => {
    if (!deletePassword) {
      showToast("Please enter your password to confirm.", false);
      return;
    }

    openConfirm({
      title: "Delete Account",
      message: (
        <span>
          This action is{" "}
          <span className={`font-semibold ${isDark ? "text-red-400" : "text-red-600"}`}>
            permanent and irreversible.
          </span>{" "}
          Your account, profile data, and all associated records will be deleted immediately.
        </span>
      ),
      confirmLabel: "Delete My Account",
      variant: "danger",
      iconClass: "fa-solid fa-triangle-exclamation",
      onConfirm: async () => {
        try {
          await userService.deleteAccount(deletePassword);
          showToast("Account deleted. Goodbye.", true);
          setTimeout(() => logout(), 1200);
        } catch (err: unknown) {
          const msg =
            err instanceof AxiosError
              ? err.response?.data?.error ?? "Failed to delete account."
              : "Failed to delete account.";
          showToast(msg, false);
        }
      },
    });
  };

  // Computed
  const initials = `${user?.firstname?.[0] ?? ""}${user?.lastname?.[0] ?? ""}`.toUpperCase();
  // avatar_url already contains the full URL as returned by the backend
  const displayAvatarSrc = user?.avatar_url || previewUrl;

  // ─── Render ────────────────────────────────────────────────────────────

  return (
    <div
      className={`min-h-screen p-5 md:p-7 ${isDark
        ? "bg-linear-to-br from-slate-950 via-slate-900 to-slate-900"
        : "bg-linear-to-br from-teal-50/40 via-slate-50 to-purple-100/80"
        }`}
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className={`fixed top-5 right-5 z-70 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium shadow-lg ${toast.ok
              ? isDark
                ? "bg-teal-900 text-teal-300 border border-teal-700"
                : "bg-teal-50 text-teal-700 border border-teal-200"
              : isDark
                ? "bg-red-900/50 text-red-300 border border-red-700"
                : "bg-red-50 text-red-600 border border-red-200"
              }`}
          >
            <i className={`fa-solid ${toast.ok ? "fa-check" : "fa-xmark"} text-xs`} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page header */}
      <div className="mb-6">
        <h1 className={`text-2xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
          Settings
        </h1>
        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
          Manage your profile, security and account preferences.
        </p>
      </div>

      {/* Tab bar */}
      <div
        className={`inline-flex rounded-xl border p-1 gap-1 mb-7 ${isDark ? "bg-slate-900/70 border-slate-800" : "bg-white border-slate-200"
          }`}
      >
        {(
          [
            { key: "profile", label: "Profile", icon: "fa-solid fa-user" },
            { key: "security", label: "Security", icon: "fa-solid fa-shield-halved" },
          ] as { key: Tab; label: string; icon: string }[]
        ).map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key
              ? isDark
                ? "bg-teal-600 text-white"
                : "bg-teal-600 text-white"
              : isDark
                ? "text-slate-400 hover:text-white"
                : "text-slate-500 hover:text-slate-800"
              }`}
          >
            <i className={`${icon} text-xs`} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Profile Tab ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait" initial={false}>
        {activeTab === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-5 max-w-2xl"
          >
            {/* Avatar card */}
            <SectionCard title="Profile Photo" isDark={isDark} description="Upload a photo to personalize your account.">
              <div className="flex items-center gap-5">
                {/* Avatar circle */}
                <div className="relative shrink-0">
                  <div className="w-18 h-18 rounded-full overflow-hidden bg-teal-600 flex items-center justify-center text-white text-xl font-bold select-none"
                    style={{ width: 72, height: 72 }}>
                    {displayAvatarSrc ? (
                      <img
                        src={displayAvatarSrc!}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      initials
                    )}
                  </div>
                  {avatarLoading && (
                    <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                      <i className="fa-solid fa-circle-notch animate-spin text-white text-sm" />
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <p className={`text-sm font-semibold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {user?.firstname} {user?.lastname}
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    JPG, PNG or JPEG — max 4 MB
                  </p>
                  <div className="flex gap-2 mt-1">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                      className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${isDark
                        ? "border-teal-500/30 text-teal-400 hover:bg-teal-500/10"
                        : "border-teal-200 text-teal-700 hover:bg-teal-50"
                        }`}
                    >
                      <i className="fa-solid fa-arrow-up-from-bracket text-[10px]" />
                      Upload
                    </button>
                    {user?.avatar_url && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={avatarLoading}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${isDark
                          ? "border-slate-700 text-slate-400 hover:bg-slate-800"
                          : "border-slate-200 text-slate-500 hover:bg-slate-50"
                          }`}
                      >
                        <i className="fa-solid fa-trash-can text-[10px]" />
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Personal info card */}
            <SectionCard
              title="Personal Information"
              isDark={isDark}
              description="Update your name, phone and other details."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow
                    label="First Name"
                    value={form.firstname}
                    placeholder="Enter first name"
                    editing={editing}
                    isDark={isDark}
                    onChange={(v) => setForm((p) => ({ ...p, firstname: v }))}
                  />
                  <FieldRow
                    label="Last Name"
                    value={form.lastname}
                    placeholder="Enter last name"
                    editing={editing}
                    isDark={isDark}
                    onChange={(v) => setForm((p) => ({ ...p, lastname: v }))}
                  />
                </div>
                <FieldRow
                  label="Other Name"
                  value={form.othername}
                  placeholder="Middle name (optional)"
                  editing={editing}
                  isDark={isDark}
                  onChange={(v) => setForm((p) => ({ ...p, othername: v }))}
                />
                <FieldRow
                  label="Email Address"
                  value={user?.email ?? ""}
                  editing={false}
                  isDark={isDark}
                  readOnly
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FieldRow
                    label="Phone Number"
                    value={form.phone}
                    placeholder="Primary phone"
                    editing={editing}
                    isDark={isDark}
                    type="tel"
                    onChange={(v) => setForm((p) => ({ ...p, phone: v }))}
                  />
                  <FieldRow
                    label="Other Phone"
                    value={form.other_phone}
                    placeholder="Secondary phone"
                    editing={editing}
                    isDark={isDark}
                    type="tel"
                    onChange={(v) => setForm((p) => ({ ...p, other_phone: v }))}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 flex items-center gap-3">
                {editing ? (
                  <>
                    <button
                      onClick={startSaveProfile}
                      disabled={profileLoading}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
                    >
                      {profileLoading ? (
                        <i className="fa-solid fa-circle-notch animate-spin" />
                      ) : (
                        <i className="fa-solid fa-check text-xs" />
                      )}
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditing(false);
                        // Reset form to current user values
                        setForm({
                          firstname: user?.firstname ?? "",
                          lastname: user?.lastname ?? "",
                          othername: user?.othername ?? "",
                          phone: user?.phone ?? "",
                          other_phone: user?.other_phone ?? "",
                        });
                      }}
                      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                        ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditing(true)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                      }`}
                  >
                    <i className="fa-solid fa-pen text-xs" />
                    Edit Profile
                  </button>
                )}
              </div>
            </SectionCard>

            {/* Account info (read-only) */}
            <SectionCard title="Account Information" isDark={isDark}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                {[
                  { label: "Role", value: user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "—" },
                  { label: "Account Status", value: user?.is_approved ? "Approved" : "Pending" },
                  { label: "Email Verified", value: user?.is_email_verified ? "Yes" : "No" },
                  { label: "Profile Complete", value: user?.is_profile_complete ? "Yes" : "Not yet" },
                  { label: "Member Since", value: formatDate(user?.created_at) },
                  { label: "Last Login", value: formatDate(user?.last_login_at) },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className={`text-[11px] font-semibold uppercase tracking-wider mb-0.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                      {label}
                    </p>
                    <p className={`${isDark ? "text-slate-300" : "text-slate-700"}`}>{value}</p>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* ── Security Tab ─────────────────────────────────────────────────── */}
        {activeTab === "security" && (
          <motion.div
            key="security"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="space-y-5 max-w-2xl"
          >
            {/* Change password */}
            <SectionCard
              title="Change Password"
              isDark={isDark}
              description="Use a strong password you don't use elsewhere."
            >
              {/* Warning banner */}
              <div
                className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-5 text-sm ${isDark
                  ? "bg-amber-500/8 border border-amber-500/20 text-amber-300"
                  : "bg-amber-50 border border-amber-200 text-amber-700"
                  }`}
              >
                <i className="fa-solid fa-triangle-exclamation mt-0.5 shrink-0" />
                <span>
                  Changing your password will immediately log you out of all sessions.
                  You will need to log in again with your new password.
                </span>
              </div>

              <div className="space-y-4">
                <PwField
                  label="Current Password"
                  value={pwForm.current_password}
                  placeholder="Enter current password"
                  isDark={isDark}
                  show={showPw.current}
                  onToggleShow={() => setShowPw((p) => ({ ...p, current: !p.current }))}
                  onChange={(v) => setPwForm((p) => ({ ...p, current_password: v }))}
                />
                <PwField
                  label="New Password"
                  value={pwForm.new_password}
                  placeholder="Minimum 8 characters"
                  isDark={isDark}
                  show={showPw.newPw}
                  onToggleShow={() => setShowPw((p) => ({ ...p, newPw: !p.newPw }))}
                  onChange={(v) => setPwForm((p) => ({ ...p, new_password: v }))}
                />
                <PwField
                  label="Confirm New Password"
                  value={pwForm.confirm_new_password}
                  placeholder="Repeat new password"
                  isDark={isDark}
                  show={showPw.confirm}
                  onToggleShow={() => setShowPw((p) => ({ ...p, confirm: !p.confirm }))}
                  onChange={(v) => setPwForm((p) => ({ ...p, confirm_new_password: v }))}
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={pwLoading}
                className="mt-5 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white transition-colors disabled:opacity-60"
              >
                {pwLoading ? (
                  <i className="fa-solid fa-circle-notch animate-spin" />
                ) : (
                  <i className="fa-solid fa-lock text-xs" />
                )}
                Update Password
              </button>
            </SectionCard>

            {/* Active sessions note */}
            <SectionCard
              title="Active Sessions"
              isDark={isDark}
              description="Your login sessions and access tokens."
            >
              <div
                className={`flex items-center gap-4 rounded-xl p-4 ${isDark ? "bg-slate-800/50" : "bg-slate-50"
                  }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isDark ? "bg-teal-500/10" : "bg-teal-50"
                    }`}
                >
                  <i className="fa-solid fa-circle-check text-teal-500" />
                </div>
                <div>
                  <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    Current Session
                  </p>
                  <p className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                    Last login: {formatDate(user?.last_login_at)} · Active now
                  </p>
                </div>
              </div>
              <p className={`text-xs mt-3 ${isDark ? "text-slate-600" : "text-slate-400"}`}>
                To invalidate all other sessions, change your password. Sessions expire automatically after 4 days of inactivity.
              </p>
            </SectionCard>

            {/* Danger zone */}
            <div
              className={`rounded-2xl border p-6 ${isDark ? "bg-red-500/5 border-red-500/20" : "bg-red-50/40 border-red-200"
                }`}
            >
              <div className="mb-5">
                <h2 className={`text-sm font-semibold ${isDark ? "text-red-400" : "text-red-700"}`}>
                  Danger Zone
                </h2>
                <p className={`text-xs mt-0.5 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  Irreversible actions. Proceed with caution.
                </p>
              </div>

              <div
                className={`rounded-xl border p-5 ${isDark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200"
                  }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <p className={`text-sm font-semibold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                      Delete Account
                    </p>
                    <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Permanently delete your account if there is no associated data (eg. sales, etc.). This cannot be undone.
                    </p>

                    {/* Password confirmation input */}
                    <div className="mt-4 relative max-w-xs">
                      <input
                        type={showDeletePw ? "text" : "password"}
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        placeholder="Enter your password to confirm"
                        autoComplete="current-password"
                        className={`w-full rounded-xl px-3.5 py-2.5 pr-10 text-sm border outline-none transition-all ${isDark
                          ? "bg-slate-800 border-slate-600 text-white placeholder-slate-600 focus:border-red-500"
                          : "bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-red-500"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDeletePw((p) => !p)}
                        className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${isDark ? "text-slate-500" : "text-slate-400"
                          }`}
                        tabIndex={-1}
                      >
                        <i className={`fa-solid ${showDeletePw ? "fa-eye-slash" : "fa-eye"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleDeleteAccount}
                  className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${isDark
                    ? "border-red-500/30 text-red-400 hover:bg-red-500/10"
                    : "border-red-200 text-red-600 hover:bg-red-50"
                    }`}
                >
                  <i className="fa-solid fa-triangle-exclamation text-xs" />
                  Delete My Account
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm modal */}
      <AnimatePresence>
        {confirm && (
          <ConfirmDialog
            key="settings-confirm"
            isDark={isDark}
            config={confirm}
            onCancel={closeConfirm}
            onConfirm={handleConfirm}
            loading={confirmLoading}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default Settings;
