import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface Props {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<Props> = ({ title, subtitle, children }) => (
  <div className="admin-layout">
    <Sidebar />
    <div className="admin-main">
      <Header title={title} subtitle={subtitle} />
      <main className="admin-content animate-fadeUp">
        {children}
      </main>
    </div>
  </div>
);
