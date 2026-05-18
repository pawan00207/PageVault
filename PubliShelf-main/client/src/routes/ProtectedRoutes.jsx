import { Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

import Dashboard from '../pages/buyer/dashboard/Dashboard';
import SearchPage from '../pages/buyer/search/Search';
import BuyerProfile from '../pages/buyer/profile/Profile';
import ProductDetail from '../pages/buyer/product-detail/ProductDetail';
import Checkout from '../pages/buyer/checkout/Checkout';
import Cart from '../pages/buyer/cart/Cart';
import PaymentSuccess from '../pages/buyer/PaymentSuccess';
import AuctionPage from '../pages/buyer/auction/AuctionPage';
import AuctionItemDetail from '../pages/buyer/auction/AuctionItemDetail';
import AuctionOngoing from '../pages/buyer/auction/AuctionOngoing';
import BuyerLayout from '../pages/buyer/components/BuyerLayout';

import ActiveBooks from '../pages/publisher/active-books/ActiveBooks';
import DeletedBooks from '../pages/publisher/deleted-books/DeletedBooks';
import Auctions from '../pages/publisher/auctions/Auctions';
import PublishBook from '../pages/publisher/publish-book/PublishBook';
import SellAntique from '../pages/publisher/sell-antique/SellAntique';
import EditBookPage from '../pages/publisher/edit-book/EditBookPage';
import PublisherViewBook from '../pages/publisher/view-book/ViewBook';
import PublisherDashboard from '../pages/publisher/dashboard/Dashboard';
import PublisherDashboard_Old from '../pages/publisher/dashboard old/Dashboard_Old';
import PublisherLayout from '../pages/publisher/components/PublisherLayout';

import ManagerDashboard from '../pages/manager/dashboard/Dashboard';
import ManagerLayout from '../pages/manager/components/ManagerLayout';
import AuctionsLayout from '../pages/manager/auctions/AuctionsLayout';
import ManagerAuctions from '../pages/manager/auctions/Auctions';
import AuctionOverview from '../pages/manager/auctions/AuctionOverview';
import ManagerAuctionsOverview from '../pages/manager/auctions/Overview';
import PublishersLayout from '../pages/manager/publishers/PublishersLayout';
import Publishers from '../pages/manager/publishers/Publishers';
import PublisherOverview from '../pages/manager/publishers/PublisherOverview';

import AdminDashboard from '../pages/admin/dashboard/Dashboard';
import ManagersLayout from '../pages/admin/managers/ManagersLayout';
import Managers from '../pages/admin/managers/Managers';
import ManagerOverview from '../pages/admin/managers/ManagerOverview';
import AdminPublishers from '../pages/admin/publishers/Publishers';
import AdminPublisherOverview from '../pages/admin/publishers/PublisherOverview';
import ManagersAnalytics from '../pages/admin/managers-analytics/ManagersAnalytics';
import ManagerAnalyticsOverview from '../pages/admin/managers-analytics/ManagerAnalyticsOverview';
import Buyers from '../pages/admin/buyers/Buyers';
import BuyerOverview from '../pages/admin/buyers/BuyerOverview';
import ProductsLayout from '../pages/admin/products/ProductsLayout';
import Books from '../pages/admin/products/Books';
import BookOverview from '../pages/admin/products/BookOverview';
import AntiqueBooks from '../pages/admin/products/AntiqueBooks';
import AntiqueBookOverview from '../pages/admin/products/AntiqueBookOverview';
import Settings from '../pages/admin/settings/Settings';
import AdminLayout from '../pages/admin/components/AdminLayout';

const ProtectedRoutes = () => (
  <>
    <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
      <Route path="/buyer" element={<BuyerLayout />}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="profile" element={<BuyerProfile />} />
        <Route path="product-detail/:id" element={<ProductDetail />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="cart" element={<Cart />} />
        <Route path="payment-success" element={<PaymentSuccess />} />
        <Route path="auction-page" element={<AuctionPage />} />
        <Route path="auction-item-detail/:id" element={<AuctionItemDetail />} />
        <Route path="auction-ongoing/:id" element={<AuctionOngoing />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['publisher']} />}>
      <Route path="/publisher" element={<PublisherLayout />}>
        <Route path="old-dashboard" element={<PublisherDashboard_Old/> } />
        <Route path="dashboard" element={<PublisherDashboard />} />
        <Route path="active-books" element={<ActiveBooks />} />
        <Route path="deleted-books" element={<DeletedBooks />} />
        <Route path="auctions" element={<Auctions />} />
        <Route path="publish-book" element={<PublishBook />} />
        <Route path="sell-antique" element={<SellAntique />} />
        <Route path="edit-book/:id" element={<EditBookPage />} />
        <Route path="view-book/:id" element={<PublisherViewBook />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['manager']} />}>
      <Route path="/manager" element={<ManagerLayout />}>
        <Route path="dashboard" element={<ManagerDashboard />} />
        <Route path="auctions" element={<AuctionsLayout />}>
          <Route index element={<Navigate to="/manager/auctions/pending" replace />} />
          <Route path="overview" element={<ManagerAuctionsOverview />} />
          <Route path="pending" element={<ManagerAuctions type="pending" />} />
          <Route path="approved" element={<ManagerAuctions type="approved" />} />
          <Route path="rejected" element={<ManagerAuctions type="rejected" />} />
        </Route>
        <Route path="auctions/:id/overview" element={<AuctionOverview />} />
        <Route path="publishers" element={<PublishersLayout />}>
          <Route index element={<Navigate to="/manager/publishers/pending" replace />} />
          <Route path="pending" element={<Publishers type="pending" />} />
          <Route path="active" element={<Publishers type="active" />} />
          <Route path="banned" element={<Publishers type="banned" />} />
        </Route>
        <Route path="publishers/:id/overview" element={<PublisherOverview />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
      <Route path="/admin" element={<AdminLayout />}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="managers" element={<ManagersLayout />}>
          <Route index element={<Navigate to="/admin/managers/pending" replace />} />
          <Route path="pending" element={<Managers type="pending" />} />
          <Route path="active" element={<Managers type="active" />} />
          <Route path="banned" element={<Managers type="banned" />} />
          <Route path="analytics" element={<ManagersAnalytics />} />
        </Route>
        <Route path="managers/:id" element={<ManagerOverview />} />
        <Route path="managers/analytics/:id" element={<ManagerAnalyticsOverview />} />
        <Route path="publishers" element={<AdminPublishers />} />
        <Route path="publishers/:id" element={<AdminPublisherOverview />} />
        <Route path="buyers" element={<Buyers />} />
        <Route path="buyers/:id" element={<BuyerOverview />} />
        <Route path="products" element={<ProductsLayout />}>
          <Route index element={<Navigate to="/admin/products/books" replace />} />
          <Route path="books" element={<Books />} />
          <Route path="antique-books" element={<AntiqueBooks />} />
        </Route>
        <Route path="products/books/:id" element={<BookOverview />} />
        <Route path="products/antique-books/:id" element={<AntiqueBookOverview />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Route>
  </>
);

export default ProtectedRoutes;
