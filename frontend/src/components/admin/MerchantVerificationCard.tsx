"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEye, FaCheckCircle, FaTimesCircle, FaFileAlt, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import { useTheme } from '@/context/ThemeContext';

interface MerchantVerificationCardProps {
  merchant: {
    id: string;
    companyName: string;
    companyEmail: string;
    companyPhone: string;
    location: string;
    isVerified: boolean;
    documents: {
      businessRegistration: string;
      taxCertificate: string;
      idDocument: string;
    };
    createdAt: string;
  };
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onViewDetails: (merchant: any) => void;
  onViewDocument: (url: string) => void;
}

export default function MerchantVerificationCard({
  merchant,
  onVerify,
  onReject,
  onViewDetails,
  onViewDocument
}: MerchantVerificationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { theme } = useTheme();
  
  // Format the date
  const formattedDate = format(new Date(merchant.createdAt), 'MMM dd, yyyy');
  
  return (
    <motion.div 
      className={`border rounded-lg overflow-hidden ${
        theme === 'dark' 
          ? 'bg-gray-800 border-gray-700 hover:shadow-lg hover:shadow-gray-900/30' 
          : 'bg-white border-gray-200 hover:shadow-md'
      } transition-all duration-300`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -5 }}
    >
      {/* Header with company name */}
      <div className={`p-4 ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
      }`}>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center">
              <FaBuilding className={`mr-2 ${
                theme === 'dark' ? 'text-orange-400' : 'text-orange-500'
              }`} />
              <h4 className={`font-medium ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>{merchant.companyName}</h4>
            </div>
            
            <div className="mt-2 space-y-1">
              <div className="flex items-center">
                <FaEnvelope className={`w-3 h-3 mr-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>{merchant.companyEmail}</p>
              </div>
              
              <div className="flex items-center">
                <FaPhone className={`w-3 h-3 mr-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>{merchant.companyPhone}</p>
              </div>
              
              <div className="flex items-center">
                <FaMapMarkerAlt className={`w-3 h-3 mr-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-500'
                }`}>{merchant.location}</p>
              </div>
              
              <div className="flex items-center">
                <FaCalendarAlt className={`w-3 h-3 mr-2 ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`} />
                <p className={`text-xs ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-400'
                }`}>Applied: {formattedDate}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${
                theme === 'dark' 
                  ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-800/50' 
                  : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
              } transition-colors`}
              onClick={() => onViewDetails(merchant)}
              title="View Details"
            >
              <FaEye className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${
                theme === 'dark' 
                  ? 'bg-green-900/30 text-green-400 hover:bg-green-800/50' 
                  : 'bg-green-50 text-green-600 hover:bg-green-100'
              } transition-colors`}
              onClick={() => onVerify(merchant.id)}
              title="Approve"
            >
              <FaCheckCircle className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`p-2 rounded-full ${
                theme === 'dark' 
                  ? 'bg-red-900/30 text-red-400 hover:bg-red-800/50' 
                  : 'bg-red-50 text-red-600 hover:bg-red-100'
              } transition-colors`}
              onClick={() => onReject(merchant.id)}
              title="Reject"
            >
              <FaTimesCircle className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
        
        <div className={`mt-3 pt-3 border-t ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-100'
        }`}>
          <p className={`text-xs font-medium mb-2 ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          }`}>Documents:</p>
          <div className="flex flex-wrap gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } transition-colors`}
              onClick={() => onViewDocument(merchant.documents.businessRegistration)}
            >
              <FaFileAlt className="w-3 h-3 mr-1" />
              Business Reg
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } transition-colors`}
              onClick={() => onViewDocument(merchant.documents.taxCertificate)}
            >
              <FaFileAlt className="w-3 h-3 mr-1" />
              Tax Cert
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center px-2 py-1 rounded text-xs ${
                theme === 'dark' 
                  ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              } transition-colors`}
              onClick={() => onViewDocument(merchant.documents.idDocument)}
            >
              <FaFileAlt className="w-3 h-3 mr-1" />
              ID Doc
            </motion.button>
          </div>
        </div>
      </div>
      
      {isHovered && (
        <motion.div 
          className="h-1 bg-orange-500"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  );
}