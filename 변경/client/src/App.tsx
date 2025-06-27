import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/contexts/AppContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { Navbar } from "@/components/Navbar";
import { useApp } from "@/contexts/AppContext";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";

// Pages
import Home from "@/pages/Home";
import Recipes from "@/pages/Recipes";
import RecipeDetail from "@/pages/RecipeDetail";
import CreateRecipe from "@/pages/CreateRecipe";
import Ingredients from "@/pages/Ingredients";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import NotFound from "@/pages/not-found";

function AuthChecker() {
  // 임시로 비활성화 - 무한 인증 호출 방지
  return null;
}

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AuthChecker />
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/recipes" component={Recipes} />
        <Route path="/recipes/create" component={CreateRecipe} />
        <Route path="/recipes/:id" component={RecipeDetail} />
        <Route path="/ingredients" component={Ingredients} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </LanguageProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
