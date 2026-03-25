import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import ProfileField from "../components/ProfileField";
import ProfileSectionCard from "../components/ProfileSectionCard";
import ProfilePreviewCard from "../components/ProfilePreviewCard";
import useEditProfilePage from "../hooks/useEditProfilePage";
import "../styles/edit-profile-page.css";

export default function EditProfilePage() {
    const {
        booting,
        role,
        isInstructor,
        isAdmin,
        roleMeta,
        form,
        errors,
        submitting,
        toast,
        setToast,
        avatarPreview,
        coverPreview,
        previewItems,
        handleChange,
        handleAvatarFileChange,
        handleCoverFileChange,
        handleSubmit,
        handleCancel,
    } = useEditProfilePage();

    if (booting) {
        return (
            <div className="edit-profile-page">
                <div className="edit-profile-page__container">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-profile-page">
            <div className="edit-profile-page__container">
                {toast.message ? (
                    <Toast
                        kind={toast.kind}
                        message={toast.message}
                        onClose={() =>
                            setToast({ message: "", kind: "success" })
                        }
                    />
                ) : null}

                <section className="rounded-[28px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <div
                                className={`inline-flex rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] ${roleMeta.heroClass}`}
                            >
                                Profile Settings
                            </div>
                            <h1 className="mt-3 text-[2rem] font-black tracking-tight text-slate-950">
                                Edit Profile
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">
                                {roleMeta.description}
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2.5 font-medium text-slate-700 transition hover:bg-slate-50"
                            >
                                Back to profile
                            </button>
                        </div>
                    </div>
                </section>

                <form
                    onSubmit={handleSubmit}
                    className="edit-profile-page__grid"
                >
                    <div className="space-y-6">
                        <ProfileSectionCard
                            title="Basic Information"
                            description="Core information shown on your profile."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <div className="md:col-span-2">
                                    <ProfileField
                                        label="Full name"
                                        error={errors.fullName}
                                    >
                                        <input
                                            name="fullName"
                                            value={form.fullName}
                                            onChange={handleChange}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                                        />
                                    </ProfileField>
                                </div>

                                <ProfileField
                                    label="Headline"
                                    hint={
                                        isAdmin
                                            ? "Example: Platform Administrator / Operations Lead"
                                            : isInstructor
                                              ? "Example: Frontend Developer Instructor"
                                              : "Example: Lifelong Learner / Future Developer"
                                    }
                                    error={errors.headline}
                                >
                                    <input
                                        name="headline"
                                        value={form.headline}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                                    />
                                </ProfileField>

                                <ProfileField
                                    label="Phone"
                                    error={errors.phone}
                                >
                                    <input
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                                    />
                                </ProfileField>

                                <div className="md:col-span-2">
                                    <ProfileField
                                        label="Bio"
                                        hint={`${form.bio.length}/500 characters`}
                                        error={errors.bio}
                                    >
                                        <textarea
                                            name="bio"
                                            value={form.bio}
                                            onChange={handleChange}
                                            rows={5}
                                            maxLength={500}
                                            className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                                        />
                                    </ProfileField>
                                </div>
                            </div>
                        </ProfileSectionCard>

                        <ProfileSectionCard
                            title="Profile Media"
                            description="Upload images directly from your device."
                        >
                            <div className="grid gap-5 md:grid-cols-2">
                                <ProfileField
                                    label="Avatar image"
                                    hint="Accepted: JPG, PNG, WEBP, GIF. Max 5MB."
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarFileChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                </ProfileField>

                                <ProfileField
                                    label="Cover image"
                                    hint="Accepted: JPG, PNG, WEBP, GIF. Max 5MB."
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleCoverFileChange}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition file:mr-4 file:rounded-xl file:border-0 file:bg-violet-50 file:px-4 file:py-2 file:font-semibold file:text-violet-700 hover:file:bg-violet-100"
                                    />
                                </ProfileField>
                            </div>
                        </ProfileSectionCard>

                        {isInstructor ? (
                            <ProfileSectionCard
                                title="Expertise"
                                description="One item per line. These will be shown as tags on your profile."
                            >
                                <ProfileField
                                    label="Expertise list"
                                    error={errors.expertiseText}
                                >
                                    <textarea
                                        name="expertiseText"
                                        value={form.expertiseText}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder={`React\nNode.js\nMongoDB\nSystem Design`}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                                    />
                                </ProfileField>
                            </ProfileSectionCard>
                        ) : !isAdmin ? (
                            <ProfileSectionCard
                                title="Learning Goals"
                                description="One goal per line. These will appear in your learner profile."
                            >
                                <ProfileField
                                    label="Learning goals list"
                                    error={errors.learningGoalsText}
                                >
                                    <textarea
                                        name="learningGoalsText"
                                        value={form.learningGoalsText}
                                        onChange={handleChange}
                                        rows={6}
                                        placeholder={`Complete my first full course\nPractice every week\nBuild real projects`}
                                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                                    />
                                </ProfileField>
                            </ProfileSectionCard>
                        ) : (
                            <ProfileSectionCard
                                title="Admin Identity"
                                description="Admin accounts do not use learner goals. Keep your profile concise and professional."
                            >
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                    Your admin profile is focused on identity,
                                    trust and clear platform ownership.
                                    Headline, bio, avatar and cover image are
                                    the most important fields here.
                                </div>
                            </ProfileSectionCard>
                        )}

                        <div className="flex flex-wrap gap-3">
                            <Button
                                type="submit"
                                loading={submitting}
                                disabled={submitting}
                            >
                                {submitting ? "Saving..." : "Save changes"}
                            </Button>

                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <ProfilePreviewCard
                            coverPreview={coverPreview}
                            avatarPreview={avatarPreview}
                            form={form}
                            role={role}
                            roleMeta={roleMeta}
                            isInstructor={isInstructor}
                            isAdmin={isAdmin}
                            previewItems={previewItems}
                        />
                    </div>
                </form>
            </div>
        </div>
    );
}
