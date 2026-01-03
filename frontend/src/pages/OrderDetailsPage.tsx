import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';
import { MessageCircle, Send, MapPin, ArrowLeft, Star, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import type { Message } from '../types';
import cable from '../lib/cable';

import { getStatusColor, getStatusLabel } from '../lib/statusHelpers';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Review state
  const [selectedProductForReview, setSelectedProductForReview] = useState<any>(null);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
     if (id && user) {
         Promise.all([
             axios.get(`/api/orders/${id}`),
             axios.get(`/api/orders/${id}/messages`)
         ]).then(([orderRes, msgRes]) => {
             setOrder(orderRes.data);
             setMessages(msgRes.data);
         }).catch(console.error)
           .finally(() => setLoading(false));
     }
  }, [id, user]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0 || !order) return;

    try {
        await axios.post(`/api/orders/${order.id}/reviews`, {
            product_id: selectedProductForReview.id,
            rating: reviewRating,
            comment: reviewComment
        });
        toast.success("Recenzia a fost trimisă!");
        setSelectedProductForReview(null);
        setReviewRating(0);
        setReviewComment('');
        // Refresh order to update UI
        const res = await axios.get(`/api/orders/${id}`);
        setOrder(res.data);
    } catch (e) {
        console.error(e);
        toast.error("Eroare la trimiterea recenziei.");
    }
  };

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        scrollContainerRef.current.scrollTo({
            top: scrollHeight - clientHeight,
            behavior: 'smooth'
        });
    }
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
            // Avoid duplicates
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

  if (loading) return <div className="p-8">Se încarcă detaliile comenzii...</div>;
  if (!order) return <div className="p-8">Comandă inexistentă.</div>;
  
  const stall = order.stall || {};

  const handleSendMessage = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newMessage.trim() || isSending) return;
      
      setIsSending(true);
      
      try {
        const response = await axios.post(`/api/orders/${order.id}/messages`, { content: newMessage });
        setMessages(prev => [...prev, response.data as any]); // Explicit cast to handle legacy vs new types
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
        toast.error('Mesajul nu a putut fi trimis.');
      } finally {
        setIsSending(false);
      }
  };

  return (
    <div className="bg-stone-50 min-h-[calc(100vh-64px)] p-4 md:p-8">
       <div className="max-w-6xl mx-auto mb-6">
          <Link to="/orders" className="inline-flex items-center text-stone-500 hover:text-fern">
            <ArrowLeft className="h-4 w-4 mr-1" /> Înapoi la listă
          </Link>
       </div>

       <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details Column */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-white rounded-lg shadow-sm border border-stone-100 p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-2xl font-serif font-bold text-stone-800">Comanda #{order.id}</h1>
                        <p className="text-stone-500 text-sm">Plasată pe {new Date(order.created_at || order.createdAt).toLocaleDateString('ro-RO')}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={cn("px-3 py-1 rounded-full text-sm font-bold uppercase", getStatusColor(order.status))}>
                            {getStatusLabel(order.status)}
                        </span>
                        {/* Buyer action buttons */}
                        {['new_order', 'neworder'].includes(order.status?.toLowerCase()) && (
                             <Button 
                               size="sm" 
                               variant="outline"
                               className="text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                               onClick={() => {
                                 Swal.fire({
                                     title: 'Anulezi Comanda?',
                                     text: 'Ești sigur că vrei să anulezi comanda? Această acțiune este ireversibilă.',
                                     icon: 'warning',
                                     showCancelButton: true,
                                     confirmButtonColor: '#dc2626',
                                     cancelButtonColor: '#78716c',
                                     confirmButtonText: 'Da, anulează',
                                     cancelButtonText: 'Nu, păstrează'
                                 }).then(async (result) => {
                                     if (result.isConfirmed) {
                                         try {
                                             await axios.delete(`/api/orders/${order.id}`);
                                             toast.success('Comanda a fost anulată.');
                                             // refresh
                                             const res = await axios.get(`/api/orders/${id}`);
                                             setOrder(res.data);
                                         } catch(e) { 
                                             console.error(e);
                                             toast.error('Nu s-a putut anula comanda.');
                                         }
                                     }
                                 });
                               }}
                             >
                                 Anulează Comanda
                             </Button>
                        )}

                        {order.status === 'confirmed' && (
                           <Button 
                             size="sm" 
                             className="bg-green-600 hover:bg-green-700 text-white"
                             onClick={() => {
                               Swal.fire({
                                   title: 'Confirmare Ridicare',
                                   text: 'Ai ridicat comanda și ai achitat produsele? Marchează comanda ca finalizată.',
                                   icon: 'question',
                                   showCancelButton: true,
                                   confirmButtonColor: '#4a7c59',
                                   cancelButtonColor: '#78716c',
                                   confirmButtonText: 'Da, confirm!',
                                   cancelButtonText: 'Anulează'
                               }).then(async (result) => {
                                   if (result.isConfirmed) {
                                       try {
                                           await axios.patch(`/api/orders/${order.id}/complete`);
                                           toast.success('Comandă finalizată cu succes!');
                                           // refresh
                                           const res = await axios.get(`/api/orders/${id}`);
                                           setOrder(res.data);
                                       } catch(e) { console.error(e); }
                                   }
                               });
                             }}
                           >
                               Marchează ca Ridicată
                           </Button>
                        )}
                     </div>
                 </div>
                 
                 <div className="bg-stone-50 p-4 rounded-md mb-6 flex items-start gap-3">
                     <div className="w-10 h-10 rounded-full bg-fern/10 flex items-center justify-center text-fern font-bold text-xs border border-white shadow-sm overflow-hidden">
                        {(stall.logoUrl || order.stall?.logoUrl) ? <img src={stall.logoUrl || order.stall?.logoUrl} alt={order.stallName} className="w-full h-full object-cover" /> : ((order.stallName || stall.name) ? (order.stallName || stall.name)[0] : 'S')}
                     </div>
                     <div>
                         <p className="font-bold text-stone-700">{order.stallName || stall.name || 'Unknown Stall'}</p>
                         <div className="flex items-center text-xs text-stone-500">
                            <MapPin className="h-3 w-3 mr-1" /> {order.location || stall.location || 'Unknown Location'}
                         </div>
                     </div>
                 </div>

                 <div className="space-y-4">
                    {order.items?.map((item: any) => (
                        <div key={item.id} className="flex gap-4 py-2 border-b border-stone-50 last:border-0">
                            <div className="h-16 w-16 bg-stone-100 rounded-md overflow-hidden flex-shrink-0">
                                 {item.productName ? (
                                    <div className="w-full h-full flex items-center justify-center bg-fern/10 text-fern font-bold">{item.productName[0]}</div>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px]">No Img</div>
                                )}
                            </div>
                             <div className="flex-grow">
                                 <h4 className="font-medium text-stone-800">{item.productName}</h4>
                                 <p className="text-sm text-stone-500">{item.quantity} x {item.priceAtPurchase?.toFixed(2)} RON</p>
                                 
                                 {order.status === 'completed' && (
                                     item.has_reviewed ? (
                                         <div className="flex items-center text-xs text-green-600 mt-1">
                                             <CheckCircle className="h-3 w-3 mr-1" /> Recenzie trimisă
                                         </div>
                                     ) : (
                                         <button 
                                             onClick={() => setSelectedProductForReview(item.product || { id: item.productId, name: item.productName })}
                                             className="text-xs text-fern hover:underline mt-1 font-medium flex items-center gap-1"
                                         >
                                             <Star className="h-3 w-3" /> Lasă recenzie
                                         </button>
                                     )
                                 )}
                             </div>
                             <div className="text-right">
                                 <div className="font-bold text-stone-800">
                                     {(item.priceAtPurchase * item.quantity).toFixed(2)} RON
                                 </div>
                             </div>
                         </div>
                     ))}
                  </div>

                  {/* Review Modal */}
                  {selectedProductForReview && (
                      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in">
                          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in zoom-in slide-in-from-bottom-4 duration-300">
                              <h3 className="text-xl font-bold font-serif text-stone-800 mb-2">Recenzie: {selectedProductForReview.name}</h3>
                              <p className="text-sm text-stone-500 mb-6">Cum au fost produsele primite?</p>
                              
                              <form onSubmit={handleReviewSubmit} className="space-y-4">
                                  <div>
                                      <label className="block text-sm font-medium text-stone-700 mb-2">Notă (1-5)</label>
                                      <div className="flex gap-2">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                              <button
                                                  key={star}
                                                  type="button"
                                                  onClick={() => setReviewRating(star)}
                                                  className={cn(
                                                      "p-1 transition-colors",
                                                      star <= reviewRating ? "text-yellow-400" : "text-stone-200"
                                                  )}
                                              >
                                                  <Star className="h-8 w-8 fill-current" />
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                                  
                                  <div>
                                      <label className="block text-sm font-medium text-stone-700 mb-1">Comentariu (opțional)</label>
                                      <textarea
                                          value={reviewComment}
                                          onChange={(e) => setReviewComment(e.target.value)}
                                          placeholder="Spune-ne părerea ta..."
                                          className="w-full px-3 py-2 rounded-md border border-stone-200 focus:outline-none focus:ring-2 focus:ring-fern min-h-[100px] text-sm"
                                          maxLength={500}
                                      />
                                  </div>
                                  
                                  <div className="flex gap-3 pt-2">
                                      <Button 
                                          type="button" 
                                          variant="outline" 
                                          className="flex-grow" 
                                          onClick={() => setSelectedProductForReview(null)}
                                      >
                                          Anulează
                                      </Button>
                                      <Button 
                                          type="submit" 
                                          className="bg-fern text-white flex-grow"
                                          disabled={reviewRating === 0}
                                      >
                                          Trimite Recenzia
                                      </Button>
                                  </div>
                              </form>
                          </div>
                      </div>
                  )}
                 
                 <div className="mt-6 pt-4 border-t border-stone-100 flex justify-between items-center">
                     <span className="font-bold text-stone-600">Total</span>
                     <span className="text-2xl font-serif font-bold text-fern">{(order.totalPrice).toFixed(2)} RON</span>
                 </div>
             </div>
          </div>

          {/* Chat Column (Simulated for now) */}
          <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border border-stone-100 h-[600px] flex flex-col sticky top-20">
                  <div className="p-4 border-b border-stone-100 bg-fern/5">
                      <h3 className="font-bold text-fern flex items-center gap-2">
                          <MessageCircle className="h-5 w-5" />
                          Chat cu Vânzătorul
                      </h3>
                  </div>
                  
                  <div 
                      ref={scrollContainerRef}
                      className="flex-grow overflow-y-auto p-4 space-y-4 bg-stone-50/50"
                  >
                      {messages.map((msg: any) => { // Cast to any to handle mixed formats
                          // Backend sends UserId/CreatedAt, Typescript expects timestamp/senderId
                          const senderId = msg.userId || msg.senderId;
                          const timestamp = msg.createdAt || msg.timestamp;
                          const isMe = Number(senderId) === Number(user?.id);
                          const isSystem = msg.isSystem;
                          
                          if (isSystem) {
                              return (
                                  <div key={msg.id} className="flex justify-center my-4">
                                      <span className="text-xs bg-stone-200 text-stone-600 px-3 py-1 rounded-full">
                                          {msg.text || msg.content}
                                      </span>
                                  </div>
                              );
                          }

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
                      })}
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
                              className="flex-grow px-3 py-2 rounded-md border border-stone-300 focus:outline-none focus:ring-2 focus:ring-fern bg-stone-50 text-sm"
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
