import { useEffect, useState } from 'react';

// components/DocumentsTab.tsx
const DocumentsTab = ({ merchantId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/admin/dashboard/merchants/${merchantId}/documents`)
      .then(res => res.json())
      .then(data => {
        setDocuments(data);
        setLoading(false);
      });
  }, [merchantId]);

  return (
    <div>
      <h3>Merchant Documents</h3>
      {/* Display documents with status, download options, etc. */}
    </div>
  );
};