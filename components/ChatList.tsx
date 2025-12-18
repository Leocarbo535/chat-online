import React, { useState } from 'react';
import { Contact, User } from '../types';
import { Search, MoreVertical, MessageSquare, UserPlus, LogOut, Settings, X, Check } from 'lucide-react';
import { chatService } from '../services/chatService';

interface ChatListProps {
  currentUser: User;
  contacts: Contact[];
  selectedContactId: string | null;
  onSelectContact: (id: string) => void;
  onAddContact: (id: string) => void;
  onLogout: () => void;
  onUpdateProfile: (name: string, about: string) => void;
}

export const ChatList: React.FC<ChatListProps> = ({ 
  currentUser,
  contacts, 
  selectedContactId, 
  onSelectContact,
  onAddContact,
  onLogout,
  onUpdateProfile
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [friendId, setFriendId] = useState('');
  
  // Settings form
  const [newName, setNewName] = useState(currentUser.name);
  const [newAbout, setNewAbout] = useState(currentUser.about || '');

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (friendId) {
      onAddContact(friendId);
      setFriendId('');
      setShowAddModal(false);
    }
  };

  const handleSaveSettings = () => {
    onUpdateProfile(newName, newAbout);
    setShowSettings(false);
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 relative">
      {/* Header */}
      <div className="h-16 bg-[#f0f2f5] px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
            <img 
              onClick={() => setShowSettings(true)}
              src={currentUser.avatar} 
              alt="My Profile" 
              className="w-10 h-10 rounded-full cursor-pointer hover:opacity-80 border border-gray-300"
            />
        </div>
        
        <div className="flex gap-4 text-[#54656f] relative">
          <button onClick={() => setShowAddModal(true)} title="Add Friend">
             <UserPlus className="w-5 h-5 cursor-pointer" />
          </button>
          <button title="New Chat">
             <MessageSquare className="w-5 h-5 cursor-pointer" />
          </button>
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)}>
                <MoreVertical className="w-5 h-5 cursor-pointer" />
            </button>
            {showMenu && (
                <div className="absolute right-0 top-10 w-48 bg-white shadow-xl rounded-md py-2 z-50 border border-gray-100">
                    <button onClick={() => { setShowSettings(true); setShowMenu(false); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2">
                        <Settings className="w-4 h-4" /> Settings
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500 flex items-center gap-2">
                        <LogOut className="w-4 h-4" /> Logout
                    </button>
                </div>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-2 border-b border-gray-100 bg-white">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search contacts"
            className="w-full bg-[#f0f2f5] text-sm text-[#3b4a54] rounded-lg pl-10 p-2 focus:outline-none focus:ring-1 focus:ring-[#00a884]"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {contacts.length === 0 ? (
           <div className="p-8 text-center text-gray-500 text-sm flex flex-col items-center">
             <p className="mb-4">No chats yet.</p>
             <button 
               onClick={() => setShowAddModal(true)}
               className="bg-[#00a884] text-white px-4 py-2 rounded-full font-medium shadow-sm hover:bg-[#008f6f] transition-colors"
             >
               Add a Friend
             </button>
           </div>
        ) : (
          contacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => onSelectContact(contact.id)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-[#f5f6f6] transition-colors ${
                selectedContactId === contact.id ? 'bg-[#f0f2f5]' : ''
              }`}
            >
              <div className="relative">
                <img 
                  src={contact.avatar} 
                  alt={contact.name} 
                  className="w-12 h-12 rounded-full object-cover bg-gray-200" 
                />
                {/* Visual indicator on avatar too for more "modern" look */}
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'online' ? 'bg-[#00a884]' : 'bg-gray-400'}`}></div>
              </div>
              
              <div className="flex-1 min-w-0 border-b border-gray-100 pb-3">
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="font-normal text-[#111b21] truncate text-base flex items-center gap-2">
                    {contact.name}
                    {/* Visual indicator next to name as requested */}
                    <span 
                      className={`w-2 h-2 rounded-full ${contact.status === 'online' ? 'bg-[#00a884]' : 'bg-gray-300'}`}
                      title={contact.status}
                    ></span>
                  </h3>
                  {contact.lastMessageTime && (
                    <span className={`text-xs ${contact.unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#667781]'}`}>
                      {new Date(contact.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-[#667781] truncate pr-2">
                      {contact.lastMessage || <span className="text-xs opacity-60 italic">{contact.about || 'No status'}</span>}
                  </p>
                  {contact.unreadCount > 0 && (
                    <span className="bg-[#00a884] text-white text-xs font-medium px-1.5 min-w-[1.25rem] h-5 rounded-full flex items-center justify-center">
                      {contact.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Settings Panel (Sidebar style overlay) */}
      {showSettings && (
        <div className="absolute inset-0 bg-[#f0f2f5] z-[100] flex flex-col">
            <div className="h-28 bg-[#008069] text-white flex items-end p-4 pb-6 gap-6">
                <X className="cursor-pointer" onClick={() => setShowSettings(false)} />
                <span className="text-xl font-medium">Profile</span>
            </div>
            <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
                <img src={currentUser.avatar} className="w-48 h-48 rounded-full mb-8 shadow-md bg-white p-1" />
                
                <div className="w-full space-y-8">
                    <div className="bg-white p-4 shadow-sm rounded-lg">
                        <label className="text-xs text-[#008069] block mb-2 font-medium">YOUR NAME</label>
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                            <input 
                                className="flex-1 outline-none text-[#111b21]" 
                                value={newName} 
                                onChange={e => setNewName(e.target.value)}
                            />
                            <Check className="text-gray-400 w-4 h-4 cursor-pointer hover:text-[#00a884]" onClick={handleSaveSettings} />
                        </div>
                    </div>

                    <div className="bg-white p-4 shadow-sm rounded-lg">
                        <label className="text-xs text-[#008069] block mb-2 font-medium">ABOUT</label>
                        <div className="flex items-center gap-2 border-b border-gray-200 pb-1">
                            <input 
                                className="flex-1 outline-none text-[#111b21]" 
                                value={newAbout} 
                                onChange={e => setNewAbout(e.target.value)}
                                placeholder="Write something about you..."
                            />
                            <Check className="text-gray-400 w-4 h-4 cursor-pointer hover:text-[#00a884]" onClick={handleSaveSettings} />
                        </div>
                    </div>
                </div>
                <button 
                  onClick={handleSaveSettings}
                  className="mt-10 bg-[#00a884] text-white px-8 py-2 rounded shadow-md hover:bg-[#008f6f]"
                >
                    Save Changes
                </button>
            </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-4">
            <h3 className="text-lg font-medium text-[#111b21] mb-2">Add Friend</h3>
            <p className="text-sm text-gray-500 mb-4">Enter their <b>User ID</b> or <b>Username</b> to chat.</p>
            <form onSubmit={handleSubmitAdd}>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. u_123456 or john_doe" 
                className="w-full border border-gray-300 rounded p-2 mb-4 focus:outline-none focus:border-[#00a884]"
                value={friendId}
                onChange={e => setFriendId(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-[#00a884] hover:bg-[#f0f2f5] rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-[#00a884] text-white rounded hover:bg-[#008f6f]"
                >
                  Add Friend
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};