import { Route } from 'react-router-dom';
import PublicRoute from './PublicRoute';

import Home from '../pages/public/Home/Index';
import About from '../pages/public/About';
import Contact from '../pages/public/Contact';
import AdminDashboard from '../pages/admin/dashboard/Dashboard';
import FileViewer from '../pages/public/components/FileViewer';
import NotFound from '../pages/public/NotFound';

const PublicRoutes = () => (
  <Route element={<PublicRoute />}>
    <Route path="/" element={<Home />} />
    <Route path="*" element={<NotFound />} />
    <Route path="/file-viewer" element={<FileViewer />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/admin/dashboard/:key" element={<AdminDashboard />} />
  </Route>
);

export default PublicRoutes;
