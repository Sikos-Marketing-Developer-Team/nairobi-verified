import DocumentsViewer from '@/components/DocumentsViewer';

// components/DocumentsTab.tsx
interface DocumentsTabProps {
  merchantId: string;
  merchantName?: string;
}

export const DocumentsTab = ({ merchantId, merchantName = 'Merchant' }: DocumentsTabProps) => {
  return (
    <div className="p-4">
      <DocumentsViewer
        merchantId={merchantId}
        merchantName={merchantName}
        onClose={() => {
          // For tab usage, we might not need to close
          console.log('Documents viewer in tab mode');
        }}
      />
    </div>
  );
};
