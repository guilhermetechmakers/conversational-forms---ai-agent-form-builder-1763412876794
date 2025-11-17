import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { SessionSearchParams, SessionStatus } from "@/types/session";

interface SessionSearchFormProps {
  onSearch: (params: SessionSearchParams) => void;
  initialParams?: SessionSearchParams;
}

export function SessionSearchForm({
  onSearch,
  initialParams,
}: SessionSearchFormProps) {
  const [searchQuery, setSearchQuery] = useState(initialParams?.query || "");
  const [agentId, setAgentId] = useState(initialParams?.agent_id || "");
  const [status, setStatus] = useState<SessionStatus | "all">(
    (initialParams?.status as SessionStatus) || "all"
  );
  const [dateFrom, setDateFrom] = useState(initialParams?.date_from || "");
  const [dateTo, setDateTo] = useState(initialParams?.date_to || "");
  const [utmSource, setUtmSource] = useState(initialParams?.utm_source || "");
  const [utmCampaign, setUtmCampaign] = useState(
    initialParams?.utm_campaign || ""
  );

  const { data: agents = [] } = useQuery({
    queryKey: ["agents"],
    queryFn: () => api.get<Array<{ id: string; name: string }>>("/agents"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params: SessionSearchParams = {
      query: searchQuery || undefined,
      agent_id: agentId || undefined,
      status: status !== "all" ? status : undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
      utm_source: utmSource || undefined,
      utm_campaign: utmCampaign || undefined,
      page: 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    };
    onSearch(params);
  };

  const handleClear = () => {
    setSearchQuery("");
    setAgentId("");
    setStatus("all");
    setDateFrom("");
    setDateTo("");
    setUtmSource("");
    setUtmCampaign("");
    onSearch({
      page: 1,
      limit: 20,
      sort_by: "created_at",
      sort_order: "desc",
    });
  };

  const hasFilters =
    searchQuery ||
    agentId ||
    status !== "all" ||
    dateFrom ||
    dateTo ||
    utmSource ||
    utmCampaign;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search & Filter Sessions</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Search Query */}
          <div className="space-y-2">
            <Label htmlFor="search">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search transcripts, fields, or metadata..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Agent Filter */}
            <div className="space-y-2">
              <Label htmlFor="agent">Agent</Label>
              <Select value={agentId} onValueChange={setAgentId}>
                <SelectTrigger id="agent">
                  <SelectValue placeholder="All agents" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      {agent.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as SessionStatus | "all")}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="abandoned">Abandoned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label htmlFor="date_from">Date From</Label>
              <Input
                id="date_from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label htmlFor="date_to">Date To</Label>
              <Input
                id="date_to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* UTM Source */}
            <div className="space-y-2">
              <Label htmlFor="utm_source">UTM Source</Label>
              <Input
                id="utm_source"
                placeholder="e.g., google, facebook"
                value={utmSource}
                onChange={(e) => setUtmSource(e.target.value)}
              />
            </div>

            {/* UTM Campaign */}
            <div className="space-y-2">
              <Label htmlFor="utm_campaign">UTM Campaign</Label>
              <Input
                id="utm_campaign"
                placeholder="e.g., summer_sale"
                value={utmCampaign}
                onChange={(e) => setUtmCampaign(e.target.value)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            {hasFilters && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClear}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="submit">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
