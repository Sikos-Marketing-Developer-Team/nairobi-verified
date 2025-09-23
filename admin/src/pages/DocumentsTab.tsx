import { useEffect, useState } from 'react';

// components/DocumentsTab.tsx
interface DocumentsTabProps {
  merchantId: string;
}

export const DocumentsTab = ({ merchantId }: DocumentsTabProps) => {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // ✅ Adjust this base URL depending on your backend setup
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/admin/dashboard/merchants/${merchantId}/documents`
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch documents: ${res.status}`);
        }

        const data = await res.json();
        setDocuments(data);
      } catch (err: any) {
        console.error(err);
        setError(err.message ?? 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [merchantId]);

  return (
    <div>
      <h3>Merchant Documents</h3>

      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <ul>
          {documents.length > 0 ? (
            documents.map((doc, idx) => (
              <li key={doc.id ?? idx}>
                {doc.name ?? 'Unnamed Document'}
              </li>
            ))
          ) : (
            <p>No documents uploaded yet.</p>
          )}
        </ul>
      )}
    </div>
  );
};
