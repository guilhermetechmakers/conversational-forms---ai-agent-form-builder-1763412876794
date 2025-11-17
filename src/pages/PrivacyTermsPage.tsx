import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MessageSquare, ArrowLeft, Mail, Loader2, CheckCircle2, FileText, Shield, Cookie } from "lucide-react";
import { legalApi } from "@/lib/api/legal";
import { legalRequestSchema, type LegalRequestFormData } from "@/lib/validations/legal";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export function PrivacyTermsPage() {
  // Get user - may be null for unauthenticated users (this is a public page)
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  // Get initial tab from URL parameter, default to "privacy"
  const validTabs = ["privacy", "terms", "cookies"] as const;
  const tabFromUrl = searchParams.get("tab");
  const initialTab = tabFromUrl && validTabs.includes(tabFromUrl as typeof validTabs[number]) ? tabFromUrl : "privacy";
  const [activeTab, setActiveTab] = useState(initialTab);

  // Update URL when tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // Sync tab with URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && validTabs.includes(tabFromUrl as typeof validTabs[number]) && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams, activeTab]);

  // Log page view on mount
  useEffect(() => {
    const logPageView = async () => {
      try {
        await legalApi.logInteraction({
          interactionType: 'PageView',
          metadata: {
            page: 'privacy-terms',
            tab: activeTab,
          },
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.error('Failed to log page view:', error);
      }
    };

    logPageView();
  }, [activeTab]);

  // Log section view when tab changes
  useEffect(() => {
    const logSectionView = async () => {
      try {
        await legalApi.logInteraction({
          interactionType: 'SectionView',
          metadata: {
            section: activeTab,
          },
        });
      } catch (error) {
        // Silently fail
        console.error('Failed to log section view:', error);
      }
    };

    if (activeTab) {
      logSectionView();
    }
  }, [activeTab]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<LegalRequestFormData>({
    resolver: zodResolver(legalRequestSchema),
    defaultValues: {
      name: "",
      email: user?.email || "",
      inquiryType: "other",
      message: "",
    },
  });

  const inquiryType = watch("inquiryType");

  const onSubmit = async (data: LegalRequestFormData) => {
    setIsSubmitting(true);
    try {
      await legalApi.logInteraction({
        interactionType: 'ContactClick',
        metadata: {
          inquiryType: data.inquiryType,
        },
      });

      await legalApi.submitLegalRequest(data);
      setIsSuccess(true);
      reset();
      toast.success("Your request has been submitted successfully. We'll get back to you soon!");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to submit request";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <ArrowLeft className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Back to Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" />
            <span className="text-xl font-semibold">Conversational Forms</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="animate-fade-in-up">
          {/* Page Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy & Terms</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Learn about how we protect your data and the terms that govern your use of our service.
            </p>
          </div>

          {/* Tabs Navigation */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="privacy" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Privacy Policy
              </TabsTrigger>
              <TabsTrigger value="terms" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Terms of Service
              </TabsTrigger>
              <TabsTrigger value="cookies" className="flex items-center gap-2">
                <Cookie className="h-4 w-4" />
                Cookie Policy
              </TabsTrigger>
            </TabsList>

            {/* Privacy Policy Content */}
            <TabsContent value="privacy" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Privacy Policy</CardTitle>
                  <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div className="space-y-6 text-muted-foreground">
                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">1. Information We Collect</h3>
                      <p>
                        We collect information that you provide directly to us, including:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Account information (name, email address, password)</li>
                        <li>Workspace and agent configuration data</li>
                        <li>Session transcripts and collected form data</li>
                        <li>Payment and billing information</li>
                        <li>Support communications and feedback</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">2. How We Use Your Information</h3>
                      <p>We use the information we collect to:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Provide, maintain, and improve our services</li>
                        <li>Process transactions and send related information</li>
                        <li>Send technical notices, updates, and support messages</li>
                        <li>Respond to your comments and questions</li>
                        <li>Monitor and analyze usage patterns and trends</li>
                        <li>Detect, prevent, and address technical issues</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">3. Data Security</h3>
                      <p>
                        We implement appropriate technical and organizational measures to protect your personal data
                        against unauthorized access, alteration, disclosure, or destruction. This includes:
                      </p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Encryption of data in transit (TLS) and at rest (AES-256)</li>
                        <li>Secure key management and access controls</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>Employee training on data protection</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">4. Your Rights</h3>
                      <p>You have the right to:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Access your personal data</li>
                        <li>Correct inaccurate or incomplete data</li>
                        <li>Request deletion of your data</li>
                        <li>Object to processing of your data</li>
                        <li>Request data portability</li>
                        <li>Withdraw consent at any time</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">5. Data Retention</h3>
                      <p>
                        We retain your personal data only for as long as necessary to fulfill the purposes outlined
                        in this policy, unless a longer retention period is required by law. When data is no longer
                        needed, we securely delete or anonymize it.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">6. Contact Us</h3>
                      <p>
                        If you have questions about this Privacy Policy or wish to exercise your rights, please contact
                        us using the form below or at{" "}
                        <a href="mailto:privacy@conversationalforms.com" className="text-primary hover:underline">
                          privacy@conversationalforms.com
                        </a>
                        .
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms of Service Content */}
            <TabsContent value="terms" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Terms of Service</CardTitle>
                  <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div className="space-y-6 text-muted-foreground">
                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">1. Acceptance of Terms</h3>
                      <p>
                        By accessing or using Conversational Forms, you agree to be bound by these Terms of Service
                        and all applicable laws and regulations. If you do not agree with any of these terms, you are
                        prohibited from using or accessing this service.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">2. Use License</h3>
                      <p>Permission is granted to temporarily use Conversational Forms for personal and commercial
                        purposes, subject to the following restrictions:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>You may not modify or copy the materials</li>
                        <li>You may not use the materials for any commercial purpose without express written consent</li>
                        <li>You may not attempt to reverse engineer or decompile the software</li>
                        <li>You may not remove any copyright or proprietary notations</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">3. User Accounts</h3>
                      <p>When you create an account, you agree to:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Provide accurate, current, and complete information</li>
                        <li>Maintain and update your information to keep it accurate</li>
                        <li>Maintain the security of your password and account</li>
                        <li>Accept responsibility for all activities under your account</li>
                        <li>Notify us immediately of any unauthorized use</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">4. Acceptable Use</h3>
                      <p>You agree not to use the service to:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Violate any applicable laws or regulations</li>
                        <li>Infringe upon the rights of others</li>
                        <li>Transmit harmful, offensive, or illegal content</li>
                        <li>Interfere with or disrupt the service or servers</li>
                        <li>Attempt to gain unauthorized access to any part of the service</li>
                        <li>Collect or store personal data about other users without consent</li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">5. Payment and Billing</h3>
                      <p>
                        Subscription fees are billed in advance on a monthly or annual basis. You are responsible for
                        providing accurate payment information and authorizing charges. We reserve the right to change
                        our pricing with 30 days notice. Refunds are handled according to our refund policy.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">6. Termination</h3>
                      <p>
                        We may terminate or suspend your account and access to the service immediately, without prior
                        notice, for conduct that we believe violates these Terms of Service or is harmful to other
                        users, us, or third parties.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">7. Limitation of Liability</h3>
                      <p>
                        In no event shall Conversational Forms or its suppliers be liable for any damages (including,
                        without limitation, damages for loss of data or profit, or due to business interruption) arising
                        out of the use or inability to use the service, even if we have been notified of the
                        possibility of such damage.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cookie Policy Content */}
            <TabsContent value="cookies" className="space-y-6">
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="text-2xl">Cookie Policy</CardTitle>
                  <CardDescription>Last updated: {new Date().toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <div className="space-y-6 text-muted-foreground">
                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">1. What Are Cookies</h3>
                      <p>
                        Cookies are small text files that are placed on your device when you visit a website. They are
                        widely used to make websites work more efficiently and provide information to the website owners.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">2. How We Use Cookies</h3>
                      <p>We use cookies for the following purposes:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                          <strong>Essential Cookies:</strong> Required for the website to function properly, including
                          authentication and security features
                        </li>
                        <li>
                          <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website
                          by collecting and reporting information anonymously
                        </li>
                        <li>
                          <strong>Preference Cookies:</strong> Remember your settings and preferences for a better
                          experience
                        </li>
                        <li>
                          <strong>Marketing Cookies:</strong> Used to track visitors across websites for marketing
                          purposes (with your consent)
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">3. Types of Cookies We Use</h3>
                      <div className="space-y-4 mt-4">
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Session Cookies</h4>
                          <p>
                            Temporary cookies that are deleted when you close your browser. These are essential for
                            maintaining your session and security.
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Persistent Cookies</h4>
                          <p>
                            Remain on your device for a set period or until you delete them. These help us remember your
                            preferences and improve your experience.
                          </p>
                        </div>
                      </div>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">4. Third-Party Cookies</h3>
                      <p>
                        We may use third-party services that set cookies on your device. These include analytics services
                        (such as Google Analytics) and payment processors. These cookies are subject to the respective
                        third-party privacy policies.
                      </p>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">5. Managing Cookies</h3>
                      <p>You can control and manage cookies in several ways:</p>
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>
                          Browser settings: Most browsers allow you to refuse or accept cookies. However, blocking
                          essential cookies may impact website functionality.
                        </li>
                        <li>
                          Cookie preferences: Use our cookie preference center (if available) to manage your
                          preferences.
                        </li>
                        <li>
                          Opt-out tools: Use industry opt-out tools for advertising cookies.
                        </li>
                      </ul>
                    </section>

                    <Separator />

                    <section>
                      <h3 className="text-xl font-semibold text-foreground mb-3">6. Changes to This Policy</h3>
                      <p>
                        We may update this Cookie Policy from time to time. We will notify you of any changes by posting
                        the new policy on this page and updating the "Last updated" date.
                      </p>
                    </section>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Contact Form Section */}
          <Card className="shadow-card mt-12">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <CardTitle>Contact for Legal Requests</CardTitle>
              </div>
              <CardDescription>
                Have questions about our policies or need to submit a legal request? Fill out the form below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8 space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Request Submitted Successfully</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We've received your request and will get back to you within 2-3 business days.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsSuccess(false);
                        reset();
                      }}
                    >
                      Submit Another Request
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        placeholder="Your full name"
                        {...register("name")}
                        className={errors.name ? "border-destructive" : ""}
                      />
                      {errors.name && (
                        <p className="text-sm text-destructive">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        {...register("email")}
                        className={errors.email ? "border-destructive" : ""}
                      />
                      {errors.email && (
                        <p className="text-sm text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="inquiryType">Inquiry Type *</Label>
                    <Select
                      value={inquiryType}
                      onValueChange={(value) => setValue("inquiryType", value as LegalRequestFormData["inquiryType"])}
                    >
                      <SelectTrigger className={errors.inquiryType ? "border-destructive" : ""}>
                        <SelectValue placeholder="Select inquiry type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="privacy">Privacy Policy</SelectItem>
                        <SelectItem value="terms">Terms of Service</SelectItem>
                        <SelectItem value="cookies">Cookie Policy</SelectItem>
                        <SelectItem value="data_request">Data Request (GDPR)</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.inquiryType && (
                      <p className="text-sm text-destructive">{errors.inquiryType.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please describe your inquiry or request..."
                      rows={6}
                      {...register("message")}
                      className={errors.message ? "border-destructive" : ""}
                    />
                    {errors.message && (
                      <p className="text-sm text-destructive">{errors.message.message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Minimum 10 characters, maximum 2000 characters
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full transition-all hover:scale-105 active:scale-95"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/50 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Conversational Forms. All rights reserved.</p>
            <div className="mt-4 flex justify-center gap-4">
              <Link to="/privacy-terms" className="hover:text-foreground transition-colors">
                Privacy & Terms
              </Link>
              <span>•</span>
              <Link to="/" className="hover:text-foreground transition-colors">
                Home
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
