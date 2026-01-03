import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/button';
import { Link, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { ChevronLeft, Package, User, MapPin, MessageCircle, CheckCircle, XCircle, Send } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import cable from '../lib/cable';
import axios from 'axios';
import type { Message } from '../types';

import { getStatusColor, getStatusLabel } from '../lib/statusHelpers';

export default function SellerOrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (id) {
         Promise.all([
             axios.get(`/api/seller/orders/${id}`),
             axios.get(`/api/orders/${id}/messages`)
         ]).then(([orderRes, msgRes]) => {
             setOrder(orderRes.data);
             setMessages(msgRes.data);
         }).catch(console.error)
           .finally(() => setLoading(false));
     }
  }, [id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!order) return;
    const channel = cable.subscriptions.create(
      { channel: "OrderChannel", order_id: order.id },
      {
        received: (data: Message) => {
          setMessages(prev => {
            if (prev.find(m => m.id === data.id)) return prev;
            return [...prev, data];
          });
        }
      }
    );

    return () => {
      channel.unsubscribe();
    };
  }, [order?.id]);

  const updateStatus = (newStatus: string) => {
    Swal.fire({
      title: 'Schimbare Status',
      text: `Ești sigur că vrei să schimbi statusul în ${getStatusLabel(newStatus)}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#4a7c59',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Da, schimbă!',
      cancelButtonText: 'Anulează'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
            await axios.patch(`/api/seller/orders/${order.id}`, { status: newStatus });
            toast.success('Status actualizat cu succes!');
            // update local order
            setOrder((prev: any) => ({ ...prev, status: newStatus }));
        } catch (e) {
            console.error(e);
            toast.error('Eroare la actualizarea statusului.');
        }
      }
    });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;
    
    setIsSending(true);
    
    try {
      const response = await axios.post(`/api/orders/${order.id}/messages`, { content: newMessage });
      setMessages(prev => [...prev, response.data as any]);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Mesajul nu a putut fi trimis.');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Se încarcă detaliile comenzii...</div>;
  if (!order) return <div className="p-8 text-center text-stone-500">Comandă inexistentă.</div>;
  
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/seller/orders" className="inline-flex items-center text-stone-500 hover:text-stone-700 mb-6">
        <ChevronLeft className="h-4 w-4 mr-2" /> Înapoi la listă
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
             <div className="p-6 border-b border-stone-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                   <div className="flex items-center gap-3 mb-1">
                      <h1 className="text-2xl font-serif font-bold text-stone-800">Comanda #{order.id}</h1>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                   </div>
                   <p className="text-stone-500 text-sm">
                     Plasată la {new Date(order.createdAt).toLocaleString('ro-RO')}
                   </p>
                </div>
                
                <div className="flex flex-wrap gap-2">
                   {order.status === 'NewOrder' && (
                     <>
                        <Button 
                          className="bg-fern text-white"
                          onClick={() => updateStatus('Confirmed')}
                        >
                          <CheckCircle className="h-4 w-4 mr-2" /> Confirmă Comandă
                        </Button>
                        <Button 
                          variant="outline" 
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => updateStatus('Cancelled')}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Respinge
                        </Button>
                     </>
                   )}
                   {order.status === 'Confirmed' && (
                      <Button 
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() => updateStatus('Completed')}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" /> Marchează ca Finalizată
                      </Button>
                   )}
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="p-6 border-b md:border-b-0 md:border-r border-stone-100">
                   <h3 className="text-xs uppercase font-bold text-stone-400 mb-4 tracking-wider">Informații Client</h3>
                   <div className="space-y-3">
                      <div className="flex items-start">
                         <User className="h-5 w-5 mr-3 text-stone-400" />
                         <div>
                            <p className="font-bold text-stone-800">{order.buyer?.name || 'Client'}</p>
                            <p className="text-sm text-stone-500">Client</p>
                         </div>
                      </div>
                      <div className="flex items-start">
                         <MapPin className="h-5 w-5 mr-3 text-stone-400" />
                         <div>
                            <p className="font-bold text-stone-800">{order.location || order.buyer?.location || 'Nespecificată'}</p>
                            <p className="text-sm text-stone-500">Locație Livrare</p>
                         </div>
                      </div>
                   </div>
                </div>
                
                <div className="p-6 bg-stone-50/30">
                   <h3 className="text-xs uppercase font-bold text-stone-400 mb-4 tracking-wider">Sumar Plată</h3>
                   <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                         <span className="text-stone-500">Produse</span>
                         <span className="text-stone-800 font-medium">{order.totalPrice?.toFixed(2)} RON</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-stone-500">Livrare</span>
                         <span className="text-stone-800 font-medium text-green-600">GRATUIT (Cash on Delivery)</span>
                      </div>
                      <div className="pt-2 border-t border-stone-100 flex justify-between items-center">
                         <span className="font-bold text-stone-800">Total de încasat</span>
                         <span className="text-xl font-bold text-fern">{order.totalPrice?.toFixed(2)} RON</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
             <div className="p-6 border-b border-stone-100">
                <h2 className="text-xl font-bold font-serif flex items-center">
                   <Package className="h-5 w-5 mr-2 text-fern" /> Produse Comandate
                </h2>
             </div>
             <div className="divide-y divide-stone-100">
                {order.items?.map((item: any) => (
                   <div key={item.id} className="p-4 flex justify-between items-center">
                      <div>
                         <p className="font-bold text-stone-800">{item.productName}</p>
                         <p className="text-sm text-stone-500">{item.quantity} x {item.priceAtPurchase} RON</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-800">{(item.priceAtPurchase * item.quantity).toFixed(2)} RON</p>
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>

        {/* Chat Column */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-stone-100 h-[600px] flex flex-col sticky top-24 overflow-hidden">
            <div className="p-4 border-b border-stone-100 bg-fern/5">
              <h3 className="font-bold text-fern flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat cu Clientul
              </h3>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50/50">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-400 text-center p-4">
                  <MessageCircle className="h-8 w-8 mb-2 opacity-20" />
                  <p className="text-sm">Niciun mesaj încă.<br/>Salută clientul!</p>
                </div>
              ) : (
                messages.map((msg: any) => {
                  const senderId = msg.userId || msg.senderId;
                  const timestamp = msg.createdAt || msg.timestamp;
                  const isMe = Number(senderId) === Number(user?.id);
                  
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[85%]", isMe ? "ml-auto items-end" : "mr-auto items-start")}>
                      <div className={cn("px-4 py-2 rounded-2xl text-sm shadow-sm", isMe ? "bg-fern text-white rounded-br-none" : "bg-white text-stone-800 border border-stone-100 rounded-bl-none")}>
                        {msg.text || msg.content}
                      </div>
                      <span className="text-[10px] text-stone-400 mt-1 px-1 flex items-center gap-1">
                        {!isMe && <span>{msg.userName || msg.senderName} • </span>}
                        {new Date(timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 bg-white border-t border-stone-100">
              <form onSubmit={handleSendMessage} className="flex gap-2 relative">
                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value.slice(0, 1000))}
                  placeholder="Scrie un mesaj..."
                  disabled={isSending}
                  className="flex-grow px-3 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-fern bg-stone-50 text-sm disabled:opacity-50"
                  maxLength={1000}
                />
                <Button size="icon" type="submit" disabled={isSending || !newMessage.trim()} className="flex-shrink-0">
                   <Send className="h-4 w-4" />
                </Button>
                {newMessage.length > 900 && (
                  <span className="absolute -top-6 right-0 text-[10px] text-stone-400">
                    {newMessage.length}/1000
                  </span>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
