'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  sort_order: number;
}

export default function AdminSettingsPage() {
  const [feeRate, setFeeRate] = useState<number>(15);
  const [newFeeRate, setNewFeeRate] = useState<string>('15');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchFeeRate(), fetchAnnouncements(), fetchCategories()]);
    setLoading(false);
  };

  const fetchFeeRate = async () => {
    try {
      const response = await fetch('/api/admin/settings/fee');
      const data = await response.json();
      const rate = (data.data || 0.15) * 100;
      setFeeRate(rate);
      setNewFeeRate(rate.toString());
    } catch (error) {
      console.error('Failed to fetch fee rate:', error);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await fetch('/api/admin/settings/announcements');
      const data = await response.json();
      setAnnouncements(data.data || []);
    } catch (error) {
      console.error('Failed to fetch announcements:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/settings/categories');
      const data = await response.json();
      setCategories(data.data || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const updateFeeRate = async () => {
    const rate = parseFloat(newFeeRate);
    if (isNaN(rate) || rate < 1 || rate > 50) {
      alert('수수료율은 1~50% 사이여야 합니다.');
      return;
    }
    try {
      const response = await fetch('/api/admin/settings/fee', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: rate / 100 }),
      });
      if (response.ok) {
        alert('수수료율이 변경되었습니다.');
        setFeeRate(rate);
      } else {
        alert('변경에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleAnnouncementSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: formData.get('type') as string,
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
    };

    try {
      const url = editingAnnouncement ? `/api/admin/settings/announcements/${editingAnnouncement.id}` : '/api/admin/settings/announcements';
      const method = editingAnnouncement ? 'PATCH' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) {
        alert(editingAnnouncement ? '수정되었습니다.' : '추가되었습니다.');
        setShowAnnouncementForm(false);
        setEditingAnnouncement(null);
        fetchAnnouncements();
      } else {
        alert('처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm('공지사항을 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/admin/settings/announcements/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('삭제되었습니다.');
        fetchAnnouncements();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const name = formData.get('name') as string;
    const data = {
      name,
      slug: (formData.get('slug') as string) || name.toLowerCase().replace(/\s+/g, '-'),
      description: formData.get('description') || null,
      sort_order: parseInt(formData.get('sort_order') as string) || 0,
    };

    try {
      const url = editingCategory ? `/api/admin/settings/categories/${editingCategory.id}` : '/api/admin/settings/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      if (response.ok) {
        alert(editingCategory ? '수정되었습니다.' : '추가되었습니다.');
        setShowCategoryForm(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const result = await response.json();
        alert(result.error || '처리에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('카테고리를 삭제하시겠습니까?')) return;
    try {
      const response = await fetch(`/api/admin/settings/categories/${id}`, { method: 'DELETE' });
      if (response.ok) {
        alert('삭제되었습니다.');
        fetchCategories();
      } else {
        const result = await response.json();
        alert(result.error || '삭제에 실패했습니다. 해당 카테고리를 사용하는 상품이 있을 수 있습니다.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = { INFO: 'bg-blue-100 text-blue-800', WARNING: 'bg-yellow-100 text-yellow-800', MAINTENANCE: 'bg-red-100 text-red-800' };
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[type] || 'bg-gray-100'}`}>{type}</span>;
  };

  if (loading) return <div className="container mx-auto px-4 py-8 text-center">로딩 중...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/admin"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />대시보드로 돌아가기</Button></Link>
      </div>

      <h1 className="text-3xl font-bold mb-8">시스템 설정</h1>

      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-xl font-semibold mb-4">플랫폼 수수료</h2>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">현재 수수료율:</span>
            <span className="text-2xl font-bold">{feeRate}%</span>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <input type="number" min="1" max="50" step="0.1" value={newFeeRate} onChange={(e) => setNewFeeRate(e.target.value)} className="border rounded px-3 py-2 w-24" />
            <span>%</span>
            <Button onClick={updateFeeRate}>저장</Button>
          </div>
          <p className="text-sm text-gray-500 mt-2">수수료율은 1% ~ 50% 사이로 설정할 수 있습니다.</p>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">공지사항 관리</h2>
            <Button onClick={() => { setEditingAnnouncement(null); setShowAnnouncementForm(true); }}><Plus className="w-4 h-4 mr-2" />새 공지 추가</Button>
          </div>
          
          {showAnnouncementForm && (
            <form onSubmit={handleAnnouncementSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid gap-4">
                <input name="title" placeholder="제목" defaultValue={editingAnnouncement?.title} required className="border rounded px-3 py-2" />
                <textarea name="content" placeholder="내용" defaultValue={editingAnnouncement?.content} required rows={4} className="border rounded px-3 py-2" />
                <select name="type" defaultValue={editingAnnouncement?.type || 'INFO'} className="border rounded px-3 py-2">
                  <option value="INFO">정보</option>
                  <option value="WARNING">경고</option>
                  <option value="MAINTENANCE">점검</option>
                </select>
                <div className="grid grid-cols-2 gap-4">
                  <input name="start_date" type="date" defaultValue={editingAnnouncement?.start_date?.slice(0, 10)} className="border rounded px-3 py-2" />
                  <input name="end_date" type="date" defaultValue={editingAnnouncement?.end_date?.slice(0, 10)} className="border rounded px-3 py-2" />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">{editingAnnouncement ? '수정' : '추가'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowAnnouncementForm(false); setEditingAnnouncement(null); }}>취소</Button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-gray-500">공지사항이 없습니다.</p>
            ) : announcements.map((ann) => (
              <div key={ann.id} className="flex justify-between items-start p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    {getTypeBadge(ann.type)}
                    <span className={ann.is_active ? 'text-green-600 text-xs' : 'text-gray-400 text-xs'}>{ann.is_active ? '활성' : '비활성'}</span>
                  </div>
                  <h3 className="font-medium">{ann.title}</h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.content}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingAnnouncement(ann); setShowAnnouncementForm(true); }} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteAnnouncement(ann.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">카테고리 관리</h2>
            <Button onClick={() => { setEditingCategory(null); setShowCategoryForm(true); }}><Plus className="w-4 h-4 mr-2" />새 카테고리 추가</Button>
          </div>

          {showCategoryForm && (
            <form onSubmit={handleCategorySubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="grid gap-4">
                <input name="name" placeholder="카테고리 이름" defaultValue={editingCategory?.name} required className="border rounded px-3 py-2" />
                <input name="slug" placeholder="슬러그 (자동생성됨)" defaultValue={editingCategory?.slug} className="border rounded px-3 py-2" />
                <input name="description" placeholder="설명 (선택)" defaultValue={editingCategory?.description || ''} className="border rounded px-3 py-2" />
                <input name="sort_order" type="number" placeholder="정렬 순서" defaultValue={editingCategory?.sort_order || 0} className="border rounded px-3 py-2" />
                <div className="flex gap-2">
                  <Button type="submit">{editingCategory ? '수정' : '추가'}</Button>
                  <Button type="button" variant="outline" onClick={() => { setShowCategoryForm(false); setEditingCategory(null); }}>취소</Button>
                </div>
              </div>
            </form>
          )}

          <div className="space-y-2">
            {categories.length === 0 ? (
              <p className="text-gray-500">카테고리가 없습니다.</p>
            ) : categories.map((cat) => (
              <div key={cat.id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{cat.name}</h3>
                    <span className="text-gray-400 text-sm">({cat.slug})</span>
                    <span className={cat.is_active ? 'text-green-600 text-xs' : 'text-gray-400 text-xs'}>{cat.is_active ? '활성' : '비활성'}</span>
                  </div>
                  {cat.description && <p className="text-sm text-gray-600">{cat.description}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingCategory(cat); setShowCategoryForm(true); }} className="text-blue-600 hover:text-blue-900"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => deleteCategory(cat.id)} className="text-red-600 hover:text-red-900"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
