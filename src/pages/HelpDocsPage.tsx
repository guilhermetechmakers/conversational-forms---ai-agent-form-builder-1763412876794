import { useState, useMemo } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  Rocket, 
  Code, 
  MessageSquare, 
  ExternalLink,
  ThumbsUp,
  Clock,
  ChevronRight,
  FileText,
  PlayCircle
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supportApi } from "@/lib/api/support";
import type { Documentation, Tutorial, DocCategory } from "@/types/help";
import { FeedbackModal } from "@/components/help/FeedbackModal";
import { SupportTicketModal } from "@/components/help/SupportTicketModal";
import { toast } from "sonner";

export function HelpDocsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<DocCategory | "all">("all");
  const [selectedDoc, setSelectedDoc] = useState<Documentation | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("docs");

  // Search query
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['help', 'search', searchQuery, selectedCategory],
    queryFn: () => {
      if (!searchQuery.trim()) return null;
      const category = selectedCategory !== "all" ? selectedCategory : undefined;
      return supportApi.searchDocs(searchQuery, category);
    },
    enabled: searchQuery.trim().length > 0,
  });

  // Popular docs
  const { data: popularDocs, isLoading: popularLoading } = useQuery({
    queryKey: ['help', 'popular'],
    queryFn: () => supportApi.getPopularDocs(5),
    initialData: [],
  });

  // Docs by category
  const { data: articles, isLoading: articlesLoading } = useQuery({
    queryKey: ['help', 'docs', 'articles'],
    queryFn: () => supportApi.getDocsByCategory('articles'),
    initialData: [],
  });

  const { data: faqs, isLoading: faqsLoading } = useQuery({
    queryKey: ['help', 'docs', 'faqs'],
    queryFn: () => supportApi.getDocsByCategory('faqs'),
    initialData: [],
  });

  const { data: quickstart, isLoading: quickstartLoading } = useQuery({
    queryKey: ['help', 'docs', 'quickstart'],
    queryFn: () => supportApi.getDocsByCategory('quickstart'),
    initialData: [],
  });

  // Tutorials
  const { data: tutorials, isLoading: tutorialsLoading } = useQuery({
    queryKey: ['help', 'tutorials'],
    queryFn: () => supportApi.getTutorials(),
    initialData: [],
  });

  // API Docs
  const { data: apiDocs, isLoading: apiDocsLoading } = useQuery({
    queryKey: ['help', 'api-docs'],
    queryFn: () => supportApi.getAPIDocs(),
    initialData: [],
  });

  const categories: { value: DocCategory | "all"; label: string; icon: typeof BookOpen }[] = [
    { value: "all", label: "All", icon: Search },
    { value: "articles", label: "Articles", icon: BookOpen },
    { value: "faqs", label: "FAQs", icon: HelpCircle },
    { value: "quickstart", label: "Quickstart", icon: Rocket },
    { value: "troubleshooting", label: "Troubleshooting", icon: Code },
  ];

  const displayedDocs = useMemo(() => {
    if (searchQuery.trim() && searchResults) {
      return searchResults.docs;
    }
    if (selectedCategory === "all") {
      return [...articles, ...faqs, ...quickstart].slice(0, 10);
    }
    if (selectedCategory === "articles") return articles;
    if (selectedCategory === "faqs") return faqs;
    if (selectedCategory === "quickstart") return quickstart;
    return [];
  }, [searchQuery, searchResults, selectedCategory, articles, faqs, quickstart]);

  const displayedTutorials = useMemo(() => {
    if (searchQuery.trim() && searchResults) {
      return searchResults.tutorials;
    }
    return tutorials;
  }, [searchQuery, searchResults, tutorials]);

  const handleDocClick = async (doc: Documentation) => {
    try {
      const fullDoc = await supportApi.getDoc(doc.id);
      setSelectedDoc(fullDoc);
      setActiveTab("docs");
    } catch (error) {
      toast.error("Failed to load documentation");
    }
  };

  const handleTutorialClick = async (tutorial: Tutorial) => {
    try {
      const fullTutorial = await supportApi.getTutorial(tutorial.id);
      setSelectedTutorial(fullTutorial);
      setActiveTab("tutorials");
    } catch (error) {
      toast.error("Failed to load tutorial");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in-up">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Help & Documentation</h1>
          <p className="text-muted-foreground mt-1">
            Find answers, tutorials, and guides to help you get the most out of Conversational Forms
          </p>
        </div>

        {/* Search Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search documentation, tutorials, FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
                className="btn-hover"
              >
                <Icon className="h-4 w-4 mr-2" />
                {category.label}
              </Button>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="docs">Documentation</TabsTrigger>
            <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
            <TabsTrigger value="support">Support</TabsTrigger>
            <TabsTrigger value="api">API Docs</TabsTrigger>
          </TabsList>

          {/* Documentation Tab */}
          <TabsContent value="docs" className="space-y-4">
            {selectedDoc ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedDoc.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary">{selectedDoc.category}</Badge>
                        {selectedDoc.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDoc(null)}
                    >
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: selectedDoc.content }}
                  />
                  <Separator className="my-6" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date(selectedDoc.last_updated).toLocaleDateString()}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Was this helpful?
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Popular Docs */}
                {!searchQuery && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Popular Articles</CardTitle>
                      <CardDescription>Most viewed documentation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {popularLoading ? (
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <Skeleton key={i} className="h-16 w-full" />
                          ))}
                        </div>
                      ) : popularDocs && popularDocs.length > 0 ? (
                        <div className="space-y-3">
                          {popularDocs.map((doc) => (
                            <div
                              key={doc.id}
                              onClick={() => handleDocClick(doc)}
                              className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer card-hover"
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <FileText className="h-5 w-5 text-primary mt-0.5" />
                                <div className="flex-1">
                                  <h3 className="font-semibold">{doc.title}</h3>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {doc.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                                  </p>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {doc.category}
                                    </Badge>
                                    {doc.views && (
                                      <span className="text-xs text-muted-foreground">
                                        {doc.views} views
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">
                          No popular articles yet
                        </p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Search Results or Category Docs */}
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {searchQuery ? `Search Results (${searchResults?.total || 0})` : "Documentation"}
                    </CardTitle>
                    <CardDescription>
                      {searchQuery 
                        ? `Results for "${searchQuery}"`
                        : "Browse articles, FAQs, and guides"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {searchLoading || articlesLoading || faqsLoading || quickstartLoading ? (
                      <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <Skeleton key={i} className="h-20 w-full" />
                        ))}
                      </div>
                    ) : displayedDocs && displayedDocs.length > 0 ? (
                      <div className="space-y-3">
                        {displayedDocs.map((doc) => (
                          <div
                            key={doc.id}
                            onClick={() => handleDocClick(doc)}
                            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer card-hover"
                          >
                            <div className="flex items-start gap-3 flex-1">
                              <FileText className="h-5 w-5 text-primary mt-0.5" />
                              <div className="flex-1">
                                <h3 className="font-semibold">{doc.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {doc.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {doc.category}
                                  </Badge>
                                  {doc.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No documentation found</h3>
                        <p className="text-muted-foreground">
                          {searchQuery 
                            ? "Try a different search term"
                            : "Documentation will appear here"}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          {/* Tutorials Tab */}
          <TabsContent value="tutorials" className="space-y-4">
            {selectedTutorial ? (
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedTutorial.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {selectedTutorial.description}
                      </CardDescription>
                      {selectedTutorial.estimated_time && (
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Estimated time: {selectedTutorial.estimated_time} minutes
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTutorial(null)}
                    >
                      Back
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {selectedTutorial.steps
                      .sort((a, b) => a.order - b.order)
                      .map((step, index) => (
                        <div key={step.id} className="space-y-2">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-semibold text-primary">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold mb-2">{step.title}</h4>
                              <div 
                                className="prose prose-sm max-w-none text-muted-foreground"
                                dangerouslySetInnerHTML={{ __html: step.content }}
                              />
                              {step.media_url && (
                                <div className="mt-3">
                                  <img 
                                    src={step.media_url} 
                                    alt={step.title}
                                    className="rounded-lg border"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                          {index < selectedTutorial.steps.length - 1 && (
                            <Separator className="my-4" />
                          )}
                        </div>
                      ))}
                  </div>
                  <Separator className="my-6" />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Tutorial: {selectedTutorial.category}
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFeedbackModalOpen(true)}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Was this helpful?
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Tutorial Walkthroughs</CardTitle>
                  <CardDescription>
                    Step-by-step guides to help you get started
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {tutorialsLoading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : displayedTutorials && displayedTutorials.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      {displayedTutorials.map((tutorial) => (
                        <Card
                          key={tutorial.id}
                          className="cursor-pointer card-hover"
                          onClick={() => handleTutorialClick(tutorial)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                                <CardDescription className="mt-2">
                                  {tutorial.description}
                                </CardDescription>
                              </div>
                              <PlayCircle className="h-6 w-6 text-primary flex-shrink-0 ml-2" />
                            </div>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <Badge variant="secondary">
                                  {tutorial.steps.length} steps
                                </Badge>
                                {tutorial.estimated_time && (
                                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    {tutorial.estimated_time} min
                                  </div>
                                )}
                              </div>
                              <ChevronRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <PlayCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No tutorials found</h3>
                      <p className="text-muted-foreground">
                        Tutorials will appear here
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Support</CardTitle>
                  <CardDescription>
                    Need help? Submit a support ticket and we'll get back to you.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => setSupportModalOpen(true)}
                    className="w-full"
                  >
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Submit Support Ticket
                  </Button>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Other ways to reach us:</p>
                    <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                      <li>Email: support@conversationalforms.com</li>
                      <li>Response time: Usually within 24 hours</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Common Issues</CardTitle>
                  <CardDescription>
                    Quick solutions to frequently asked questions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {faqs.slice(0, 3).map((faq) => (
                      <div
                        key={faq.id}
                        onClick={() => handleDocClick(faq)}
                        className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      >
                        <h4 className="font-medium text-sm">{faq.title}</h4>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* API Docs Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Documentation</CardTitle>
                <CardDescription>
                  Complete API reference for developers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiDocsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-20 w-full" />
                    ))}
                  </div>
                ) : apiDocs && apiDocs.length > 0 ? (
                  <div className="space-y-4">
                    {apiDocs.map((apiDoc) => (
                      <Card key={apiDoc.id} className="card-hover">
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className="font-mono">
                                  {apiDoc.method}
                                </Badge>
                                <code className="text-sm font-mono">{apiDoc.endpoint}</code>
                              </div>
                              <CardDescription>{apiDoc.description}</CardDescription>
                            </div>
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        {apiDoc.parameters && apiDoc.parameters.length > 0 && (
                          <CardContent>
                            <h4 className="font-semibold text-sm mb-2">Parameters:</h4>
                            <div className="space-y-2">
                              {apiDoc.parameters.map((param, idx) => (
                                <div key={idx} className="text-sm">
                                  <code className="font-mono">{param.name}</code>
                                  <span className="text-muted-foreground"> ({param.type})</span>
                                  {param.required && (
                                    <Badge variant="destructive" className="ml-2 text-xs">
                                      Required
                                    </Badge>
                                  )}
                                  <p className="text-muted-foreground mt-1">{param.description}</p>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Code className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">API Documentation</h3>
                    <p className="text-muted-foreground mb-4">
                      Complete API reference coming soon
                    </p>
                    <Button variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Full API Docs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        docId={selectedDoc?.id}
        tutorialId={selectedTutorial?.id}
      />
      <SupportTicketModal
        open={supportModalOpen}
        onOpenChange={setSupportModalOpen}
      />
    </DashboardLayout>
  );
}
