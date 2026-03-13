import React from "react";

export default function CertificateCard({ certificate }) {
  if (!certificate) return null;

  return (
    <div
      id="certificate-card"
      style={{
        border: "2px solid #d4af37",
        padding: 24,
        borderRadius: 12,
        textAlign: "center",
        background: "#fffdf5",
      }}
    >
      <h2>Certificate of Completion</h2>
      <p>This certifies that</p>
      <h1>{certificate.studentName}</h1>
      <p>has successfully completed the course</p>
      <h3>{certificate.courseTitle}</h3>
      <p>Issued at: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
      <p>Certificate Code: {certificate.certificateCode}</p>
    </div>
  );
}