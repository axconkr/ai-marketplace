export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { prisma } from '@/lib/db';
import { landingLeadSchema } from '@/lib/validations/landing-lead';

export async function POST(request: NextRequest) {
  let body: unknown;

  try {
    body = await request.json();
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON body',
      },
      { status: 400 }
    );
  }

  try {
    const data = landingLeadSchema.parse(body);

    const lead = await prisma.landingLead.create({
      data,
      select: { id: true },
    });

    return NextResponse.json({ success: true, id: lead.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation error',
          details: error.issues,
        },
        { status: 400 }
      );
    }

    console.error('Create landing lead error:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
