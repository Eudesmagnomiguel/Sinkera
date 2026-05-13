import { Bell, Package, CheckCircle2, Truck, Clock } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

function notificationDotColor(type: string): string {
  if (type === 'order_completed' || type === 'delivered') return 'bg-green-500';
  if (type === 'order_shipped' || type === 'shipped') return 'bg-blue-500';
  return 'bg-amber-500'; // pending / default
}

function notificationIcon(type: string) {
  if (type === 'order_completed' || type === 'delivered') return <CheckCircle2 className="w-4 h-4 text-green-500" />;
  if (type === 'order_shipped' || type === 'shipped') return <Truck className="w-4 h-4 text-blue-500" />;
  if (type === 'order' || type === 'order_created' || type === 'processing') return <Package className="w-4 h-4 text-amber-500" />;
  return <Clock className="w-4 h-4 text-amber-500" />;
}

export const NotificationBell = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = async (notification: any) => {
    await markAsRead(notification.id);
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-300">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="font-semibold text-sm">Notificações</span>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Marcar todas como lidas
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Bell className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">Sem notificações</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {notifications.map((notification) => (
                <li
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    !notification.read ? 'bg-accent/30' : ''
                  }`}
                >
                  {/* Left: colored dot + icon */}
                  <div className="relative flex-shrink-0 mt-0.5">
                    {notificationIcon(notification.type)}
                    <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-background ${notificationDotColor(notification.type)}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold leading-snug truncate">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notification.message}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>

                  {/* Unread indicator */}
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
