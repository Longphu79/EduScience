const StudentProfile = ({ profile }) => {
    if (!profile) return <div>No student profile</div>;

    return (
        <div className="bg-white shadow p-6 rounded-xl">
            <h2 className="text-xl font-semibold mb-4">Student Information</h2>

            <p>
                <b>Name:</b> {profile.fullName}
            </p>
            <p>
                <b>Phone:</b> {profile.phone}
            </p>
            <p>
                <b>Address:</b> {profile.address}
            </p>
            <p>
                <b>Date of birth:</b> {profile.dateOfBirth}
            </p>
            <p>
                <b>Balance:</b> ${profile.balance}
            </p>
        </div>
    );
};

export default StudentProfile;
