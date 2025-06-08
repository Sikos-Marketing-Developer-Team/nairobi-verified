# Merchant Management System

This document provides an overview of the merchant management system in the Nairobi Verified admin dashboard.

## Terminology Update

We've updated the terminology throughout the system:
- "Businesses" are now referred to as "Merchants"
- "Business Registration" is now "Merchant Registration"
- "Business Import" is now "Merchant Import"

## Features

### Merchant Management
- View all merchants in the system
- Filter merchants by status and verification status
- Search merchants by name, email, or company name
- View detailed merchant information
- Approve or reject merchant verification requests

### Merchant Import
- Import merchants via CSV file
- Preview imported data before confirming
- View import results and error reports
- Download CSV template for proper formatting

### Sample Merchant Addition
- Add sample merchants provided in the requirements
- Parse and validate merchant data
- Import validated merchants into the system

### Merchant Guide
- Documentation on how to add and manage merchants
- Explanation of the verification process
- List of required documents for merchant verification

## Pages

1. **Merchants List** (`/admin/merchants/page.tsx`)
   - Main page for viewing and managing all merchants
   - Enhanced UI with better filtering and search capabilities
   - Improved status indicators and action buttons

2. **Merchant Import** (`/admin/merchants/import/page.tsx`)
   - Step-by-step wizard for importing merchants
   - File upload with drag-and-drop support
   - Data preview and validation

3. **Bulk Import** (`/admin/merchants/bulk-import/page.tsx`)
   - Advanced import functionality for large datasets
   - Progress tracking and batch processing
   - Detailed error reporting

4. **Add Sample Merchants** (`/admin/merchants/add-sample/page.tsx`)
   - Special page for adding the sample merchants provided in requirements
   - Data parsing and validation
   - Import confirmation and results

5. **Merchant Guide** (`/admin/merchants/guide/page.tsx`)
   - Documentation and guidance for merchant management
   - Process explanations and best practices
   - Quick links to common actions

## UI Improvements

- Enhanced header with logo and better navigation
- Improved table layouts with better spacing and typography
- Better status indicators with color-coding
- Empty state designs for when no data is available
- Loading states and error handling
- Responsive design for all screen sizes

## How to Use

### Adding Sample Merchants
1. Navigate to Admin Dashboard
2. Go to Merchants section
3. Click "Add Merchant" button
4. Select "Add Sample Merchants"
5. Review the pre-filled data
6. Click "Parse Data" to validate
7. Review the parsed merchants
8. Click "Import Merchants" to add them to the system

### Importing Merchants via CSV
1. Navigate to Admin Dashboard
2. Go to Merchants section
3. Click "Import" button
4. Download the template if needed
5. Upload your CSV file
6. Preview the data to ensure it's correct
7. Click "Import Merchants" to complete the process

### Managing Merchant Verification
1. Navigate to Admin Dashboard
2. Go to Merchants section
3. Filter by "Pending" verification status
4. Click on a merchant to view details
5. Review their submitted documents
6. Click "Approve" or "Reject" based on your review
7. Add notes if rejecting a merchant

## Best Practices

1. **Regular Verification**: Process verification requests promptly to ensure merchants can start using the platform quickly.

2. **Data Validation**: Always validate imported data to ensure it meets the system requirements.

3. **Documentation**: Keep detailed notes when rejecting merchant applications to help them understand what needs to be fixed.

4. **Bulk Operations**: Use the bulk import feature for adding multiple merchants at once to save time.

5. **Search and Filter**: Use the search and filter capabilities to quickly find specific merchants in the system.