"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

interface UploadedFile {
  id: string;
  user_id?: string;
  name: string;
  url: string;
  created_at?: string;
  file_size?: number;
}

interface FileContextType {
  userFiles: UploadedFile[];
  setUserFiles: (files: UploadedFile[]) => void;
  addFile: (file: UploadedFile) => void;
  removeFile: (fileId: string) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: ReactNode }) {
  const [userFiles, setUserFiles] = useState<UploadedFile[]>([]);

  const addFile = (file: UploadedFile) => {
    setUserFiles(prev => [file, ...prev]);
  };

  const removeFile = (fileId: string) => {
    setUserFiles(prev => prev.filter(f => f.id !== fileId));
  };

  return (
    <FileContext.Provider value={{ userFiles, setUserFiles, addFile, removeFile }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFiles() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFiles must be used within a FileProvider');
  }
  return context;
} 