import React, { useState, useRef, useEffect } from 'react';
import { Send, MapPin, Loader2, Download, Ticket, Image as ImageIcon, Calculator } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import { auth } from '../lib/firebase';
import AuthModal from './AuthModal';
import BudgetCard from './BudgetCard';
import TravelDetailsForm from './TravelDetailsForm';
import { chatService } from '../services/chat.service';
import type { DestinationInfo } from '../App';

interface ChatPanelProps {
  onDestinationUpdate: (dest: DestinationInfo) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  isDestination?: boolean;
  destInfo?: DestinationInfo;
  isBudget?: boolean;
  budgetData?: any;
}

const PlaceGallery = ({ places }: { places: string[] }) => {
  const [photos, setPhotos] = useState<{ url: string; name: string }[]>([]);

  useEffect(() => {
    if (!places || places.length === 0) return;

    const fetchPhotos = async () => {
      if (!window.google) return;
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));
      const photoPromises = places.map((place) => {
        return new Promise<{ url: string; name: string } | null>((resolve) => {
          service.findPlaceFromQuery(
            { query: place, fields: ['photos', 'name'] },
            (results, status) => {
              if (status === window.google.maps.places.PlacesServiceStatus.OK && results?.[0]?.photos) {
                resolve({
                  url: results[0].photos[0].getUrl({ maxWidth: 400, maxHeight: 300 }),
                  name: results[0].name || place,
                });
              } else {
                resolve(null);
              }
            }
          );
        });
      });

      const results = await Promise.all(photoPromises);
      setPhotos(results.filter((p): p is { url: string; name: string } => p !== null));
    };

    if (window.google) {
      fetchPhotos();
    }
  }, [places]);

  if (photos.length === 0) return null;

  return (
    <div className="mt-4 -mx-5 px-5">
      <div className="flex items-center gap-2 text-slate-500 mb-3 px-1">
        <ImageIcon className="w-4 h-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">Iconic Landmarks</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar snap-x">
        {photos.map((photo, i) => (
          <div key={i} className="min-w-[180px] h-[120px] rounded-2xl overflow-hidden relative group snap-start shadow-sm border border-slate-100 bg-slate-50">
            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <p className="absolute bottom-2 left-2 right-2 text-[10px] font-medium text-white line-clamp-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {photo.name}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function ChatPanel({ onDestinationUpdate }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      sender: 'ai',
      text: 'Hello! I am JourneyCrafter. Tell me what you are feeling like doing, and I will fly you to the perfect destination.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [statusAnnouncement, setStatusAnnouncement] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingBooking, setPendingBooking] = useState<any>(null);
  const [currentDest, setCurrentDest] = useState<DestinationInfo | null>(null);
  const [showTravelForm, setShowTravelForm] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const currentDestRef = useRef<DestinationInfo | null>(null);
  const pendingBookingRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    currentDestRef.current = currentDest;
  }, [currentDest]);

  useEffect(() => {
    pendingBookingRef.current = pendingBooking;
  }, [pendingBooking]);

  useEffect(() => {
    (window as any).triggerBudget = () => {
      const dest = currentDestRef.current;
      if (dest) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Here is the budget breakdown for **${dest.destination_name}**:`,
            isBudget: true,
            budgetData: dest.budget
          },
        ]);
      }
    };

    (window as any).triggerBooking = () => {
      const dest = currentDestRef.current;
      if (dest) {
        if (!user) {
          setPendingBooking({ destination: dest.destination_name });
          setIsAuthModalOpen(false);
          setTimeout(() => setIsAuthModalOpen(true), 50);
        } else {
          // If already logged in, show the travel details form
          setShowTravelForm(true);
        }
      }
    };

    return () => {
      delete (window as any).triggerBudget;
      delete (window as any).triggerBooking;
    };
  }, []);

  const handleDownloadPDF = (destInfo: DestinationInfo) => {
    const element = document.createElement('div');
    
    // Simple markdown to HTML conversion for PDF
    const formattedRationale = destInfo.rationale
      .replace(/### (.*)/g, '<h3 style="color: #1e3a8a; margin-top: 20px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px;">$1</h3>')
      .replace(/\*\* (.*) \*\*/g, '<strong>$1</strong>')
      .replace(/\*\*(.*)\*\*/g, '<strong>$1</strong>')
      .replace(/- (.*)/g, '<li style="margin-left: 20px;">$1</li>')
      .replace(/\n/g, '<br/>');

    element.innerHTML = `
      <div style="padding: 0; font-family: 'Helvetica', 'Arial', sans-serif; color: #1e293b; line-height: 1.6; background: white;">
        <div style="position: relative; height: 180px; overflow: hidden; margin-bottom: 40px;">
          <img src="${window.location.origin}/banner.png" style="width: 100%; height: 100%; object-fit: cover;" />
          <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 30px; background: linear-gradient(transparent, rgba(0,0,0,0.8)); color: white;">
            <h1 style="font-size: 32px; margin: 0; font-weight: bold;">JourneyCrafter</h1>
            <p style="margin: 0; font-size: 14px; opacity: 0.8; text-transform: uppercase; letter-spacing: 2px;">Experience Engine • Travel Itinerary</p>
          </div>
        </div>
        
        <div style="padding: 0 50px 50px 50px;">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;">
            <div>
              <h2 style="font-size: 28px; color: #1d4ed8; margin: 0;">${destInfo.destination_name}</h2>
              <p style="margin: 5px 0 0 0; color: #64748b; font-weight: 600;">Your Custom 3-Day Plan</p>
            </div>
            <div style="text-align: right; color: #94a3b8; font-size: 12px;">
              <p style="margin: 0;">Ref: JC-${Math.floor(Math.random() * 100000)}</p>
              <p style="margin: 0;">Generated: ${new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div style="font-size: 15px;">
            ${formattedRationale}
          </div>

          <div style="margin-top: 40px; padding: 25px; background: #f8fafc; border-radius: 15px; border: 1px solid #f1f5f9;">
            <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Budget Summary</h3>
            <p style="font-size: 14px; color: #475569;">Estimated Total: <strong>${destInfo.budget.total} ${destInfo.budget.currency}</strong></p>
          </div>

          <div style="margin-top: 60px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: center;">
            <p style="font-size: 11px; color: #94a3b8; margin: 0;">
              JourneyCrafter AI • Plan your next adventure at journeycrafter.ai
            </p>
          </div>
        </div>
      </div>
    `;

    const opt = {
      margin: 0.5,
      filename: `JourneyCrafter_${destInfo.destination_name}.pdf`,
      image: { type: 'jpeg' as const, quality: 1 },
      html2canvas: { scale: 3, useCORS: true },
      jsPDF: { unit: 'in' as const, format: 'letter' as const, orientation: 'portrait' as const }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: 'user', text: userMessage }]);
    setLoading(true);
    setStatusAnnouncement('Analyzing your travel preferences...');

    try {
      const data = await chatService.sendMessage(userMessage);

      if (data.type === 'function_call') {
        const destInfo = data.data as DestinationInfo;
        onDestinationUpdate(destInfo);
        setCurrentDest(destInfo);
        
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            sender: 'ai',
            text: `### Let's fly to ${destInfo.destination_name}!\n\n${destInfo.rationale}`,
            isDestination: true,
            destInfo: destInfo
          }
        ]);
        setStatusAnnouncement(`Map updated. Now viewing ${destInfo.destination_name}.`);
      } else if (data.type === 'booking_call') {
        const bookingData = data.data;
        if (!user) {
          setPendingBooking(bookingData);
          setIsAuthModalOpen(true);
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender: 'ai', text: "I'd be happy to help you book that! Please sign in or create an account to proceed with your booking." },
          ]);
        } else {
          const userName = user?.displayName || 'traveler';
          setMessages((prev) => [
            ...prev,
            { id: Date.now().toString(), sender: 'ai', text: `Great news ${userName}! I'm ready to book your tickets to ${bookingData.destination}. Would you like me to finalize the reservation?` },
          ]);
        }
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now().toString(), sender: 'ai', text: data.data as string },
        ]);
        setStatusAnnouncement('AI responded to your query.');
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now().toString(), sender: 'ai', text: error.message },
      ]);
      setStatusAnnouncement('An error occurred while connecting to the engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative overflow-hidden">
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          setShowTravelForm(true);
          setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'ai',
            text: `Welcome! Let's get your travel details for **${pendingBooking?.destination || 'your trip'}**.`
          }]);
        }}
      />

      {showTravelForm && currentDest && (
        <TravelDetailsForm 
          destination={currentDest.destination_name}
          onClose={() => setShowTravelForm(false)}
          onSubmit={(details) => {
            setShowTravelForm(false);
            setMessages(prev => [...prev, {
              id: Date.now().toString(),
              sender: 'ai',
              text: `### 🌍 Your Journey is Confirmed!\n\n**Trip Summary:**\n- **From:** ${details.from}\n- **To:** ${details.to}\n- **Duration:** ${details.days} Days\n- **Travelers:** ${details.people}\n- **Contact:** ${details.phone}\n\n**Full 3-Day Itinerary:**\n${currentDest.rationale}\n\n**Budget Estimate:** ${currentDest.budget.total} ${currentDest.budget.currency}\n\nBon Voyage! ✈️`
            }]);
          }}
        />
      )}

      <div className="sr-only" aria-live="polite">
        {statusAnnouncement}
      </div>

      {/* Premium Header with Banner - Fixed at top */}
      <div className="absolute top-0 left-0 right-0 z-[70] h-48 w-full shrink-0">
        <img 
          src="/banner.png" 
          alt="JourneyCrafter Banner" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-slate-50" />
        
        {/* Floating Logo Card */}
        <div className="absolute -bottom-10 left-6 right-6 p-6 bg-white/95 backdrop-blur-3xl border border-white/60 rounded-[2.5rem] shadow-2xl shadow-blue-900/30 flex items-center justify-between z-20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 shrink-0">
              <MapPin className="w-8 h-8 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight truncate">JourneyCrafter</h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] opacity-70 truncate">Experience Engine</p>
            </div>
          </div>
          {user ? (
            <div className="flex items-center gap-3 pr-2 animate-in fade-in slide-in-from-right duration-500 shrink-0">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">{user.displayName || 'Traveler'}</p>
                <button 
                  onClick={() => auth.signOut()}
                  className="text-[10px] text-blue-600 font-bold mt-1 hover:underline block ml-auto"
                >
                  Sign Out
                </button>
              </div>
              <div className="w-11 h-11 rounded-full bg-blue-50 border-2 border-white overflow-hidden shadow-md">
                <img src={`https://api.dicebear.com/7.x/lorelei/svg?seed=${user.uid}`} alt="User" className="w-full h-full object-cover" />
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsAuthModalOpen(true)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar relative pt-52 p-6 space-y-6 z-10">
        <div className="h-12" /> {/* Extra spacer for the floating card */}
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-3xl p-5 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-white text-slate-800 rounded-tl-sm border border-slate-200 shadow-md'
              }`}
            >
              <div className="prose prose-sm max-w-none prose-slate">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {msg.isBudget && msg.budgetData && (
                <BudgetCard {...msg.budgetData} />
              )}

              {msg.isDestination && msg.destInfo?.famous_places && (
                <PlaceGallery places={msg.destInfo.famous_places} />
              )}
              
              {msg.isDestination && msg.destInfo && (
                <div className="mt-4 flex flex-wrap gap-2 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleDownloadPDF(msg.destInfo!)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full text-sm font-semibold transition-all border border-blue-100"
                  >
                    <Download className="w-4 h-4" />
                    Download Itinerary
                  </button>
                  <button
                    onClick={() => {
                      if (!user) {
                        setPendingBooking({ destination: msg.destInfo!.destination_name });
                        setIsAuthModalOpen(true);
                      } else {
                        setShowTravelForm(true);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-full text-sm font-semibold transition-all border border-emerald-100"
                  >
                    <Ticket className="w-4 h-4" />
                    Plan to Travel
                  </button>
                  <button
                    onClick={() => {
                      setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        sender: 'ai',
                        text: `Here is the budget breakdown for **${msg.destInfo!.destination_name}**:`,
                        isBudget: true,
                        budgetData: msg.destInfo!.budget
                      }]);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-full text-sm font-semibold transition-all border border-slate-200"
                  >
                    <Calculator className="w-4 h-4" />
                    View Budget
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-3xl rounded-tl-sm p-5 flex items-center gap-3 text-slate-400 border border-slate-200 shadow-md">
              <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              <span className="font-medium">Curating your experience...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-slate-200 bg-white">
        <form onSubmit={handleSubmit} className="relative flex items-center max-w-4xl mx-auto">
          <label htmlFor="chat-input" className="sr-only">Type your travel destination or feeling</label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me where you want to go..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-6 pr-14 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            aria-label="Send message"
            className="absolute right-2 p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all disabled:opacity-50 disabled:shadow-none active:scale-95"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
}
