import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCertificateByCode } from "../services/certificate.service";

export default function usePublicCertificatePage() {
  const { code } = useParams();

  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getCertificateByCode(code);
        setCertificate(data);
      } catch {
        setCertificate(null);
      } finally {
        setLoading(false);
      }
    }

    if (code) load();
  }, [code]);

  return { certificate, loading };
}