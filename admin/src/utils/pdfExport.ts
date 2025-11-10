import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Nairobi Verified Brand Colors
const BRAND_COLORS = {
  primary: '#EC5C0A', // Orange
  secondary: '#1F2937', // Dark Gray
  accent: '#F97316', // Light Orange
  success: '#10B981', // Green
  warning: '#F59E0B', // Yellow
  danger: '#EF4444', // Red
  info: '#3B82F6', // Blue
  lightGray: '#F3F4F6',
  darkGray: '#6B7280',
  white: '#FFFFFF'
};

interface AnalyticsData {
  dashboardStats?: any;
  analyticsData?: any;
  period?: string;
  generatedAt?: Date;
}

// Helper function to create chart as image
const createChartImage = async (type: 'bar' | 'pie' | 'line', data: any, labels: string[]): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve('');
      return;
    }

    const colors = [
      BRAND_COLORS.primary,
      BRAND_COLORS.accent,
      BRAND_COLORS.info,
      BRAND_COLORS.success,
      BRAND_COLORS.warning,
      BRAND_COLORS.danger,
      '#8B5CF6', // Purple
      '#EC4899', // Pink
    ];

    const chartConfig: any = {
      type,
      data: {
        labels,
        datasets: [{
          label: 'Data',
          data,
          backgroundColor: type === 'pie' ? colors : BRAND_COLORS.primary,
          borderColor: BRAND_COLORS.white,
          borderWidth: 2
        }]
      },
      options: {
        responsive: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: {
                size: 10
              }
            }
          }
        },
        scales: type !== 'pie' ? {
          y: {
            beginAtZero: true
          }
        } : {}
      }
    };

    const chart = new Chart(ctx, chartConfig);

    setTimeout(() => {
      const imgData = canvas.toDataURL('image/png');
      chart.destroy();
      resolve(imgData);
    }, 500);
  });
};

export const generateAnalyticsPDF = async (data: AnalyticsData, exportType: string = 'full') => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper to add new page if needed
  const checkAddPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      addHeader();
      return true;
    }
    return false;
  };

  // Add header to each page
  const addHeader = () => {
    // Add logo placeholder (brand color rectangle)
    doc.setFillColor(BRAND_COLORS.primary);
    doc.rect(15, 10, 30, 10, 'F');
    doc.setTextColor(BRAND_COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NV', 25, 17);

    // Title
    doc.setTextColor(BRAND_COLORS.secondary);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Nairobi Verified', 50, 17);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BRAND_COLORS.darkGray);
    doc.text('Admin Analytics Report', 50, 23);
  };

  // Add footer
  const addFooter = (pageNum: number) => {
    doc.setFontSize(8);
    doc.setTextColor(BRAND_COLORS.darkGray);
    doc.text(
      `Generated on ${new Date().toLocaleDateString()} | Page ${pageNum}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  };

  // Add first page header
  addHeader();

  // Report Details
  yPosition = 35;
  doc.setFillColor(BRAND_COLORS.lightGray);
  doc.rect(15, yPosition, pageWidth - 30, 25, 'F');
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND_COLORS.secondary);
  doc.text('Report Details', 20, yPosition + 7);
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(BRAND_COLORS.darkGray);
  doc.text(`Report Type: ${exportType.toUpperCase()}`, 20, yPosition + 14);
  doc.text(`Period: ${data.period || 'Last 30 days'}`, 20, yPosition + 20);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 110, yPosition + 14);
  
  yPosition += 35;

  // Key Metrics Section
  if (data.dashboardStats) {
    checkAddPage(60);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_COLORS.primary);
    doc.text('Key Performance Metrics', 15, yPosition);
    yPosition += 10;

    const metrics = [
      { label: 'Total Merchants', value: data.dashboardStats.totalMerchants || 0, growth: data.dashboardStats.growth?.merchantGrowth || 0 },
      { label: 'Verified Merchants', value: data.dashboardStats.verifiedMerchants || 0, growth: null },
      { label: 'Total Users', value: data.dashboardStats.totalUsers || 0, growth: data.dashboardStats.growth?.userGrowth || 0 },
      { label: 'Total Products', value: data.dashboardStats.totalProducts || 0, growth: null },
      { label: 'Total Reviews', value: data.dashboardStats.totalReviews || 0, growth: data.dashboardStats.growth?.reviewGrowth || 0 },
      { label: 'Verification Rate', value: `${data.dashboardStats.metrics?.verificationRate || 0}%`, growth: null }
    ];

    // Create metrics table
    const metricsData = metrics.map(m => [
      m.label,
      m.value.toString(),
      m.growth !== null ? `${m.growth > 0 ? '+' : ''}${m.growth}%` : 'N/A'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value', 'Growth']],
      body: metricsData,
      theme: 'striped',
      headStyles: {
        fillColor: BRAND_COLORS.primary,
        textColor: BRAND_COLORS.white,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: BRAND_COLORS.lightGray
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Business Type Distribution Chart
  if (data.analyticsData?.businessTypeDistribution) {
    checkAddPage(100);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_COLORS.primary);
    doc.text('Business Type Distribution', 15, yPosition);
    yPosition += 10;

    const businessTypes = data.analyticsData.businessTypeDistribution;
    const labels = businessTypes.map((item: any) => item.businessType);
    const values = businessTypes.map((item: any) => item.count);

    const pieChart = await createChartImage('pie', values, labels);
    if (pieChart) {
      doc.addImage(pieChart, 'PNG', 15, yPosition, 85, 64);
    }

    // Add table next to chart
    const businessTableData = businessTypes.map((item: any) => [
      item.businessType,
      item.count.toString(),
      `${((item.count / businessTypes.reduce((sum: number, b: any) => sum + b.count, 0)) * 100).toFixed(1)}%`
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['Type', 'Count', 'Percentage']],
      body: businessTableData,
      theme: 'striped',
      headStyles: {
        fillColor: BRAND_COLORS.secondary,
        textColor: BRAND_COLORS.white
      },
      margin: { left: 110, right: 15 },
      tableWidth: 85
    });

    yPosition = Math.max(yPosition + 70, (doc as any).lastAutoTable.finalY + 15);
  }

  // Top Merchants Table
  if (data.analyticsData?.topMerchants && data.analyticsData.topMerchants.length > 0) {
    checkAddPage(80);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_COLORS.primary);
    doc.text('Top Performing Merchants', 15, yPosition);
    yPosition += 10;

    const merchantsData = data.analyticsData.topMerchants.slice(0, 10).map((m: any, index: number) => [
      (index + 1).toString(),
      m.businessName || 'N/A',
      (m.rating || 0).toFixed(1),
      (m.reviews || 0).toString(),
      m.verified ? 'Yes' : 'No'
    ]);

    autoTable(doc, {
      startY: yPosition,
      head: [['#', 'Business Name', 'Rating', 'Reviews', 'Verified']],
      body: merchantsData,
      theme: 'grid',
      headStyles: {
        fillColor: BRAND_COLORS.primary,
        textColor: BRAND_COLORS.white,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 9
      },
      margin: { left: 15, right: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Review Analytics
  if (data.analyticsData?.reviewAnalytics) {
    checkAddPage(60);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(BRAND_COLORS.primary);
    doc.text('Review Analytics', 15, yPosition);
    yPosition += 10;

    const reviewData = [
      ['Total Reviews', (data.analyticsData.reviewAnalytics.totalReviews || 0).toString()],
      ['Average Rating', (data.analyticsData.reviewAnalytics.averageRating || 0).toFixed(2)],
      ['5-Star Reviews', `${data.analyticsData.reviewAnalytics.ratingDistribution?.[5] || 0} (${((data.analyticsData.reviewAnalytics.ratingDistribution?.[5] || 0) / (data.analyticsData.reviewAnalytics.totalReviews || 1) * 100).toFixed(1)}%)`],
      ['4-Star Reviews', `${data.analyticsData.reviewAnalytics.ratingDistribution?.[4] || 0} (${((data.analyticsData.reviewAnalytics.ratingDistribution?.[4] || 0) / (data.analyticsData.reviewAnalytics.totalReviews || 1) * 100).toFixed(1)}%)`],
      ['3-Star Reviews', `${data.analyticsData.reviewAnalytics.ratingDistribution?.[3] || 0} (${((data.analyticsData.reviewAnalytics.ratingDistribution?.[3] || 0) / (data.analyticsData.reviewAnalytics.totalReviews || 1) * 100).toFixed(1)}%)`],
      ['2-Star Reviews', `${data.analyticsData.reviewAnalytics.ratingDistribution?.[2] || 0} (${((data.analyticsData.reviewAnalytics.ratingDistribution?.[2] || 0) / (data.analyticsData.reviewAnalytics.totalReviews || 1) * 100).toFixed(1)}%)`],
      ['1-Star Reviews', `${data.analyticsData.reviewAnalytics.ratingDistribution?.[1] || 0} (${((data.analyticsData.reviewAnalytics.ratingDistribution?.[1] || 0) / (data.analyticsData.reviewAnalytics.totalReviews || 1) * 100).toFixed(1)}%)`]
    ];

    autoTable(doc, {
      startY: yPosition,
      body: reviewData,
      theme: 'plain',
      styles: {
        fontSize: 10
      },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: BRAND_COLORS.secondary },
        1: { textColor: BRAND_COLORS.darkGray }
      },
      margin: { left: 15 }
    });

    yPosition = (doc as any).lastAutoTable.finalY + 15;
  }

  // Add page numbers to all pages
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    addFooter(i);
  }

  // Save the PDF
  const filename = `nairobi-verified-analytics-${exportType}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

// Export data as CSV
export const generateCSV = (data: any[], filename: string) => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Export data as Excel-compatible CSV
export const generateExcel = (data: any[], filename: string) => {
  generateCSV(data, filename.replace('.csv', '.xls'));
};

export default {
  generateAnalyticsPDF,
  generateCSV,
  generateExcel
};
