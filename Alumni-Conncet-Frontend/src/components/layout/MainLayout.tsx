import { Outlet } from 'react-router-dom';
import GlobalNavbar from './GlobalNavbar';

export default function MainLayout() {
  return (
    <div className="min-h-screen">
      <GlobalNavbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
}
