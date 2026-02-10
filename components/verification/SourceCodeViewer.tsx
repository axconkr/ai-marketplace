'use client';

import { useState, useEffect, useCallback } from 'react';
import { FileCode, Download, Copy, Check, File, FileJson, FileText, Loader2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductFile } from '@/lib/types/verification';

interface SourceCodeViewerProps {
  files: ProductFile[];
}

function getFileIcon(mimeType: string, filename: string) {
  if (mimeType.includes('json') || filename.endsWith('.json')) return FileJson;
  if (mimeType.includes('text') || mimeType.includes('javascript') || mimeType.includes('typescript')) return FileCode;
  return FileText;
}

function getLanguageFromFile(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  const map: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    jsx: 'React (JSX)',
    tsx: 'React (TSX)',
    json: 'JSON',
    py: 'Python',
    html: 'HTML',
    css: 'CSS',
    yml: 'YAML',
    yaml: 'YAML',
    md: 'Markdown',
    sql: 'SQL',
    sh: 'Shell',
    bash: 'Shell',
  };
  return map[ext] || ext.toUpperCase();
}

function isTextFile(mimeType: string, filename: string): boolean {
  if (mimeType.startsWith('text/')) return true;
  if (mimeType.includes('json')) return true;
  if (mimeType.includes('javascript')) return true;
  if (mimeType.includes('typescript')) return true;
  if (mimeType.includes('xml')) return true;
  if (mimeType.includes('yaml')) return true;

  const textExtensions = ['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'html', 'css', 'yml', 'yaml', 'md', 'sql', 'sh', 'bash', 'txt', 'env', 'gitignore', 'xml', 'svg'];
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  return textExtensions.includes(ext);
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function SourceCodeViewer({ files }: SourceCodeViewerProps) {
  const [selectedFileId, setSelectedFileId] = useState<string>(files[0]?.id || '');
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [loadingFile, setLoadingFile] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const selectedFile = files.find((f) => f.id === selectedFileId);

  const fetchFileContent = useCallback(async (file: ProductFile) => {
    if (fileContents[file.id]) return;
    if (!isTextFile(file.mime_type, file.original_name)) return;

    setLoadingFile(file.id);
    setLoadError(null);

    try {
      const res = await fetch(file.url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();

      let content = text;
      if (file.mime_type.includes('json') || file.original_name.endsWith('.json')) {
        try {
          content = JSON.stringify(JSON.parse(text), null, 2);
        } catch {
          // not valid JSON, show as-is
        }
      }

      setFileContents((prev) => ({ ...prev, [file.id]: content }));
    } catch (err) {
      setLoadError(`파일을 불러올 수 없습니다: ${(err as Error).message}`);
    } finally {
      setLoadingFile(null);
    }
  }, [fileContents]);

  useEffect(() => {
    if (selectedFile && isTextFile(selectedFile.mime_type, selectedFile.original_name)) {
      fetchFileContent(selectedFile);
    }
  }, [selectedFile, fetchFileContent]);

  const handleCopy = async () => {
    if (!selectedFile || !fileContents[selectedFile.id]) return;
    await navigator.clipboard.writeText(fileContents[selectedFile.id]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (files.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-gray-500">
            <File className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>등록된 파일이 없습니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const canViewContent = selectedFile && isTextFile(selectedFile.mime_type, selectedFile.original_name);
  const content = selectedFile ? fileContents[selectedFile.id] : null;
  const lines = content?.split('\n') || [];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            소스코드
          </CardTitle>
          <div className="flex items-center gap-2">
            {canViewContent && content && (
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                {copied ? '복사됨' : '복사'}
              </Button>
            )}
            {selectedFile && (
              <Button variant="ghost" size="sm" asChild>
                <a href={selectedFile.url} download={selectedFile.original_name}>
                  <Download className="h-4 w-4 mr-1" />
                  다운로드
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* File tabs */}
        <div className="flex border-b overflow-x-auto bg-gray-50">
          {files.map((file) => {
            const Icon = getFileIcon(file.mime_type, file.original_name);
            return (
              <button
                key={file.id}
                onClick={() => setSelectedFileId(file.id)}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2.5 text-sm whitespace-nowrap border-b-2 transition-colors',
                  file.id === selectedFileId
                    ? 'border-blue-500 text-blue-700 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{file.original_name}</span>
                <span className="text-xs text-gray-400 ml-1">
                  {formatFileSize(file.size)}
                </span>
              </button>
            );
          })}
        </div>

        {/* File info bar */}
        {selectedFile && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b text-xs text-gray-500">
            <span>{getLanguageFromFile(selectedFile.original_name)}</span>
            <span>{formatFileSize(selectedFile.size)} · {lines.length > 0 ? `${lines.length}줄` : ''}</span>
          </div>
        )}

        {/* Code content */}
        <div className="relative">
          {loadingFile === selectedFile?.id && (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <span className="ml-2 text-gray-500">파일 로딩 중...</span>
            </div>
          )}

          {loadError && (
            <div className="flex items-center justify-center py-16 text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{loadError}</span>
            </div>
          )}

          {!canViewContent && selectedFile && !loadingFile && (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <File className="h-10 w-10 mb-3 text-gray-300" />
              <p className="text-sm mb-1">미리보기를 지원하지 않는 파일 형식입니다</p>
              <p className="text-xs text-gray-400">{selectedFile.mime_type}</p>
              <Button variant="outline" size="sm" className="mt-4" asChild>
                <a href={selectedFile.url} download={selectedFile.original_name}>
                  <Download className="h-4 w-4 mr-1" />
                  파일 다운로드
                </a>
              </Button>
            </div>
          )}

          {canViewContent && content && !loadingFile && (
            <div className="overflow-auto max-h-[600px]">
              <table className="w-full text-sm font-mono">
                <tbody>
                  {lines.map((line, i) => (
                    <tr key={i} className="hover:bg-blue-50/50">
                      <td className="sticky left-0 bg-gray-50 text-gray-400 text-right px-3 py-0 select-none border-r w-[1%] whitespace-nowrap">
                        {i + 1}
                      </td>
                      <td className="px-4 py-0 whitespace-pre text-gray-800">
                        {line || '\u00A0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
