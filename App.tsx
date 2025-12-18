import React, { useState, useEffect, useCallback } from 'react';
import { GoogleLogin } from './components/GoogleLogin';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { User, Contact, Message } from './types';
import { chatService } from './services/chatService';

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  
  // New state: map of contactId -> isTyping
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  const refreshData = useCallback(() => {
    if (!user) return;
    const myContacts = chatService.getContacts(user.id);
    setContacts(myContacts);
    if (selectedContactId) {
      const msgs = chatService.getMessages(user.id, selectedContactId);
      setMessages(msgs);
      chatService.markAsRead(user.id, selectedContactId);
    }
  }, [user, selectedContactId]);

  useEffect(() => {
    if (!user) return;
    refreshData();
    
    const unsubscribe = chatService.subscribe((data) => {
      if (data?.type === 'update') {
        refreshData();
      } else if (data?.type === 'typing') {
        // Only track typing if the message is for me
        if (data.receiverId === user.id) {
            setTypingStatus(prev => ({
                ...prev,
                [data.senderId]: data.isTyping
            }));
        }
      }
    });
    
    return () => unsubscribe();
  }, [user, selectedContactId, refreshData]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setSelectedContactId(null);
    setContacts([]);
    setMessages([]);
    setTypingStatus({});
  };

  const handleUpdateProfile = (name: string, about: string) => {
      if (!user) return;
      const updatedUser = chatService.updateProfile(user.id, { name, about });
      if (updatedUser) setUser(updatedUser);
  };

  const handleSendMessage = (text: string) => {
    if (!selectedContactId || !user) return;
    chatService.sendMessage(user.id, selectedContactId, text);
    // When sending, assume typing stops
    chatService.sendTypingStatus(user.id, selectedContactId, false);
    refreshData();
  };

  const handleSendTyping = (isTyping: boolean) => {
    if (!selectedContactId || !user) return;
    chatService.sendTypingStatus(user.id, selectedContactId, isTyping);
  };

  const handleAddContact = (identifier: string) => {
    if (!user) return;
    const result = chatService.addContact(user.id, identifier);
    if (result.success) {
      refreshData();
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  if (!user) {
    return <GoogleLogin onLogin={handleLogin} />;
  }

  const selectedContact = contacts.find(c => c.id === selectedContactId);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#d1d7db] md:p-5">
      <div className="h-full w-full max-w-[1600px] mx-auto bg-white shadow-lg overflow-hidden flex md:rounded-lg">
        
        <div className={`
          w-full md:w-[30%] lg:w-[400px] h-full border-r border-gray-200 
          ${selectedContactId ? 'hidden md:flex' : 'flex'}
        `}>
          <ChatList 
            currentUser={user}
            contacts={contacts}
            selectedContactId={selectedContactId}
            onSelectContact={(id) => setSelectedContactId(id)}
            onAddContact={handleAddContact}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        </div>

        <div className={`
          flex-1 h-full bg-[#efeae2]
          ${!selectedContactId ? 'hidden md:flex' : 'flex'}
        `}>
          {selectedContact ? (
            <ChatWindow 
              contact={selectedContact}
              messages={messages}
              onSendMessage={handleSendMessage}
              onBack={() => setSelectedContactId(null)}
              currentUserId={user.id}
              isContactTyping={!!typingStatus[selectedContact.id]}
              onTyping={handleSendTyping}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#f0f2f5] border-b-[6px] border-[#25d366] text-center p-10 relative">
               <div className="mb-8">
                   <img src="https://static.whatsapp.net/rsrc.php/v3/y6/r/wa669ae.svg" width="300" alt="Whatsapp Default" className="opacity-60" />
               </div>
               <h1 className="text-[#41525d] text-3xl font-light mb-4">WhatsChat Web</h1>
               
               <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 max-w-sm w-full mb-6">
                 <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Your Profile</p>
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-gray-600 text-sm">Username:</span>
                    <span className="font-mono font-bold text-[#111b21]">{user.username}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm">User ID:</span>
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded text-[#00a884] select-all">{user.id}</span>
                 </div>
                 <p className="text-xs text-gray-400 mt-3 text-center">Share your ID or Username with friends to start chatting.</p>
               </div>

               <div className="mt-10 flex items-center gap-2 text-[#8696a0] text-xs">
                 <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor"><path d="M18.5 12.87c.22-.58.35-1.2.35-1.87 0-2.76-2.24-5-5-5-2.05 0-3.81 1.24-4.58 3h1.56c.64-1.02 1.76-1.7 3.02-1.7 1.93 0 3.5 1.57 3.5 3.5 0 .39-.08.76-.21 1.1l1.36-.03zM7.17 10.97c.54-1.55 1.92-2.7 3.6-2.92v-1.5c-2.48.24-4.48 2.03-5.06 4.42H7.17zm.22 3.02H5.71c.58 2.39 2.58 4.18 5.06 4.42v-1.5c-1.68-.22-3.06-1.37-3.6-2.92h.22zm4.33 3.01c1.26 0 2.38-.68 3.02-1.7h1.56c-.77 1.76-2.53 3-4.58 3-2.76 0-5-2.24-5-5 0-.67.13-1.29.35-1.87l-1.36-.04c-.13.34-.21.71-.21 1.1 0 1.93 1.57 3.5 3.5 3.5.31 0 .61-.04.89-.11v-1.38c-.28.07-.58.11-.89.11zm1.28-4.5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5.67 1.5 1.5 1.5 1.5-.67 1.5-1.5z"></path></svg>
                 End-to-end encrypted
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;