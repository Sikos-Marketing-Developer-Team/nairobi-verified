import { NextResponse } from 'next/server';
import { parse } from 'csv-parse/sync';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  try {
    const headersList = headers();
    const authToken = headersList.get('authorization');

    if (!authToken) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const fileContent = await file.text();
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
    });

    const importStatus = {
      total: records.length,
      processed: 0,
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    for (const record of records) {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/business`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': authToken,
          },
          body: JSON.stringify({
            name: record.name,
            email: record.email,
            phone: record.phone,
            address: record.address,
            description: record.description,
            category: record.category,
            openingHours: record.openingHours,
            website: record.website,
            socialMedia: record.socialMedia ? JSON.parse(record.socialMedia) : {},
            location: record.location ? JSON.parse(record.location) : {},
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to import business: ${record.name}`);
        }

        importStatus.success++;
      } catch (error: any) {
        importStatus.failed++;
        importStatus.errors.push(`Error importing ${record.name}: ${error?.message || 'Unknown error'}`);
      }
      importStatus.processed++;
    }

    return NextResponse.json(importStatus);
  } catch (error: any) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process import' },
      { status: 500 }
    );
  }
} 