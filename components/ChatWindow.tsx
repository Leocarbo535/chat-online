import React, { useState, useRef, useEffect } from 'react';
import { Contact, Message } from '../types';
import { Send, Paperclip, Smile, MoreVertical, Search, Phone, X } from 'lucide-react';
import { DEFAULT_WALLPAPER } from '../constants';

interface ChatWindowProps {
  contact: Contact;
  messages: Message[];
  onSendMessage: (text: string) => void;
  onBack: () => void;
  currentUserId: string;
  isContactTyping: boolean; // New prop
  onTyping: (isTyping: boolean) => void; // New prop
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  contact, 
  messages, 
  onSendMessage, 
  onBack,
  currentUserId,
  isContactTyping,
  onTyping
}) => {
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<number | null>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (!isSearching || !searchQuery) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSearching, searchQuery, isContactTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputText(text);

    // Notify typing status
    if (text.trim() && !typingTimeoutRef.current) {
        onTyping(true);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = window.setTimeout(() => {
        onTyping(false);
        typingTimeoutRef.current = null;
    }, 2000); // 2 seconds of inactivity
  };

  const handleSend = () => {
    if (inputText.trim()) {
      if (typingTimeoutRef.current) {
        window.clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      onSendMessage(inputText);
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredMessages = searchQuery 
    ? messages.filter(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <div className="flex flex-col h-full bg-[#efeae2] relative">
      {/* Decorative background pattern overlay */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{
        backgroundImage: `url("${DEFAULT_WALLPAPER}")`,
        backgroundRepeat: 'repeat'
      }}></div>

      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0 z-10 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="md:hidden text-[#54656f]">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          
          <div className="relative">
            <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full bg-gray-200" />
            <div className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-[#f0f2f5] ${contact.status === 'online' ? 'bg-[#00a884]' : 'bg-gray-400'}`}></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[#111b21] font-medium text-base leading-tight">{contact.name}</span>
            <span className={`text-xs ${isContactTyping ? 'text-[#00a884] font-medium italic animate-pulse' : (contact.status === 'online' ? 'text-[#00a884]' : 'text-[#667781]')} truncate max-w-[150px]`}>
                {isContactTyping ? 'typing...' : (contact.status === 'online' ? 'online' : 'offline')}
            </span>
          </div>
        </div>
        
        <div className="flex gap-6 text-[#54656f] items-center">
           {isSearching ? (
               <div className="bg-white rounded-md flex items-center px-2 py-1 shadow-sm border border-gray-200">
                   <input 
                     autoFocus
                     className="text-sm outline-none w-32 md:w-48" 
                     placeholder="Search message..." 
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                   />
                   <X className="w-4 h-4 cursor-pointer" onClick={() => { setIsSearching(false); setSearchQuery(''); }} />
               </div>
           ) : (
               <Search className="w-5 h-5 cursor-pointer" onClick={() => setIsSearching(true)} />
           )}
           <Phone className="w-5 h-5 cursor-pointer hidden sm:block" />
           <MoreVertical className="w-5 h-5 cursor-pointer" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 z-10 space-y-2">
        {filteredMessages.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 text-sm mt-10 italic">No messages found matching "{searchQuery}"</div>
        )}
        {filteredMessages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div 
                        className={`max-w-[85%] md:max-w-[65%] rounded-lg p-2 px-3 relative shadow-sm text-sm md:text-[15px] leading-5 ${
                            isMe ? 'bg-[#d9fdd3] rounded-tr-none' : 'bg-white rounded-tl-none'
                        }`}
                    >
                        {/* Triangle for bubble */}
                        <div className={`absolute top-0 w-0 h-0 border-8 border-transparent ${
                            isMe 
                            ? 'right-[-8px] border-t-[#d9fdd3] border-l-[#d9fdd3]' 
                            : 'left-[-8px] border-t-white border-r-white'
                        }`}></div>

                        <p className="text-[#111b21] whitespace-pre-wrap">{msg.text}</p>
                        <div className={`flex justify-end gap-1 mt-1 ${isMe ? 'text-[#00a884]' : 'text-[#667781]'}`}>
                            <span className="text-[11px] text-[#667781]">
                                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMe && (
                                <span className={msg.status === 'read' ? 'text-[#53bdeb]' : 'text-[#667781]'}>
                                    <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 0 16 11">
                                        <path fill="currentColor" d="M11.04,10.535l0.77-1.125l0.71-1.04L16,3.955L14.475,2.9L11.75,6.865L10.23,4.65L8.71,6.865L7.185,9.08L6.415,7.96L5.65,9.08l1.535,2.235L11.04,10.535z M4.52,7.96L3.75,9.08l1.535,2.235L9.135,5.74L8.37,4.615L5.285,9.08L1.52,3.585L0,4.625l4.52,6.605V7.96z"></path>
                                    </svg>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
        
        {/* Visual indicator for typing in messages area */}
        {isContactTyping && (
             <div className="flex justify-start">
                <div className="bg-white rounded-lg p-3 shadow-sm text-sm text-[#667781] flex items-center gap-1 italic">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                </div>
             </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] px-4 py-2 flex items-center gap-2 z-10 shrink-0 border-t border-gray-200">
        <Smile className="w-6 h-6 text-[#54656f] cursor-pointer" />
        <Paperclip className="w-6 h-6 text-[#54656f] cursor-pointer" />
        
        <div className="flex-1 bg-white rounded-lg flex items-center px-4 py-2 shadow-sm">
            <input 
                type="text" 
                value={inputText}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message"
                className="w-full focus:outline-none text-[#111b21] placeholder:text-[#667781]"
            />
        </div>

        {inputText.trim() ? (
            <button onClick={handleSend} className="p-2 text-[#54656f] bg-white rounded-full shadow-sm">
                <Send className="w-6 h-6 text-[#00a884]" />
            </button>
        ) : (
            <button className="p-2 text-[#54656f]">
                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" className="" version="1.1" x="0px" y="0px" enableBackground="new 0 24 24"><path fill="currentColor" d="M11.999,14.942c2.001,0,3.531-1.53,3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531 S8.469,2.35,8.469,4.35v7.061C8.469,13.412,9.999,14.942,11.999,14.942z M18.237,11.412c0,3.531-2.904,6.412-6.237,6.412 s-6.237-2.881-6.237-6.412H4.173c0,3.971,2.882,7.294,6.591,7.942v4.294h2.471v-4.294c3.708-0.648,6.59-3.971,6.59-7.942H18.237z"></path></svg>
            </button>
        )}
      </div>
    </div>
  );
};