import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import axios from 'axios';

interface Notification {
  id: number;
  type: string;
  params: any;
  text?: string;
  read_at: string | null;
  time_ago: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      // Axios automatically uses the interceptor from AuthContext to add the Bearer token
      const response = await axios.get('/api/notifications');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unread_count);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: number) => {
    try {
      await axios.post(`/api/notifications/${id}/mark_as_read`);
      // Optimistically update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
       console.error(error);
    }
  };

  const getNotificationText = (n: Notification) => {
      // Use params.text if available (from our backend logic)
      if (n.params?.text) return n.params.text;
      
      // Fallbacks
      if (n.type === 'new_order') return `Comandă nouă #${n.params.order_id}`;
      // Fix for params mapping if needed based on backend serialization
      if (n.params?.Element?.text) return n.params.Element.text; 

      if (n.type === 'order_confirmed') return `Comanda #${n.params.order_id} confirmată`;
      if (n.type === 'order_cancelled') return `Comanda #${n.params.order_id} anulată`;
      if (n.type === 'new_review') return `Recenzie nouă la ${n.params.product_name}`;
      return 'Notificare nouă';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
          <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
            <h3 className="font-semibold text-gray-700">Notificări</h3>
            {unreadCount > 0 && (
                <button 
                  onClick={async () => {
                      await axios.post('/api/notifications/mark_all_as_read');
                      fetchNotifications();
                  }}
                  className="text-xs text-green-600 hover:text-green-700 font-medium"
                >
                  Marchează tot citit
                </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">Nu ai notificări recente</div>
            ) : (
              notifications.map((notification) => (
                <button 
                  key={notification.id}
                  type="button"
                  onClick={() => notification.read_at === null && handleMarkAsRead(notification.id)}
                  className={`w-full text-left p-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors ${notification.read_at === null ? 'bg-green-50/50' : ''}`}
                >
                  <p className={`text-sm ${notification.read_at === null ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                    {getNotificationText(notification)}
                  </p>
                  <span className="text-xs text-gray-400 mt-1 block">{notification.time_ago}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
