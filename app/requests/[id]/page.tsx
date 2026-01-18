import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RequestDetail } from '@/components/requests';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';

interface RequestDetailPageProps {
  params: {
    id: string;
  };
}

async function getRequest(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    const response = await fetch(`${baseUrl}/api/requests/${id}`, {
      headers: token ? { Cookie: `token=${token}` } : {},
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) {
        notFound();
      }
      throw new Error('Failed to fetch request');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching request:', error);
    return null;
  }
}

async function getCurrentUser() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return null;
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Cookie: `token=${token}` },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: RequestDetailPageProps): Promise<Metadata> {
  const request = await getRequest(params.id);

  if (!request) {
    return {
      title: '의뢰를 찾을 수 없습니다 | AI Marketplace',
    };
  }

  return {
    title: `${request.title} | AI Marketplace`,
    description: request.description.substring(0, 160),
  };
}

export default async function RequestDetailPage({
  params,
}: RequestDetailPageProps) {
  const [request, currentUser] = await Promise.all([
    getRequest(params.id),
    getCurrentUser(),
  ]);

  if (!request) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-6">
        <Link href="/requests">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </Link>
      </div>

      <RequestDetail
        request={request}
        currentUserId={currentUser?.id}
        onUpdate={() => {
          // Revalidate on update
          // This will be handled by client-side refresh
        }}
      />
    </div>
  );
}
