import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { MultimodalInput } from './MultimodalInput';
import { queryZibiAI } from '../services/aiService';
import { shouldAutoApprove } from '../utils/permissions';
import { getProductImage } from '../utils/productImages';
import { toast } from '../utils/toast';
import { 
  Sparkles, 
  Store, 
  Truck, 
  ShieldCheck, 
  ExternalLink, 
  Heart, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  Zap, 
  Layers,
  ArrowRight,
  TrendingDown,
  Info,
  Cpu
} from 'lucide-react';

export const ChatView = () => {
  const { mode, setPendingApproval, permissions, wishlist, setWishlist, addOrder } = useApp();
  const messagesEndRef = useRef(null);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingStep, setThinkingStep] = useState('');
  const [lastRouting, setLastRouting] = useState(null); // { providerUsed, modelUsed, tier } from the last AI response

  // Initial Messages
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: mode === 'personal'
        ? "Hello Alex! I'm Zibi, your AI Personal Shopper & Procurement Companion. Ask me to scout products, record a voice note, or snap a photo. I search e-commerce platforms locally and globally to find the best specs and prices."
        : "Welcome Alex. I'm Zibi, your Corporate Procurement Agent. I handle vendor scouting, RFQs, specification comparisons, budget enforcement, and autonomous purchase execution.",
      timestamp: '09:00 AM'
    },
    {
      id: 'msg-2',
      sender: 'user',
      text: mode === 'personal'
        ? "I need a high-performance laptop for video editing under ₦1.5m. What are my best options?"
        : "Find me 50 high-quality branded polo shirts for our marketing team. Need them delivered to Lagos HQ before Oct 10 under ₦1,000,000.",
      timestamp: '09:02 AM'
    },
    {
      id: 'msg-3',
      sender: 'ai',
      text: mode === 'personal'
        ? "I've scouted Jumia, Konga, Amazon UK, and iStore Nigeria. Here is your curated price & specification matrix:"
        : "I've queried Alibaba B2B, Jumia Corporate, and 3 local screen-printing suppliers in Lagos. Here is the supplier comparison matrix:",
      timestamp: '09:03 AM',
      type: 'comparison',
      items: mode === 'personal' ? [
        {
          title: 'ASUS ROG Zephyrus G16 (16GB RAM, 1TB SSD, RTX 4060)',
          price: 1380000,
          vendor: 'Konga Direct',
          location: 'Lagos (1-Day Delivery)',
          specsNote: '⭐ Best balance of video render speed & price. Highly recommended.',
          pros: ['Dedicated GPU', '16GB Dual Channel', 'Local Warranty'],
          cons: ['Slightly heavier'],
          isRecommended: true,
          category: 'Tech'
        },
        {
          title: 'Apple MacBook Air 15" M3 (8GB RAM, 512GB SSD)',
          price: 1450000,
          vendor: 'Jumia Official Store',
          location: 'Abuja (2-Day Delivery)',
          specsNote: '⚠️ Warning: 8GB RAM is insufficient for 4K video rendering workloads.',
          pros: ['Super lightweight', 'Battery life'],
          cons: ['8GB RAM throttle risk'],
          isRecommended: false,
          category: 'Tech'
        },
        {
          title: 'Dell XPS 15 (32GB RAM, 1TB SSD, i7 13th Gen)',
          price: 1490000,
          vendor: 'Amazon UK Import',
          location: 'London -> Lagos (5-7 Days)',
          specsNote: 'Excellent 32GB RAM specs, but involves 5-day international shipping.',
          pros: ['32GB RAM', 'OLED Screen'],
          cons: ['Import duty fee included'],
          isRecommended: false,
          category: 'Tech'
        }
      ] : [
        {
          title: '50x Heavyweight Cotton Polo Shirts (Embroidery Included)',
          price: 850000,
          vendor: 'Lagos Apparel Works (Verified Supplier)',
          location: 'Lagos HQ Delivery (3 Days)',
          specsNote: '✅ Delivered well before Oct 10 deadline. Includes custom logo embroidery.',
          pros: ['Fast local fulfillment', 'Custom embroidery', 'Free sample'],
          cons: ['Limited color shades'],
          isRecommended: true,
          category: 'Corporate Swag'
        },
        {
          title: '50x Premium Pique Polos (Direct Import)',
          price: 650000,
          vendor: 'Alibaba B2B Direct',
          location: 'Shenzhen -> Lagos (10-12 Days)',
          specsNote: 'Cheaper per unit, but delivery window cuts close to your Oct 10 deadline.',
          pros: ['Lowest unit cost'],
          cons: ['Potential customs clearance delay'],
          isRecommended: false,
          category: 'Corporate Swag'
        }
      ]
    }
  ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = async (userPayload) => {
    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: userPayload.text,
      image: userPayload.image,
      doc: userPayload.doc,
      timestamp: userPayload.timestamp
    };

    setMessages(prev => [...prev, newMsg]);

    // Live AI Agent Thought Stream
    setIsThinking(true);
    setThinkingStep('🔍 Connecting to live e-commerce search nodes & active MCP plugins...');

    try {
      setTimeout(() => setThinkingStep('⚖️ Comparing specifications, prices & logistics trade-offs...'), 600);

      const aiResult = await queryZibiAI({
        prompt: userPayload.text,
        imageBase64: userPayload.image?.base64,
        mode
      });

      setIsThinking(false);

      if (aiResult.apiError) {
        toast(`Zibi AI backend unavailable (${aiResult.apiError}) — used the offline fallback engine instead.`, 'warning');
      }

      setLastRouting({ providerUsed: aiResult.providerUsed, modelUsed: aiResult.modelUsed, tier: aiResult.tier, isLiveAI: aiResult.isLiveAI });

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'ai',
          text: aiResult.text,
          type: aiResult.type || 'comparison',
          items: aiResult.items || [],
          isLiveAI: aiResult.isLiveAI,
          providerUsed: aiResult.providerUsed,
          modelUsed: aiResult.modelUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      console.error('Error fetching AI response:', err);
      setIsThinking(false);
      toast('Something went wrong reaching Zibi. Please try again.', 'warning');
    }
  };

  const handleAddToWishlist = (item) => {
    setWishlist(prev => [
      {
        id: `w-${Date.now()}`,
        name: item.title,
        category: item.category || 'General',
        currentPrice: item.price,
        originalPrice: Math.round(item.price * 1.15),
        targetPrice: Math.round(item.price * 0.9),
        bestStore: item.vendor,
        image: item.image || getProductImage(item.category),
        priceDrop: true,
        dropPercentage: 15,
        location: item.location,
        inStock: true
      },
      ...prev
    ]);
    toast(`Added "${item.title}" to Wishlist & Price Drop Radar.`, 'success');
  };

  // Honors the AI Permission Boundaries configured in Wallet & Permissions:
  // items within the auto-approve limit (and not in a restricted category)
  // execute immediately; everything else falls through to human approval.
  const handleProcureNow = async (rawItem) => {
    const item = { ...rawItem, image: rawItem.image || getProductImage(rawItem.category) };
    if (shouldAutoApprove(item, permissions)) {
      try {
        await addOrder({
          id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split('T')[0],
          item: item.title,
          category: item.category,
          mode,
          amount: item.price,
          status: 'Auto-Approved & Procuring',
          vendor: item.vendor || 'Authorized Merchant',
          address: 'Default Address',
          paymentMethod: 'Zibi Pre-funded Wallet'
        });
        toast(`Auto-purchased "${item.title}" — within your ₦${permissions.autoApproveLimit.toLocaleString()} auto-approve limit.`, 'success');
      } catch (err) {
        toast(err.message || 'Auto-purchase failed — sending for manual approval instead.', 'warning');
        setPendingApproval(item);
      }
      return;
    }

    setPendingApproval(item);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-5xl mx-auto px-4 py-4 space-y-4">
      {/* Intelligence Status Banner */}
      <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/20 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
            <Zap className="w-4 h-4 animate-pulse text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white">
                {mode === 'personal' ? 'Personal Shopper Agent' : 'Business Procurement Officer'}
              </h3>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                lastRouting?.isLiveAI ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              }`}>
                {lastRouting?.isLiveAI ? `⚡ ${lastRouting.providerUsed} (${lastRouting.modelUsed})` : '🟢 Fallback Engine Active'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Auto-buy cap: <span className="font-mono font-semibold text-purple-300">₦{permissions.autoApproveLimit.toLocaleString()}</span> • Connected: <span className="text-emerald-400 font-semibold">Jumia, Konga, Amazon, Alibaba, Pharmacies</span>
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium">6 MCP Feeds</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            {/* Sender Badge */}
            <div className="flex items-center gap-2 mb-1 px-1">
              <span className="text-[11px] font-semibold text-slate-400">
                {msg.sender === 'user' ? 'You' : 'Zibi AI Agent'}
              </span>
              <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              {msg.isLiveAI && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {msg.providerUsed} · {msg.modelUsed}
                </span>
              )}
            </div>

            {/* Bubble Container */}
            <div
              className={`max-w-2xl rounded-2xl p-4 shadow-md text-sm ${
                msg.sender === 'user'
                  ? mode === 'personal'
                    ? 'bg-purple-600 text-white rounded-tr-none'
                    : 'bg-cyan-600 text-white rounded-tr-none'
                  : 'bg-[#131A29] border border-slate-800 text-slate-100 rounded-tl-none space-y-3'
              }`}
            >
              {/* User Attachment */}
              {msg.image && (
                <div className="mb-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center gap-3">
                  <img src={msg.image.url} alt="Uploaded" className="w-14 h-14 object-cover rounded-lg" />
                  <div>
                    <p className="text-xs font-bold text-white">{msg.image.name}</p>
                    <p className="text-[10px] text-cyan-400 font-medium">Visual Vision Scan Input</p>
                  </div>
                </div>
              )}

              {/* Message Content */}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

              {/* Product Comparison Matrix */}
              {msg.type === 'comparison' && msg.items && msg.items.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-1 gap-3">
                    {msg.items.map((item, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-xl border transition-all ${
                          item.isRecommended
                            ? 'bg-purple-950/30 border-purple-500/40 shadow-lg shadow-purple-950/30'
                            : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {item.isRecommended && (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-extrabold uppercase mb-2">
                            <Sparkles className="w-3 h-3 text-purple-400" /> Zibi Recommended Top Choice
                          </div>
                        )}

                        <div className="flex gap-3">
                          <img
                            src={item.image || getProductImage(item.category)}
                            alt={item.title}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-800 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                              <h4 className="font-bold text-white text-sm">{item.title}</h4>
                              <span className="font-mono font-extrabold text-purple-300 text-base shrink-0">
                                ₦{item.price?.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-xs text-slate-400 mt-1 flex-wrap">
                              <span className="flex items-center gap-1"><Store className="w-3.5 h-3.5 text-cyan-400" /> {item.vendor}</span>
                              <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5 text-emerald-400" /> {item.location}</span>
                            </div>
                          </div>
                        </div>

                        {item.specsNote && (
                          <p className="text-xs text-slate-300 bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/80 mt-2 font-medium">
                            {item.specsNote}
                          </p>
                        )}

                        {/* Pros & Cons */}
                        <div className="grid grid-cols-2 gap-2 text-[11px] mt-2.5 pt-2 border-t border-slate-800">
                          <div>
                            <span className="font-semibold text-emerald-400 block mb-1">Pros:</span>
                            <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                              {item.pros?.map((p, i) => <li key={i}>{p}</li>)}
                            </ul>
                          </div>
                          <div>
                            <span className="font-semibold text-rose-400 block mb-1">Trade-offs:</span>
                            <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                              {item.cons?.map((c, i) => <li key={i}>{c}</li>)}
                            </ul>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-slate-800/60">
                          <button
                            onClick={() => handleAddToWishlist(item)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                          >
                            <Heart className="w-3.5 h-3.5 text-rose-400" />
                            <span>Track Price Drop</span>
                          </button>

                          <button
                            onClick={() => handleProcureNow(item)}
                            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30 transition-all"
                          >
                            <span>Procure Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* AI Thought Ticker */}
        {isThinking && (
          <div className="flex items-center gap-3 p-3 bg-slate-900/90 border border-purple-500/30 rounded-2xl max-w-md animate-pulse">
            <div className="w-6 h-6 rounded-lg bg-purple-600/30 flex items-center justify-center text-purple-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span className="text-xs font-semibold text-purple-300">{thinkingStep}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <MultimodalInput onSendMessage={handleSendMessage} />
    </div>
  );
};
