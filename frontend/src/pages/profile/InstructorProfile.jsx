import { useState, useContext, useEffect } from "react";
import { UserContext } from "../../features/user/state/userContext";

const InstructorProfile = ({ profile }) => {
    const { updateInstructorProfile, changePassword, deactivateAccount } =
        useContext(UserContext);

    const [editing, setEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const [form, setForm] = useState({
        name: "",
        bio: "",
        expertise: "",
    });

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name || "",
                bio: profile.bio || "",
                expertise: profile.expertise?.join(", ") || "",
            });
        }
    }, [profile]);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handlePasswordInput = (e) => {
        setPasswordForm({
            ...passwordForm,
            [e.target.name]: e.target.value,
        });
    };

    const handleUpdate = async () => {
        const payload = {
            ...form,
            expertise: form.expertise.split(",").map((e) => e.trim()),
        };

        await updateInstructorProfile(payload);
        alert("Profile updated");
        setEditing(false);
    };

    const handleChangePassword = async () => {
        await changePassword(passwordForm);
        alert("Password changed");

        setPasswordForm({
            oldPassword: "",
            newPassword: "",
        });

        setShowPassword(false);
    };

    const handleDeactivate = async () => {
        if (window.confirm("Are you sure you want to deactivate account?")) {
            await deactivateAccount();
        }
    };

    return (
        <div className="bg-white shadow p-6 rounded-xl space-y-4">
            <h2 className="text-xl font-semibold">Instructor Information</h2>

            {/* PROFILE INFO */}
            {!editing ? (
                <>
                    <p>
                        <b>Name:</b> {profile?.name}
                    </p>
                    <p>
                        <b>Bio:</b> {profile?.bio}
                    </p>
                    <p>
                        <b>Rating:</b> {profile?.rating}
                    </p>
                    <p>
                        <b>Total students:</b> {profile?.totalStudents}
                    </p>
                    <p>
                        <b>Revenue:</b> ${profile?.revenue}
                    </p>
                    <p>
                        <b>Expertise:</b> {profile?.expertise?.join(", ")}
                    </p>
                </>
            ) : (
                <>
                    <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Name"
                        className="border p-2 w-full rounded"
                    />

                    <textarea
                        name="bio"
                        value={form.bio}
                        onChange={handleChange}
                        placeholder="Bio"
                        className="border p-2 w-full rounded"
                    />

                    <textarea
                        name="expertise"
                        value={form.expertise}
                        onChange={handleChange}
                        placeholder="Expertise (comma separated)"
                        className="border p-2 w-full rounded"
                    />

                    <button
                        onClick={handleUpdate}
                        className="bg-black text-white px-4 py-2 rounded !text-white"
                    >
                        Save Update
                    </button>
                </>
            )}

            {/* CHANGE PASSWORD FORM */}
            {showPassword && (
                <div className="space-y-3 pt-4">
                    <input
                        type="password"
                        name="oldPassword"
                        placeholder="Old Password"
                        value={passwordForm.oldPassword}
                        onChange={handlePasswordInput}
                        className="border p-2 w-full rounded"
                    />

                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        value={passwordForm.newPassword}
                        onChange={handlePasswordInput}
                        className="border p-2 w-full rounded"
                    />

                    <button
                        onClick={handleChangePassword}
                        className="bg-black text-white px-4 py-2 rounded !text-white"
                    >
                        Confirm Change Password
                    </button>
                </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex gap-3 pt-4 flex-wrap">
                <button
                    onClick={() => setEditing(!editing)}
                    className="bg-black text-white px-4 py-2 rounded !text-white"
                >
                    Update Profile
                </button>

                <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="bg-black text-white px-4 py-2 rounded !text-white"
                >
                    Change Password
                </button>

                <button
                    onClick={handleDeactivate}
                    className="bg-black text-white px-4 py-2 rounded !text-white"
                >
                    Deactivate
                </button>
            </div>
        </div>
    );
};

export default InstructorProfile;
