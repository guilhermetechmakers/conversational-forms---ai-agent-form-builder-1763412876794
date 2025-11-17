import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search, MessageSquare } from "lucide-react";

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 md:p-8">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in-up">
        {/* Main Error Card */}
        <Card className="shadow-card hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto mb-2">
              <div className="text-8xl md:text-9xl font-bold text-muted-foreground/20 leading-none">
                404
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl md:text-3xl font-semibold">
                Page Not Found
              </CardTitle>
              <CardDescription className="text-base">
                The page you're looking for doesn't exist or has been moved.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/" className="flex-1">
                <Button className="w-full btn-hover">
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </Link>
              <Button 
                variant="outline" 
                className="w-full sm:flex-1 btn-hover" 
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Helpful Links */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Card className="card-hover cursor-pointer">
            <Link to="/dashboard">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Dashboard</CardTitle>
                    <CardDescription className="text-xs">
                      Return to your workspace
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
          
          <Card className="card-hover cursor-pointer">
            <Link to="/">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/10">
                    <Search className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Search</CardTitle>
                    <CardDescription className="text-xs">
                      Find what you're looking for
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
