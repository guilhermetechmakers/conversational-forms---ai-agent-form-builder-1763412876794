import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Agent } from "@/types/agent";
import type { AnalyticsFilters as AnalyticsFiltersType } from "@/types/analytics";
import { format, subDays } from "date-fns";

interface AnalyticsFiltersProps {
  filters: AnalyticsFiltersType;
  onFiltersChange: (filters: AnalyticsFiltersType) => void;
}

export function AnalyticsFilters({
  filters,
  onFiltersChange,
}: AnalyticsFiltersProps) {

  const { data: agents = [] } = useQuery({
    queryKey: ['agents'],
    queryFn: () => api.get<Agent[]>('/agents'),
  });

  const handleDateRangeChange = (type: 'from' | 'to', value: string) => {
    onFiltersChange({
      ...filters,
      [`date_${type}`]: value || undefined,
    });
  };

  const handleAgentChange = (agentIds: string[]) => {
    onFiltersChange({
      ...filters,
      agent_ids: agentIds.length > 0 ? agentIds : undefined,
    });
  };

  const handleStatusChange = (status: string) => {
    onFiltersChange({
      ...filters,
      status: status as AnalyticsFiltersType['status'],
    });
  };

  const applyQuickFilter = (days: number) => {
    const to = format(new Date(), 'yyyy-MM-dd');
    const from = format(subDays(new Date(), days), 'yyyy-MM-dd');
    onFiltersChange({
      ...filters,
      date_from: from,
      date_to: to,
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters =
    filters.date_from ||
    filters.date_to ||
    (filters.agent_ids && filters.agent_ids.length > 0) ||
    (filters.status && filters.status !== 'all');

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs"
          >
            <X className="h-3 w-3 mr-1" />
            Clear
          </Button>
        )}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs">Quick Filters</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter(7)}
              className="text-xs"
            >
              7 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter(30)}
              className="text-xs"
            >
              30 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter(90)}
              className="text-xs"
            >
              90 Days
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => applyQuickFilter(365)}
              className="text-xs"
            >
              1 Year
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_from" className="text-xs">
            Date From
          </Label>
          <Input
            id="date_from"
            type="date"
            value={filters.date_from || ''}
            onChange={(e) => handleDateRangeChange('from', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="date_to" className="text-xs">
            Date To
          </Label>
          <Input
            id="date_to"
            type="date"
            value={filters.date_to || ''}
            onChange={(e) => handleDateRangeChange('to', e.target.value)}
            className="h-8 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs">
            Status
          </Label>
          <Select
            value={filters.status || 'all'}
            onValueChange={handleStatusChange}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="abandoned">Abandoned</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {agents.length > 0 && (
          <div className="space-y-2">
            <Label className="text-xs">Agents</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {agents.map((agent) => {
                const isSelected =
                  filters.agent_ids?.includes(agent.id) || false;
                return (
                  <div
                    key={agent.id}
                    className="flex items-center space-x-2 text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const currentIds = filters.agent_ids || [];
                        if (e.target.checked) {
                          handleAgentChange([...currentIds, agent.id]);
                        } else {
                          handleAgentChange(
                            currentIds.filter((id) => id !== agent.id)
                          );
                        }
                      }}
                      className="h-3 w-3 rounded border-input"
                    />
                    <Label className="text-xs font-normal cursor-pointer">
                      {agent.name}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
