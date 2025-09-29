// // Mock data for development
// const mockUsers = [
//   {
//     _id: '60d0fe4f5311236168a109ca',
//     firstName: 'John',
//     lastName: 'Doe',
//     email: 'john@example.com',
//     role: 'user',
//     isMerchant: false
//   },
//   {
//     _id: '60d0fe4f5311236168a109cb',
//     firstName: 'Jane',
//     lastName: 'Smith',
//     email: 'jane@example.com',
//     role: 'admin',
//     isMerchant: false
//   },
//   {
//     _id: '60d0fe4f5311236168a109cc',
//     businessName: 'Acme Corporation',
//     email: 'merchant@example.com',
//     role: 'user',
//     isMerchant: true
//   }
// ];

// const mockMerchants = [
//   {
//     _id: '60d0fe4f5311236168a109cd',
//     name: 'Acme Corporation',
//     businessName: 'Acme Corporation',
//     description: 'A leading provider of quality products and services in Nairobi.',
//     category: 'Retail',
//     address: '123 Main St, Nairobi',
//     location: 'Nairobi CBD',
//     phone: '+254 712 345 678',
//     email: 'info@acme.com',
//     website: 'https://www.acme.com',
//     logo: 'https://via.placeholder.com/150',
//     bannerImage: 'https://via.placeholder.com/1200x400',
//     gallery: [
//       'https://via.placeholder.com/400',
//       'https://via.placeholder.com/400',
//       'https://via.placeholder.com/400',
//       'https://via.placeholder.com/400'
//     ],
//     rating: 4.5,
//     reviews: 27,
//     establishedYear: 2010,
//     verifiedDate: '2023-01-15T00:00:00.000Z',
//     businessHours: {
//       monday: { open: '09:00', close: '17:00', closed: false },
//       tuesday: { open: '09:00', close: '17:00', closed: false },
//       wednesday: { open: '09:00', close: '17:00', closed: false },
//       thursday: { open: '09:00', close: '17:00', closed: false },
//       friday: { open: '09:00', close: '17:00', closed: false },
//       saturday: { open: '10:00', close: '15:00', closed: false },
//       sunday: { closed: true }
//     },
//     owner: '60d0fe4f5311236168a109cc'
//   },
//   {
//     _id: '60d0fe4f5311236168a109ce',
//     name: 'Tech Solutions',
//     businessName: 'Tech Solutions',
//     description: 'Providing innovative technology solutions for businesses in Nairobi.',
//     category: 'Technology',
//     address: '456 Tech Ave, Nairobi',
//     location: 'Westlands',
//     phone: '+254 723 456 789',
//     email: 'info@techsolutions.com',
//     website: 'https://www.techsolutions.com',
//     logo: 'https://via.placeholder.com/150',
//     bannerImage: 'https://via.placeholder.com/1200x400',
//     gallery: [
//       'https://via.placeholder.com/400',
//       'https://via.placeholder.com/400',
//       'https://via.placeholder.com/400'
//     ],
//     rating: 4.2,
//     reviews: 15,
//     establishedYear: 2015,
//     verifiedDate: '2023-02-20T00:00:00.000Z',
//     businessHours: {
//       monday: { open: '08:00', close: '18:00', closed: false },
//       tuesday: { open: '08:00', close: '18:00', closed: false },
//       wednesday: { open: '08:00', close: '18:00', closed: false },
//       thursday: { open: '08:00', close: '18:00', closed: false },
//       friday: { open: '08:00', close: '18:00', closed: false },
//       saturday: { open: '09:00', close: '13:00', closed: false },
//       sunday: { closed: true }
//     }
//   }
// ];

// const mockReviews = [
//   {
//     _id: '60d0fe4f5311236168a109cf',
//     merchant: '60d0fe4f5311236168a109cd',
//     user: '60d0fe4f5311236168a109ca',
//     rating: 5,
//     title: 'Excellent service',
//     comment: 'I had a great experience with this business. The staff was friendly and professional.',
//     date: '2023-03-10T00:00:00.000Z',
//     helpfulCount: 3
//   },
//   {
//     _id: '60d0fe4f5311236168a109d0',
//     merchant: '60d0fe4f5311236168a109cd',
//     user: '60d0fe4f5311236168a109cb',
//     rating: 4,
//     title: 'Good but could be better',
//     comment: 'Overall a good experience, but there is room for improvement in customer service.',
//     date: '2023-02-15T00:00:00.000Z',
//     helpfulCount: 1
//   }
// ];

// const mockFavorites = [
//   {
//     _id: '60d0fe4f5311236168a109d1',
//     user: '60d0fe4f5311236168a109ca',
//     merchant: '60d0fe4f5311236168a109cd'
//   }
// ];

// module.exports = {
//   mockUsers,
//   mockMerchants,
//   mockReviews,
//   mockFavorites
// };