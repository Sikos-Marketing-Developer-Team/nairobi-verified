#!/bin/bash

# Batch update script to add skeleton loading to remaining pages
# This script will be used as a guide for manual updates

echo "Remaining pages to update with skeleton loading:"
echo "================================================"

PAGES=(
    "ForgotPassword.tsx"
    "ResetPassword.tsx" 
    "HowItWorks.tsx"
    "SafetyGuidelines.tsx"
    "TermsOfService.tsx"
    "PrivacyPolicy.tsx"
    "CookiePolicy.tsx"
    "MerchantDetail.tsx"
    "MerchantProfileEdit.tsx"
    "MerchantVerification.tsx"
    "MerchantAccountSetup.tsx"
    "MerchantCalendar.tsx"
    "AdminMerchants.tsx"
    "AdminVerifications.tsx"
    "AdminSettings.tsx"
    "AdminAddMerchant.tsx" 
    "SubscriptionPlans.tsx"
)

echo "Total pages remaining: ${#PAGES[@]}"

for page in "${PAGES[@]}"; do
    echo "- $page"
done

echo ""
echo "Update pattern for each page:"
echo "============================"
echo "1. Add imports:"
echo "   import { usePageLoading } from '@/hooks/use-loading';"
echo "   import { [SkeletonComponent], PageSkeleton } from '@/components/ui/loading-skeletons';"
echo "   import { Skeleton } from '@/components/ui/skeleton';"
echo ""
echo "2. Add loading hook:"
echo "   const isLoading = usePageLoading(500-800);"
echo ""
echo "3. Add skeleton condition before main return:"
echo "   if (isLoading) {"
echo "     return (...skeleton JSX...);"
echo "   }"
echo ""
echo "Available skeleton components:"
echo "- CardSkeleton"
echo "- ProductGridSkeleton"
echo "- MerchantGridSkeleton" 
echo "- DashboardSkeleton"
echo "- ProfileSkeleton"
echo "- TableSkeleton"
echo "- ProductDetailSkeleton"
echo "- HeroSkeleton"
echo "- CategorySkeleton"
echo "- PageSkeleton (wrapper)"