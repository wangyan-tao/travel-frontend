import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import UserList from "./pages/admin/UserList";
import ApplicationList from "./pages/admin/ApplicationList";
import Login from "./pages/Login";
import Register from "./pages/Register";
import IdentityVerification from "./pages/IdentityVerification";
import GuarantorInfo from "./pages/GuarantorInfo";
import LoanProducts from "./pages/LoanProducts";
import LoanApplication from "./pages/LoanApplication";
import RepaymentManagement from "./pages/RepaymentManagement";
import AdminDashboard from "./pages/admin/Dashboard";
import MyApplications from "./pages/MyApplications";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <>
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/identity-verification" component={IdentityVerification} />
        <Route path="/guarantor-info" component={GuarantorInfo} />
        <Route path="/loan-products" component={LoanProducts} />
        <Route path="/loan-application/:id" component={LoanApplication} />
        <Route path="/repayment" component={RepaymentManagement} />
        <Route path="/my-applications" component={MyApplications} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/users" component={UserList} />
        <Route path="/admin/applications" component={ApplicationList} />
        <Route path="/admin/loans" component={ApplicationList} />
        <Route path="/404" component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
