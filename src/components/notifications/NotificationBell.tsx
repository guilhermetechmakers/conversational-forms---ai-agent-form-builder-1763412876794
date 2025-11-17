import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUnreadNotificationCount, useNotifications } from "@/hooks/useNotifications";
import { NotificationDropdown } from "./NotificationDropdown";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const { data: unreadCount, isLoading: countLoading } = useUnreadNotificationCount();
  const { data: notifications, isLoading: notificationsLoading } = useNotifications({
    status: "unread",
    limit: 10,
  });

  const count = unreadCount?.count || 0;
  const hasUnread = count > 0;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Bell className="h-5 w-5" />
          {countLoading ? (
            <Skeleton className="absolute -right-1 -top-1 h-5 w-5 rounded-full" />
          ) : hasUnread ? (
            <Badge
              variant="destructive"
              className={cn(
                "absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs font-semibold",
                "animate-bounce-in"
              )}
            >
              {count > 99 ? "99+" : count}
            </Badge>
          ) : null}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[380px] p-0 animate-fade-in-up"
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <NotificationDropdown
          notifications={notifications || []}
          isLoading={notificationsLoading}
          onClose={() => setOpen(false)}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
