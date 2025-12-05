import { Outlet } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <GlobalNavbar />
      <main className="pb-24 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}
