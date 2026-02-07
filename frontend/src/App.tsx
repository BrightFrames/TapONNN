import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import Template from "./pages/Template";
import TemplateMarketplace from "./pages/TemplateMarketplace";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import Design from "./pages/Design";
import Shop from "./pages/Shop";
import Audience from "./pages/Audience";
import Overview from "./pages/Overview";
import Earnings from "./pages/Earnings";
import Orders from "./pages/Orders";
import EarnOverview from "./pages/EarnOverview";
import Settings from "./pages/Settings";
import PublicProfile from "./pages/PublicProfile";
import PublicStore from "./pages/PublicStore_New";
import BusinessProfile from "./pages/BusinessProfile";
import LinktreeMarketplace from "./pages/LinktreeMarketplace";
import MyApps from "./pages/MyApps";
import Enquiries from "./pages/Enquiries";
import Media from "./pages/Media";
import NFCCards from "./pages/NFCCards";
import NfcStore from "./pages/NfcStore";
import Explore from "./pages/Explore";
import LikedProducts from "./pages/LikedProducts";
import Messages from "./pages/Messages";
import Updates from "./pages/Updates";
import CreateStore from "./pages/CreateStore";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/templates" element={<Template />} />
            <Route path="/template-marketplace" element={<TemplateMarketplace />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/liked" element={<ProtectedRoute><LikedProducts /></ProtectedRoute>} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Routes - Require Authentication */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/overview" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/insights" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
            <Route path="/shop" element={<ProtectedRoute><Shop /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
            <Route path="/audience" element={<ProtectedRoute><Audience /></ProtectedRoute>} />
            <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
            <Route path="/design" element={<ProtectedRoute><Design /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/enquiries" element={<ProtectedRoute><Enquiries /></ProtectedRoute>} />
            <Route path="/dashboard/business" element={<ProtectedRoute><BusinessProfile /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><LinktreeMarketplace /></ProtectedRoute>} />
            <Route path="/my-apps" element={<ProtectedRoute><MyApps /></ProtectedRoute>} />
            <Route path="/media" element={<ProtectedRoute><Media /></ProtectedRoute>} />
            <Route path="/nfc-cards" element={<ProtectedRoute><NFCCards /></ProtectedRoute>} />
            <Route path="/connect-device" element={<ProtectedRoute><NfcStore /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/updates" element={<ProtectedRoute><Updates /></ProtectedRoute>} />
            <Route path="/create-store" element={<ProtectedRoute><CreateStore /></ProtectedRoute>} />

            {/* Earn Routes */}
            <Route path="/dashboard/earn" element={<ProtectedRoute><EarnOverview /></ProtectedRoute>} />
            <Route path="/dashboard/earn/history" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />

            {/* Public Store - Must be before username catch-all */}
            <Route path="/s/:username" element={<PublicProfile />} />
            <Route path="/:username/store" element={<PublicStore />} />
            <Route path="/:username/store/product/:productId" element={<PublicStore />} />

            {/* Public Profile - Must be last to avoid catching other routes */}
            <Route path="/:username" element={<PublicProfile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

