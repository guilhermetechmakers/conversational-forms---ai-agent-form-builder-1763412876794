import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, MessageSquare, Zap, Shield, BarChart3, Users } from "lucide-react";
import { Link } from "react-router-dom";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Conversational Forms</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 animate-fade-in-up">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6">
            Transform Forms into Conversations
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Build AI-powered conversational agents that collect structured data through natural, engaging chat experiences.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="btn-hover">
                Start Building <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to build conversational forms
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="card-hover">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>AI-Powered Conversations</CardTitle>
                <CardDescription>
                  Natural language processing guides users through form completion with intelligent validation.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <Shield className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Secure & Compliant</CardTitle>
                <CardDescription>
                  Enterprise-grade security with GDPR compliance, encryption, and secure data handling.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <BarChart3 className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track completion rates, analyze drop-offs, and optimize your forms with detailed analytics.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <Users className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Team Collaboration</CardTitle>
                <CardDescription>
                  Invite team members, assign roles, and collaborate on building better conversational experiences.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <MessageSquare className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Customizable Personas</CardTitle>
                <CardDescription>
                  Define your agent's personality, tone, and appearance to match your brand.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="card-hover">
              <CardHeader>
                <Zap className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Webhook Integrations</CardTitle>
                <CardDescription>
                  Connect to your CRM, marketing tools, and databases with flexible webhook configurations.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-muted-foreground mb-8">
            Start free and scale as you grow. No credit card required.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Starter</CardTitle>
                <CardDescription>$0/month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 100 sessions/month</li>
                  <li>✓ 3 agents</li>
                  <li>✓ Basic analytics</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-primary">
              <CardHeader>
                <CardTitle>Professional</CardTitle>
                <CardDescription>$29/month</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ 1,000 sessions/month</li>
                  <li>✓ Unlimited agents</li>
                  <li>✓ Advanced analytics</li>
                  <li>✓ Webhook integrations</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>Custom</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>✓ Unlimited sessions</li>
                  <li>✓ Custom integrations</li>
                  <li>✓ Priority support</li>
                  <li>✓ Dedicated account manager</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="h-6 w-6 text-primary" />
                <span className="font-semibold">Conversational Forms</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Build better forms with AI-powered conversations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/docs" className="hover:text-foreground">Documentation</Link></li>
                <li><Link to="/pricing" className="hover:text-foreground">Pricing</Link></li>
                <li><Link to="/features" className="hover:text-foreground">Features</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/about" className="hover:text-foreground">About</Link></li>
                <li><Link to="/contact" className="hover:text-foreground">Contact</Link></li>
                <li><Link to="/careers" className="hover:text-foreground">Careers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/privacy-terms" className="hover:text-foreground">Privacy & Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
            © 2024 Conversational Forms. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
