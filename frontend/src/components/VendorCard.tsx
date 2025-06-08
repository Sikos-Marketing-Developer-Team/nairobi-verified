'use client';

import Image from 'next/image';
import { Merchant } from '../types/api';

interface VendorCardProps {
  merchant: Merchant;
}

export default function VendorCard({ merchant }: VendorCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-40">
        {merchant.coverImage ? (
          <Image
            src={merchant.coverImage}
            alt={merchant.name}
            fill
            className="object-cover"
            sizes="(max-width: 256px) 100vw, 256px"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <i className="bx bxs-store text-4xl text-gray-400"></i>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 truncate">{merchant.name}</h3>
        <p className="text-sm text-gray-600 mt-1">{merchant.categories.join(', ')}</p>
        <p className="text-sm text-gray-500 mt-1 truncate">{merchant.address}</p>
      </div>
    </div>
  );
}