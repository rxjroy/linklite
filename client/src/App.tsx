import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";

import PasswordUnlock from "@/pages/PasswordUnlock";

/**
 * App Router Configuration
 *
 * Routes:
 * - /            : Landing page
 * - /login       : Login page (redirects to dashboard if already logged in)
 * - /signup      : Signup page (redirects to dashboard if already logged in)
 * - /dashboard   : Dashboard (protected)
 * - /analytics   : Analytics (protected)
 * - /p/:slug     : Password unlock page for protected links
 * - /404         : Not found
 */

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  // Don't render routes until auth state is resolved
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Home} />

      {/* Redirect logged-in users away from auth pages */}
      <Route path="/login">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Login />}
      </Route>
      <Route path="/signup">
        {isAuthenticated ? <Redirect to="/dashboard" /> : <Signup />}
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      <Route path="/analytics">
        <ProtectedRoute>
          <Analytics />
        </ProtectedRoute>
      </Route>

      <Route path="/p/:slug" component={PasswordUnlock} />

      <Route path="/404" component={NotFound} />
      {/* Final fallback */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
