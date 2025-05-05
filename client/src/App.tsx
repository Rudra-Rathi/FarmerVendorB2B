import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

// Pages
import HomePage from "@/pages/home";
import LoginPage from "@/pages/auth/login";
import RegisterPage from "@/pages/auth/register";
import ProfilePage from "@/pages/profile";
import NotFound from "@/pages/not-found";

// Farmer pages
import FarmerDashboard from "@/pages/farmer/dashboard";
import FarmerProduce from "@/pages/farmer/produce";
import FarmerOrders from "@/pages/farmer/orders";

// Vendor pages
import VendorDashboard from "@/pages/vendor/dashboard";
import VendorMarketplace from "@/pages/vendor/marketplace";
import VendorOrders from "@/pages/vendor/orders";

// Shared pages
import DailyMandi from "@/pages/daily-mandi";

function Router() {
  return (
    <Switch>
      {/* Home Page */}
      <Route path="/" component={HomePage} />
      
      {/* Auth Pages */}
      <Route path="/auth/login" component={LoginPage} />
      <Route path="/auth/register" component={RegisterPage} />
      <Route path="/profile" component={ProfilePage} />
      
      {/* Farmer Pages */}
      <Route path="/farmer/dashboard" component={FarmerDashboard} />
      <Route path="/farmer/produce" component={FarmerProduce} />
      <Route path="/farmer/orders" component={FarmerOrders} />
      
      {/* Vendor Pages */}
      <Route path="/vendor/dashboard" component={VendorDashboard} />
      <Route path="/vendor/marketplace" component={VendorMarketplace} />
      <Route path="/vendor/orders" component={VendorOrders} />
      
      {/* Shared Pages */}
      <Route path="/daily-mandi" component={DailyMandi} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
