import { Helmet } from 'react-helmet-async';
import { AdminLayout } from '../../layouts/AdminLayout';
import { Button } from '../../components/ui/button';
import { RefreshCw, Terminal } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function LogsPage() {
  const [logs, setLogs] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchLogs = async () => {
    setIsRefreshing(true);
    try {
      const res = await axios.get('/api/admin/logs');
      // API returns string[] directy
      const logData = Array.isArray(res.data) ? res.data.join('\n') : (res.data.logs || "No logs available.");
      setLogs(logData);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching logs.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    // Scroll to bottom on logs update
    if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <>
      <Helmet>
        <title>System Logs</title>
      </Helmet>
      
      <div className="flex flex-col h-[calc(100vh-140px)]">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-800 flex items-center gap-2">
                <Terminal className="w-6 h-6" /> System Logs
            </h1>
            <p className="text-stone-500 mt-1">Real-time application logs (last 1000 lines).</p>
          </div>
          <Button onClick={fetchLogs} disabled={isRefreshing} className="bg-stone-800 hover:bg-stone-900">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Logs
          </Button>
        </div>

        <div className="flex-1 bg-stone-950 rounded-xl shadow-inner border border-stone-800 overflow-hidden flex flex-col font-mono text-xs md:text-sm">
            <div className="bg-stone-900 px-4 py-2 border-b border-stone-800 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
            </div>
            <div 
                ref={scrollRef}
                className="flex-1 overflow-auto p-4 text-stone-300 whitespace-pre-wrap leading-relaxed select-text"
            >
                {logs}
            </div>
        </div>
      </div>
    </>
  );
}
