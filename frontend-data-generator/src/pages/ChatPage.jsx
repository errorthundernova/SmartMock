// import React, { useState, useRef, useEffect, useContext } from 'react';
// import { Switch } from "@/components/ui/switch";
// import { AuthContext } from '../context/AuthContext';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Send, Plus, LogOut, MoreHorizontal, Archive, Trash2, Edit, MessageSquare, ArchiveRestore, PanelLeftClose, PanelLeftOpen, Copy, Square, CheckSquare } from 'lucide-react';
// import JsonTable from '../components/custom/JsonTable';

// const ChatPage = () => {
//     const [messages, setMessages] = useState([]);
//     const [promptInput, setPromptInput] = useState('');
//     const [isAiLoading, setIsAiLoading] = useState(false);
//     const [recentHistory, setRecentHistory] = useState([]);
//     const [archivedHistory, setArchivedHistory] = useState([]);
//     const [editingMessage, setEditingMessage] = useState(null);
//     const [editedContent, setEditedContent] = useState("");
//     const [renameModalOpen, setRenameModalOpen] = useState(false);
//     const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
//     const [chatToModify, setChatToModify] = useState(null);
//     const [newTitle, setNewTitle] = useState("");
//     const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//     const [isTemporaryChat, setIsTemporaryChat] = useState(false);
//     const [isCurrentChatTemporary, setIsCurrentChatTemporary] = useState(false);
    
//     const { token, user, logout } = useContext(AuthContext);
//     const chatEndRef = useRef(null);

//     const fetchHistory = async () => {
//         if (token) {
//             const recentResponse = await fetch('http://127.0.0.1:8000/history', { headers: { 'Authorization': `Bearer ${token}` } });
//             if (recentResponse.ok) {
//                 const recentData = await recentResponse.json();
//                 setRecentHistory(recentData.map(chat => ({ ...chat, messages: JSON.parse(chat.conversation) })).reverse());
//             }
//             const archivedResponse = await fetch('http://127.0.0.1:8000/history/archived', { headers: { 'Authorization': `Bearer ${token}` } });
//             if (archivedResponse.ok) {
//                 const archivedData = await archivedResponse.json();
//                 setArchivedHistory(archivedData.map(chat => ({ ...chat, messages: JSON.parse(chat.conversation) })).reverse());
//             }
//         }
//     };

//     useEffect(() => { fetchHistory(); }, [token]);
//     useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
//     const handleNewGeneration = () => {
//         setMessages([]);
//         setIsCurrentChatTemporary(isTemporaryChat);
//     };
    
//     const handleAiSubmit = async (promptToSend, existingMessages = []) => {
//         if (!promptToSend.trim()) return;
//         const currentMessages = existingMessages.length > 0 ? existingMessages : [...messages, { role: 'user', content: promptToSend }];
//         if (existingMessages.length === 0) {
//             setMessages(currentMessages);
//             setPromptInput('');
//         }
//         setIsAiLoading(true);
//         try {
//             const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                 body: JSON.stringify({ 
//                     prompt: promptToSend,
//                     is_temporary: isCurrentChatTemporary
//                 }),
//             });
//             const data = await response.json();
//             if (!response.ok) throw new Error(data.detail || 'An unknown error occurred.');
            
//             const finalMessages = [...currentMessages, { role: 'assistant', content: data.response }];
//             setMessages(finalMessages);

//             if (!isCurrentChatTemporary) {
//                 await fetchHistory();
//             }
//         } catch (err) {
//             setMessages([...currentMessages, { role: 'assistant', content: { error: err.message } }]);
//         } finally {
//             setIsAiLoading(false);
//         }
//     };

//     const handleFormSubmit = (e) => { e.preventDefault(); handleAiSubmit(promptInput); };
//     const getInitials = (email) => { if (!email) return '??'; return email.substring(0, 2).toUpperCase(); };
//     const handleEditClick = (index, content) => { setEditingMessage({ index, content }); setEditedContent(content); };
//     const handleCancelEdit = () => { setEditingMessage(null); };
//     const handleSaveEdit = (indexToSave) => {
//         const updatedMessages = messages.map((msg, index) => index === indexToSave ? { ...msg, content: editedContent } : msg);
//         const messagesForResubmit = updatedMessages.slice(0, indexToSave + 1);
//         setMessages(messagesForResubmit);
//         handleAiSubmit(editedContent, messagesForResubmit);
//         setEditingMessage(null);
//     };
    
//     const handleArchiveToggle = async (chatId) => {
//         await fetch(`http://127.0.0.1:8000/history/${chatId}/archive`, {
//             method: 'PUT',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         fetchHistory();
//     };

//     const handleDelete = async () => {
//         if (!chatToModify) return;
//         await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}`, {
//             method: 'DELETE',
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         if (messages.length > 0 && (recentHistory.find(h => h.id === chatToModify.id) || archivedHistory.find(h => h.id === chatToModify.id))) {
//             handleNewGeneration();
//         }
//         fetchHistory();
//         setDeleteAlertOpen(false);
//     };

//     const handleCopyPrompt = (content) => {
//         navigator.clipboard.writeText(content);
//     };

//     const handleRename = async () => {
//         if (!chatToModify || !newTitle.trim()) return;
//         const response = await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}/rename`, {
//             method: 'PUT',
//             headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//             body: JSON.stringify({ title: newTitle })
//         });
//         if (response.ok) {
//             fetchHistory();
//             setRenameModalOpen(false);
//             setNewTitle("");
//         }
//     };

//     const exportAsJSON = (jsonData) => {
//         const dataStr = JSON.stringify(jsonData, null, 2);
//         const blob = new Blob([dataStr], { type: "application/json" });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = 'data.json';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     const exportAsCSV = (jsonData) => {
//         let dataArray = [];
//         if (Array.isArray(jsonData)) dataArray = jsonData;
//         else if (typeof jsonData === 'object' && jsonData !== null) {
//             const arrayKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
//             if (arrayKey) dataArray = jsonData[arrayKey];
//         }
//         if (dataArray.length === 0) {
//             alert("Could not find a valid array of data to convert to CSV.");
//             return;
//         }
//         const headers = Object.keys(dataArray[0] || {});
//         const csvRows = [headers.join(','), ...dataArray.map(row => headers.map(header => JSON.stringify(row[header], (key, value) => value === null ? '' : value)).join(','))];
//         const csvContent = csvRows.join('\n');
//         const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = 'data.csv';
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     };

//     return (
//         <div className="flex h-full">
//             <aside className={`bg-black p-4 flex flex-col justify-between transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
//                 <div>
//                     <div className="flex items-center justify-between mb-6">
//                         {!isSidebarCollapsed && <h2 className="text-xl font-bold">Data Mocker AI</h2>}
//                         <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
//                             {isSidebarCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
//                         </Button>
//                     </div>
//                     <nav className="flex flex-col gap-2">
//                         <Button variant="ghost" className="justify-start gap-2" onClick={handleNewGeneration}>
//                             <Plus size={16} /> {!isSidebarCollapsed && "New Chat"}
//                         </Button>
//                         <Button variant="ghost" className="justify-start gap-2" onClick={() => setIsTemporaryChat(!isTemporaryChat)}>
//                             {isTemporaryChat ? <CheckSquare size={16} className="text-blue-500" /> : <Square size={16} />}
//                             {!isSidebarCollapsed && "Temporary Chat"}
//                         </Button>
//                         <div className="mt-4 flex-grow overflow-y-auto">
//                             {!isSidebarCollapsed && <p className="text-xs text-muted-foreground px-2 mb-2">Recent</p>}
//                             {recentHistory.map((chat) => (
//                                 <div key={chat.id} className="flex items-center group">
//                                     <Button variant="ghost" onClick={() => setMessages(chat.messages)} className="flex-1 truncate justify-start text-left">
//                                         <MessageSquare size={14} className="mr-2"/> {!isSidebarCollapsed && chat.title}
//                                     </Button>
//                                     <div className="opacity-0 group-hover:opacity-100 flex items-center">
//                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><Archive size={16} /></Button>
//                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 size={16} /></Button>
//                                     </div>
//                                 </div>
//                             ))}
//                             {archivedHistory.length > 0 && (
//                                 <div className="mt-4">
//                                   {!isSidebarCollapsed && <p className="text-xs text-muted-foreground px-2 mb-2">Archived</p>}
//                                   {archivedHistory.map((chat) => (
//                                       <div key={chat.id} className="flex items-center group">
//                                           <Button variant="ghost" onClick={() => setMessages(chat.messages)} className="flex-1 truncate justify-start text-left">
//                                               <MessageSquare size={14} className="mr-2"/> {!isSidebarCollapsed && chat.title}
//                                           </Button>
//                                           <div className="opacity-0 group-hover:opacity-100 flex items-center">
//                                               <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><ArchiveRestore size={16} /></Button>
//                                               <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 size={16} /></Button>
//                                           </div>
//                                       </div>
//                                   ))}
//                                 </div>
//                             )}
//                         </div>
//                     </nav>
//                 </div>
//                 <div className={`flex items-center gap-3 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
//                     <Avatar><AvatarFallback>{user ? getInitials(user.email) : '...'}</AvatarFallback></Avatar>
//                     {!isSidebarCollapsed && (<div className="flex-1 overflow-hidden"><p className="text-sm font-medium truncate">{user ? user.email : 'Loading...'}</p></div>)}
//                     <Button variant="ghost" size="icon" onClick={logout} className="text-muted-foreground"><LogOut size={16} /></Button>
//                 </div>
//             </aside>
//             <main className="flex-1 flex flex-col p-6">
//                 <div className="flex-1 overflow-y-auto pr-4">
//                     {isCurrentChatTemporary && messages.length > 0 && (
//                         <div className="p-2 mb-4 text-center bg-yellow-900/50 text-yellow-300 text-xs rounded-md">
//                             You are in a temporary chat. This conversation will not be saved.
//                         </div>
//                     )}
//                     {messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full">
//                             <h1 className="text-4xl font-bold">Data Mocker AI</h1>
//                             <p className="text-muted-foreground mt-2">How can I help you today?</p>
//                         </div>
//                     ) : (
//                         <div className="flex flex-col gap-4">
//                             {messages.map((msg, index) => (
//                                 <div key={index}>
//                                     {editingMessage?.index === index ? (
//                                         <div className="bg-gray-800 p-3 rounded-lg">
//                                             <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} className="bg-black/50 border-gray-700" rows={3}/>
//                                             <div className="flex justify-end gap-2 mt-2">
//                                                 <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
//                                                 <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <div className={`flex items-center gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                             {msg.role === 'user' && (
//                                                 <div className="flex">
//                                                     <Button variant="ghost" size="icon" onClick={() => handleCopyPrompt(msg.content)}><Copy className="h-4 w-4 text-muted-foreground" /></Button>
//                                                     <Button variant="ghost" size="icon" onClick={() => handleEditClick(index, msg.content)}><Edit className="h-4 w-4 text-muted-foreground" /></Button>
//                                                 </div>
//                                             )}
//                                             <div className={`p-3 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
//                                                 {msg.role === 'assistant' ? (
//                                                     <div>
//                                                         {msg.content.error ? ( <p className="text-red-400">Error: {msg.content.error}</p> ) : (
//                                                             <>
//                                                                 <JsonTable jsonData={msg.content} />
//                                                                 <div className="flex gap-2 mt-2">
//                                                                     <Button size="sm" variant="secondary" onClick={() => exportAsJSON(msg.content)}>Export JSON</Button>
//                                                                     <Button size="sm" variant="secondary" onClick={() => exportAsCSV(msg.content)}>Export CSV</Button>
//                                                                 </div>
//                                                             </>
//                                                         )}
//                                                     </div>
//                                                 ) : (<p>{msg.content}</p>)}
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                             <div ref={chatEndRef} />
//                         </div>
//                     )}
//                 </div>
//                 <div className="pt-4">
//                     <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
//                         <Input value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Describe the data you want..." disabled={isAiLoading} className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"/>
//                         <Button type="submit" size="icon" disabled={isAiLoading}>{isAiLoading ? '...' : <Send className="h-4 w-4" />}</Button>
//                     </form>
//                 </div>
//             </main>
//             <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}>
//                 <DialogContent className="bg-gray-900 border-gray-800 text-white">
//                     <DialogHeader><DialogTitle>Rename Chat</DialogTitle></DialogHeader>
//                     <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="bg-gray-800 border-gray-700"/>
//                     <DialogFooter><Button onClick={handleRename}>Save</Button></DialogFooter>
//                 </DialogContent>
//             </Dialog>
//             <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
//                 <AlertDialogContent className="bg-gray-900 border-gray-800 text-white">
//                     <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader>
//                     <AlertDialogDescription>This action cannot be undone. This will permanently delete this conversation.</AlertDialogDescription>
//                     <AlertDialogFooter>
//                         <AlertDialogCancel>Cancel</AlertDialogCancel>
//                         <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
//                     </AlertDialogFooter>
//                 </AlertDialogContent>
//             </AlertDialog>
//         </div>
//     );
// };
// export default ChatPage;




// the 2 code start from here 
// import React, { useState, useRef, useEffect, useContext, createContext } from 'react';

// // --- AuthContext with Real API Calls ---
// const AuthContext = createContext(null);
// const AuthProvider = ({ children }) => {
//     const [user, setUser] = useState(null);
//     const [token, setToken] = useState(null);
//     const [authError, setAuthError] = useState("");
//     const [authMessage, setAuthMessage] = useState("");

//     const login = async (email, password) => {
//         setAuthError("");
//         setAuthMessage("");
//         try {
//             const formData = new URLSearchParams();
//             formData.append('username', email);
//             formData.append('password', password);

//             const response = await fetch('http://127.0.0.1:8000/token', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//                 body: formData,
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || "Login failed");
//             }

//             const data = await response.json();
//             setToken(data.access_token);
//             setUser({ email });
//             console.log("User logged in successfully.");
//             return true;
//         } catch (error) {
//             console.error("Login error:", error);
//             setAuthError(error.message);
//             return false;
//         }
//     };

//     const signup = async (email, password) => {
//         setAuthError("");
//         setAuthMessage("");
//         try {
//             const response = await fetch('http://127.0.0.1:8000/register', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email, password }),
//             });

//             if (!response.ok) {
//                  const errorData = await response.json();
//                 throw new Error(errorData.detail || "Signup failed");
//             }
//             return await login(email, password);
//         } catch (error) {
//             console.error("Signup error:", error);
//             setAuthError(error.message);
//             return false;
//         }
//     };
    
//     const forgotPassword = async (email) => {
//         setAuthError("");
//         setAuthMessage("");
//          try {
//             const response = await fetch('http://127.0.0.1:8000/forgot-password', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ email }),
//             });
//             const data = await response.json();
//              if (!response.ok) {
//                 throw new Error(data.detail || "Failed to send reset link");
//             }
//             setAuthMessage(data.msg);
//         } catch (error) {
//             console.error("Forgot password error:", error);
//             setAuthError(error.message);
//         }
//     };

//     const resetPassword = async (token, password) => {
//         setAuthError("");
//         setAuthMessage("");
//         try {
//             const response = await fetch('http://127.0.0.1:8000/reset-password', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json' },
//                 body: JSON.stringify({ token, password }),
//             });
//              const data = await response.json();
//             if (!response.ok) {
//                 throw new Error(data.detail || "Failed to reset password");
//             }
//             setAuthMessage(data.msg + " Please log in with your new password.");
//             return true;
//         } catch (error) {
//              console.error("Reset password error:", error);
//             setAuthError(error.message);
//             return false;
//         }
//     };


//     const logout = () => {
//         setUser(null);
//         setToken(null);
//         console.log("User logged out.");
//     };

//     return (
//         <AuthContext.Provider value={{ user, token, login, logout, signup, forgotPassword, resetPassword, authError, authMessage, setAuthError, setAuthMessage }}>
//             {children}
//         </AuthContext.Provider>
//     );
// };


// // --- Inline SVG Icons (replacing lucide-react) ---
// const Send = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
// const Plus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
// const LogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
// const Archive = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
// const Trash2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
// const Edit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 0 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
// const MessageSquare = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
// const ArchiveRestore = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
// const PanelLeftCloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>;
// const PanelRightOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m15 9 3 3-3 3"/></svg>;
// const Copy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
// const TempChatIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>;
// const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
// const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.817 1.192-3.05 3.5-6.828 3.5S1.99 9.192 1.173 8z"/><path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z"/></svg>;
// const EyeOffIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M13.359 11.238C15.06 9.72 16 8 16 8s-3-5.5-8-5.5a7.028 7.028 0 0 0-2.79.588l.77.771A5.94 5.94 0 0 1 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.134 13.134 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755-.165.165-.337.328-.517.486l.708.709z"/><path d="M11.297 9.176a3.5 3.5 0 0 0-4.474-4.474l.823.823a2.5 2.5 0 0 1 2.829 2.829l.822.822zm-2.943 1.288.78.781c.294.288.625.495.98.634l.793-.793a3.5 3.5 0 0 0-4.474-4.474l.793.793c.123.344.33.65.61.928z"/><path d="M3.35 5.47c-.18.16-.353.322-.518.487A13.134 13.134 0 0 0 1.172 8l.195.288c.335.48.83 1.12 1.465 1.755C4.121 11.332 5.881 12.5 8 12.5c.716 0 1.39-.133 2.02-.36l.77.772A7.029 7.029 0 0 1 8 13.5C3 13.5 0 8 0 8s.939-1.721 2.641-3.238l.708.709zm10.296 6.884-12-12 .708-.708 12 12-.708.708z"/></svg>;


// // --- UI Components (replacing shadcn/ui) ---
// const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
//     const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
//     const variants = {
//         default: 'bg-blue-600 text-white hover:bg-blue-700',
//         ghost: 'hover:bg-gray-700 hover:text-white',
//         secondary: 'bg-gray-600 text-white hover:bg-gray-500',
//         link: 'text-blue-400 underline-offset-4 hover:underline',
//     };
//     const sizes = {
//         default: 'h-10 py-2 px-4',
//         sm: 'h-9 px-3 rounded-md',
//         icon: 'h-10 w-10',
//     };
//     return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
// };
// const Input = ({ className = '', ...props }) => <input className={`flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
// const Textarea = ({ className = '', ...props }) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
// const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => onOpenChange(false)}><div onClick={e => e.stopPropagation()}>{children}</div></div> : null;
// const DialogContent = ({ children, className }) => <div className={`relative z-50 grid w-full max-w-lg gap-4 border bg-gray-900 border-gray-800 p-6 shadow-lg rounded-lg ${className}`}>{children}</div>;
// const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
// const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold leading-none tracking-tight text-white">{children}</h2>;
// const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">{children}</div>;
// const AlertDialog = Dialog;
// const AlertDialogContent = DialogContent;
// const AlertDialogHeader = DialogHeader;
// const AlertDialogTitle = DialogTitle;
// const AlertDialogDescription = ({ children }) => <p className="text-sm text-gray-400">{children}</p>;
// const AlertDialogFooter = DialogFooter;
// const AlertDialogCancel = (props) => <Button variant="ghost" {...props} />;
// const AlertDialogAction = ({ className, ...props }) => <Button className={`bg-red-600 hover:bg-red-700 ${className}`} {...props} />;
// const Avatar = ({ children }) => <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">{children}</div>;
// const AvatarFallback = ({ children }) => <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-700 text-white">{children}</span>;


// // --- Helper Functions ---
// const exportAsJSON = (jsonData) => { const dataStr = JSON.stringify(jsonData, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'data.json'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
// const exportAsCSV = (jsonData) => { let dataArray = []; if (Array.isArray(jsonData)) dataArray = jsonData; else if (typeof jsonData === 'object' && jsonData !== null) { const dataKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key])); if (dataKey) dataArray = jsonData[dataKey]; else dataArray = [jsonData]; } if (dataArray.length === 0) { alert("Could not find a valid array of data to convert to CSV."); return; } const headers = Object.keys(dataArray[0] || {}); const csvRows = [headers.join(','), ...dataArray.map(row => headers.map(header => JSON.stringify(row[header], (_, value) => value === null ? '' : value)).join(','))]; const csvContent = csvRows.join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'data.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

// // --- JsonTable Component ---
// const JsonTable = ({ jsonData }) => {
//     let dataArray = [];
//     if (Array.isArray(jsonData)) {
//         dataArray = jsonData;
//     } else if (typeof jsonData === 'object' && jsonData !== null) {
//         const keyWithArray = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
//         if (keyWithArray) {
//             dataArray = jsonData[keyWithArray];
//         } else {
//             dataArray = [jsonData];
//         }
//     }

//     if (dataArray.length === 0 || typeof dataArray[0] !== 'object' || dataArray[0] === null) {
//         return (
//             <pre className="bg-black/20 p-4 rounded-md text-xs text-white overflow-auto">
//                 <code>{JSON.stringify(jsonData, null, 2)}</code>
//             </pre>
//         );
//     }

//     const headers = Object.keys(dataArray[0]);

//     return (
//         <div className="overflow-x-auto rounded-lg border border-gray-700">
//             <table className="w-full text-sm text-left text-gray-300">
//                 <thead className="text-xs text-white uppercase bg-gray-700/50">
//                     <tr>
//                         {headers.map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {dataArray.map((row, index) => (
//                         <tr key={index} className="bg-gray-800/50 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
//                             {headers.map(header => (
//                                 <td key={`${index}-${header}`} className="px-6 py-4">
//                                     {typeof row[header] === 'object' && row[header] !== null ? JSON.stringify(row[header]) : String(row[header])}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// // --- New Temporary Chat Interface ---
// const TemporaryChatInterface = ({ onClose }) => {
//     const [messages, setMessages] = useState([{ role: 'assistant', content: 'This is a temporary chat. History will not be saved.' }]);
//     const [input, setInput] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [editingMessage, setEditingMessage] = useState(null);
//     const [editedContent, setEditedContent] = useState("");
//     const chatEndRef = useRef(null);
//     const { token } = useContext(AuthContext);

//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     const handleSubmit = async (promptToSend, existingMessages = null) => {
//         if (!promptToSend.trim() || isLoading) return;

//         const currentMessages = existingMessages ? existingMessages : [...messages, { role: 'user', content: promptToSend }];
//         if (!existingMessages) {
//             setMessages(currentMessages);
//             setInput('');
//         }
//         setIsLoading(true);

//         try {
//             const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                 body: JSON.stringify({
//                     prompt: promptToSend,
//                     is_temporary: true 
//                 }),
//             });

//             if (!response.ok) {
//                  const errorData = await response.json();
//                 throw new Error(errorData.detail || `API call failed with status: ${response.status}`);
//             }
//             const data = await response.json();
//             setMessages([...currentMessages, { role: 'assistant', content: data.response }]);

//         } catch (error) {
//             console.error("Error calling local backend:", error);
//             setMessages([...currentMessages, { role: 'assistant', content: { error: error.message } }]);
//         } finally {
//             setIsLoading(false);
//         }
//     };
    
//     const handleFormSubmit = (e) => {
//         e.preventDefault();
//         handleSubmit(input);
//     };

//     const handleCopyPrompt = (content) => {
//         navigator.clipboard.writeText(content);
//     };

//     const handleEditClick = (index, content) => {
//         setEditingMessage({ index, content });
//         setEditedContent(content);
//     };
    
//     const handleCancelEdit = () => {
//         setEditingMessage(null);
//     };

//     const handleSaveEdit = (indexToSave) => {
//         const updatedMessages = messages.map((msg, index) =>
//             index === indexToSave ? { ...msg, content: editedContent } : msg
//         );
//         const messagesToResubmit = updatedMessages.slice(0, indexToSave + 1);
//         setMessages(messagesToResubmit);
//         handleSubmit(editedContent, messagesToResubmit);
//         setEditingMessage(null);
//     };

//     const renderContent = (content) => {
//         if (typeof content === 'object' && content !== null) {
//             if (content.error) {
//                 return <p className="text-red-400 whitespace-pre-wrap">Error: {content.error}</p>;
//             }
//             return (
//                  <>
//                     <JsonTable jsonData={content} />
//                     <div className="flex gap-2 mt-4 border-t border-gray-700 pt-2">
//                         <Button size="sm" variant="secondary" onClick={() => exportAsJSON(content)}>Export JSON</Button>
//                         <Button size="sm" variant="secondary" onClick={() => exportAsCSV(content)}>Export CSV</Button>
//                     </div>
//                 </>
//             );
//         }
//         return <p className="whitespace-pre-wrap">{String(content)}</p>;
//     };

//     return (
//         <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col animate-slide-in">
//             <style>{`
//                 @keyframes slide-in {
//                     from { transform: translateY(100%); }
//                     to { transform: translateY(0); }
//                 }
//             `}</style>
//             <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
//                 <h2 className="text-xl font-bold">Temporary Chat</h2>
//                 <Button variant="ghost" size="icon" onClick={onClose}><CloseIcon /></Button>
//             </header>
//             <main className="flex-1 overflow-y-auto p-6">
//                 <div className="flex flex-col gap-4">
//                     {messages.map((msg, index) => (
//                         <div key={index}>
//                             {editingMessage?.index === index ? (
//                                 <div className="bg-gray-800 p-3 rounded-lg">
//                                     <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={3} />
//                                     <div className="flex justify-end gap-2 mt-2">
//                                         <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
//                                         <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                     <div className={`p-4 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700'}`}>
//                                        {renderContent(msg.content)}
//                                     </div>
//                                     {msg.role === 'user' && (
//                                         <div className="flex flex-col">
//                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyPrompt(msg.content)}><Copy /></Button>
//                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(index, msg.content)}><Edit /></Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <div ref={chatEndRef} />
//                 </div>
//             </main>
//             <footer className="p-4">
//                 <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
//                     <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message..." disabled={isLoading} className="bg-transparent border-none focus-visible:ring-0" />
//                     <Button type="submit" size="icon" disabled={isLoading}>{isLoading ? '...' : <Send />}</Button>
//                 </form>
//             </footer>
//         </div>
//     );
// };


// // --- The Main Data Mocker Component ---
// const ChatPageComponent = ({ onOpenTempChat }) => {
//     const [messages, setMessages] = useState([]);
//     const [promptInput, setPromptInput] = useState('');
//     const [isAiLoading, setIsAiLoading] = useState(false);
//     const [recentHistory, setRecentHistory] = useState([]);
//     const [archivedHistory, setArchivedHistory] = useState([]);
//     const [editingMessage, setEditingMessage] = useState(null);
//     const [editedContent, setEditedContent] = useState("");
//     const [renameModalOpen, setRenameModalOpen] = useState(false);
//     const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
//     const [chatToModify, setChatToModify] = useState(null);
//     const [newTitle, setNewTitle] = useState("");
//     const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//     const [currentChatId, setCurrentChatId] = useState(null);
    
//     const auth = useContext(AuthContext);
//     const chatEndRef = useRef(null);
    
//     const fetchHistory = async () => {
//         if (!auth.token) return;
//         try {
//             const [recentRes, archivedRes] = await Promise.all([
//                 fetch('http://127.0.0.1:8000/history', { headers: { 'Authorization': `Bearer ${auth.token}` } }),
//                 fetch('http://127.0.0.1:8000/history/archived', { headers: { 'Authorization': `Bearer ${auth.token}` } })
//             ]);

//             if (recentRes.ok) {
//                 const recentData = await recentRes.json();
//                 setRecentHistory(recentData.map(chat => ({...chat, messages: JSON.parse(chat.conversation)})));
//             }
//              if (archivedRes.ok) {
//                 const archivedData = await archivedRes.json();
//                 setArchivedHistory(archivedData.map(chat => ({...chat, messages: JSON.parse(chat.conversation)})));
//             }
//         } catch (error) {
//             console.error("Failed to fetch history:", error);
//         }
//     };

//     useEffect(() => {
//         fetchHistory();
//     }, [auth.token]);

//     useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
//     const handleNewGeneration = () => {
//         setMessages([]);
//         setCurrentChatId(null);
//     };
    
//     const handleAiSubmit = async (promptToSend, existingMessages = []) => {
//         if (!promptToSend.trim()) return;
//         const currentMessages = existingMessages.length > 0 ? existingMessages : [...messages, { role: 'user', content: promptToSend }];
//         if (existingMessages.length === 0) {
//             setMessages(currentMessages);
//             setPromptInput('');
//         }
//         setIsAiLoading(true);

//         try {
//             const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
//                 body: JSON.stringify({
//                     prompt: promptToSend,
//                     is_temporary: false 
//                 }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || `API call failed with status: ${response.status}`);
//             }

//             const data = await response.json();
//             const jsonResponse = data.response;
//             const finalMessages = [...currentMessages, { role: 'assistant', content: jsonResponse }];
//             setMessages(finalMessages);
//             await fetchHistory();


//         } catch (err) {
//             setMessages([...currentMessages, { role: 'assistant', content: { error: err.message } }]);
//         } finally {
//             setIsAiLoading(false);
//         }
//     };

//     const handleFormSubmit = (e) => { e.preventDefault(); handleAiSubmit(promptInput); };
//     const getInitials = (email) => { if (!email) return '??'; return email.substring(0, 2).toUpperCase(); };
//     const handleEditClick = (index, content) => { setEditingMessage({ index, content }); setEditedContent(content); };
//     const handleCancelEdit = () => { setEditingMessage(null); };
//     const handleSaveEdit = (indexToSave) => {
//         const updatedMessages = messages.map((msg, index) => index === indexToSave ? { ...msg, content: editedContent } : msg);
//         const messagesForResubmit = updatedMessages.slice(0, indexToSave + 1);
//         setMessages(messagesForResubmit);
//         handleAiSubmit(editedContent, messagesForResubmit);
//         setEditingMessage(null);
//     };
    
//     const handleArchiveToggle = async (chatId) => {
//         try {
//             await fetch(`http://127.0.0.1:8000/history/${chatId}/archive`, {
//                 method: 'PUT',
//                 headers: { 'Authorization': `Bearer ${auth.token}` }
//             });
//             await fetchHistory();
//         } catch (error) {
//             console.error("Failed to archive/unarchive chat:", error);
//         }
//     };
    
//     const handleDelete = async () => {
//         if (!chatToModify) return;
        
//         try {
//              await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${auth.token}` }
//             });

//             if (currentChatId === chatToModify.id) {
//                 handleNewGeneration();
//             }
//             await fetchHistory();
//         } catch (error) {
//             console.error("Failed to delete chat:", error);
//         } finally {
//             setDeleteAlertOpen(false);
//             setChatToModify(null);
//         }
//     };

//     const handleCopyPrompt = (content) => { navigator.clipboard.writeText(content); };
//     const handleRename = async () => { 
//         if (!chatToModify || !newTitle.trim()) return;
//         try {
//             await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}/rename`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
//                 body: JSON.stringify({ title: newTitle })
//             });
//             await fetchHistory();
//         } catch(error) {
//             console.error("Failed to rename chat:", error);
//         } finally {
//             setRenameModalOpen(false);
//             setNewTitle("");
//         }
//     };
    
//     if (!auth?.user) return null;

//     const handleSelectChat = (chat) => {
//         setMessages(chat.messages);
//         setCurrentChatId(chat.id);
//     }

//     return (
//         <div className="flex h-screen bg-gray-900 text-white font-sans">
//             <aside className={`bg-black p-4 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
//                 {/* Top Section */}
//                 <div>
//                     <div className="flex items-center justify-between mb-6">
//                         {!isSidebarCollapsed && <h2 className="text-xl font-bold">Data Mocker AI</h2>}
//                         <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
//                             {isSidebarCollapsed ? <PanelRightOpenIcon /> : <PanelLeftCloseIcon />}
//                         </Button>
//                     </div>
                    
//                     <div className="flex flex-col gap-2 mb-4">
//                          <Button variant="ghost" className="justify-start gap-2" onClick={handleNewGeneration}>
//                             <Plus /> {!isSidebarCollapsed && "New Chat"}
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Middle, Scrollable Section */}
//                 <nav className="flex-grow min-h-0 overflow-y-auto">
//                     { recentHistory.length > 0 && !isSidebarCollapsed && <p className="text-xs text-gray-400 px-2 mb-2">Recent</p>}
//                     {recentHistory.map((chat) => (
//                         <div key={chat.id} className="flex items-center group">
//                             <Button variant="ghost" onClick={() => handleSelectChat(chat)} className="flex-1 truncate justify-start text-left gap-2">
//                                 <MessageSquare/> {!isSidebarCollapsed && chat.title}
//                             </Button>
//                             <div className={`opacity-0 group-hover:opacity-100 flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
//                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><Archive /></Button>
//                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 /></Button>
//                             </div>
//                         </div>
//                     ))}
//                     {archivedHistory.length > 0 && (
//                         <div className="mt-4">
//                             {!isSidebarCollapsed && <p className="text-xs text-gray-400 px-2 mb-2">Archived</p>}
//                             {archivedHistory.map((chat) => (
//                                 <div key={chat.id} className="flex items-center group">
//                                     <Button variant="ghost" onClick={() => handleSelectChat(chat)} className="flex-1 truncate justify-start text-left gap-2">
//                                         <MessageSquare/> {!isSidebarCollapsed && chat.title}
//                                     </Button>
//                                     <div className={`opacity-0 group-hover:opacity-100 flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
//                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><ArchiveRestore /></Button>
//                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 /></Button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </nav>
                
//                 {/* Bottom Section */}
//                 <div>
//                     <div className="flex flex-col gap-2 py-2">
//                         <Button variant="ghost" className="justify-start gap-2" onClick={onOpenTempChat}>
//                             <TempChatIcon /> {!isSidebarCollapsed && "Temporary Chat"}
//                         </Button>
//                     </div>
//                     <div className={`flex items-center gap-3 border-t border-gray-700 pt-4 mt-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
//                         <Avatar><AvatarFallback>{auth.user ? getInitials(auth.user.email) : '...'}</AvatarFallback></Avatar>
//                         {!isSidebarCollapsed && (<div className="flex-1 overflow-hidden"><p className="text-sm font-medium truncate">{auth.user ? auth.user.email : 'Loading...'}</p></div>)}
//                         <Button variant="ghost" size="icon" onClick={auth.logout} className="text-muted-foreground"><LogOut /></Button>
//                     </div>
//                 </div>
//             </aside>
//             <main className="flex-1 flex flex-col p-6 max-h-screen">
//                 <div className="flex-1 overflow-y-auto pr-4">
//                     {messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full">
//                             <h1 className="text-4xl font-bold">Data Mocker AI</h1>
//                             <p className="text-gray-400 mt-2">How can I help you today?</p>
//                         </div>
//                     ) : (
//                         <div className="flex flex-col gap-4">
//                             {messages.map((msg, index) => (
//                                 <div key={index}>
//                                     {editingMessage?.index === index ? (
//                                         <div className="bg-gray-800 p-3 rounded-lg">
//                                             <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={3}/>
//                                             <div className="flex justify-end gap-2 mt-2">
//                                                 <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
//                                                 <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                             <div className={`p-4 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
//                                                 {msg.role === 'assistant' ? (
//                                                     <div>
//                                                         {msg.content.error ? ( <p className="text-red-400">Error: {msg.content.error}</p> ) : (
//                                                             <>
//                                                                 <JsonTable jsonData={msg.content} />
//                                                                 <div className="flex gap-2 mt-4 border-t border-gray-700 pt-2">
//                                                                     <Button size="sm" variant="secondary" onClick={() => exportAsJSON(msg.content)}>Export JSON</Button>
//                                                                     <Button size="sm" variant="secondary" onClick={() => exportAsCSV(msg.content)}>Export CSV</Button>
//                                                                 </div>
//                                                             </>
//                                                         )}
//                                                     </div>
//                                                 ) : (<p className="whitespace-pre-wrap">{msg.content}</p>)}
//                                             </div>
//                                             {msg.role === 'user' && (
//                                                 <div className="flex flex-col">
//                                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyPrompt(msg.content)}><Copy /></Button>
//                                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(index, msg.content)}><Edit /></Button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                             <div ref={chatEndRef} />
//                         </div>
//                     )}
//                 </div>
//                 <div className="pt-4">
//                     <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
//                         <Input value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Describe the data you want..." disabled={isAiLoading} className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"/>
//                         <Button type="submit" size="icon" disabled={isAiLoading}>{isAiLoading ? '...' : <Send />}</Button>
//                     </form>
//                 </div>
//             </main>
//             <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}> <DialogContent> <DialogHeader><DialogTitle>Rename Chat</DialogTitle></DialogHeader> <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /> <DialogFooter><Button onClick={handleRename}>Save</Button></DialogFooter> </DialogContent> </Dialog>
//             <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}> <AlertDialogContent> <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader> <AlertDialogDescription>This action cannot be undone. This will permanently delete this conversation.</AlertDialogDescription> <AlertDialogFooter> <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction> </AlertDialogFooter> </AlertDialogContent> </AlertDialog>
//         </div>
//     );
// };

// const AuthComponent = () => {
//     const [authView, setAuthView] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [rememberMe, setRememberMe] = useState(false);
//     const [showPassword, setShowPassword] = useState(false);
//     const [resetToken, setResetToken] = useState(null);
//     const auth = useContext(AuthContext);

//     useEffect(() => {
//         const rememberedEmail = localStorage.getItem('rememberedEmail');
//         if (rememberedEmail) {
//             setEmail(rememberedEmail);
//             setRememberMe(true);
//         }
//         const urlParams = new URLSearchParams(window.location.search);
//         const token = urlParams.get('token');
//         if (token) {
//             setResetToken(token);
//             setAuthView('reset');
//         }

//     }, []);

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         let success = false;
//         if (authView === 'login') {
//             success = await auth.login(email, password);
//         } else if (authView === 'signup') {
//             success = await auth.signup(email, password);
//         } else if (authView === 'forgot') {
//             await auth.forgotPassword(email);
//             return;
//         } else if (authView === 'reset') {
//             success = await auth.resetPassword(resetToken, password);
//             if(success) {
//                 // Clear the token from URL
//                 window.history.replaceState({}, document.title, window.location.pathname);
//                 setAuthView('login');
//             }
//             return;
//         }

//         if (success) {
//             if (rememberMe) {
//                 localStorage.setItem('rememberedEmail', email);
//             } else {
//                 localStorage.removeItem('rememberedEmail');
//             }
//         }
//     };
    
//     const renderForm = () => {
//         if (authView === 'forgot') {
//             return (
//                  <form className="space-y-6" onSubmit={handleSubmit}>
//                     <div>
//                         <label className="text-sm font-bold text-gray-400 block">Email</label>
//                         <Input type="email" placeholder="you@example.com" required className="mt-1" value={email} onChange={e => setEmail(e.target.value)} />
//                     </div>
//                     <Button type="submit" className="w-full">Send Reset Link</Button>
//                 </form>
//             );
//         }
        
//         if (authView === 'reset') {
//             return (
//                  <form className="space-y-6" onSubmit={handleSubmit}>
//                     <div>
//                         <label className="text-sm font-bold text-gray-400 block">New Password</label>
//                          <div className="relative">
//                             <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required className="mt-1" value={password} onChange={e => setPassword(e.target.value)} />
//                             <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
//                                 {showPassword ? <EyeOffIcon /> : <EyeIcon />}
//                             </button>
//                         </div>
//                     </div>
//                     <Button type="submit" className="w-full">Reset Password</Button>
//                 </form>
//             );
//         }

//         return (
//              <form className="space-y-6" onSubmit={handleSubmit}>
//                 <div>
//                     <label className="text-sm font-bold text-gray-400 block">Email</label>
//                     <Input type="email" placeholder="you@example.com" required className="mt-1" value={email} onChange={e => setEmail(e.target.value)} />
//                 </div>
//                 <div>
//                      <label className="text-sm font-bold text-gray-400 block">Password</label>
//                     <div className="relative">
//                         <Input type={showPassword ? "text" : "password"} placeholder="••••••••" required className="mt-1" value={password} onChange={e => setPassword(e.target.value)} />
//                         <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400">
//                             {showPassword ? <EyeOffIcon /> : <EyeIcon />}
//                         </button>
//                     </div>
//                 </div>
//                  <div className="flex items-center justify-between">
//                     <div className="flex items-center">
//                         <input id="remember-me" name="remember-me" type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"/>
//                         <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-400">Remember me</label>
//                     </div>
//                     {authView === 'login' && (
//                         <div className="text-sm">
//                             <Button variant="link" type="button" onClick={() => setAuthView('forgot')}>Forgot your password?</Button>
//                         </div>
//                     )}
//                 </div>
//                 {auth.authError && <p className="text-sm text-red-500">{auth.authError}</p>}
//                 {auth.authMessage && <p className="text-sm text-green-500">{auth.authMessage}</p>}
//                 <Button type="submit" className="w-full">
//                     {authView === 'login' ? "Sign In" : "Sign Up"}
//                 </Button>
//             </form>
//         );
//     };

//     return (
//         <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
//             <div className="w-full max-w-sm p-8 space-y-6 bg-black rounded-lg shadow-lg">
//                 <div className="text-center">
//                     <h1 className="text-3xl font-bold">Data Mocker AI</h1>
//                     <p className="text-gray-400">
//                         {authView === 'login' && "Sign in to your account"}
//                         {authView === 'signup' && "Create a new account"}
//                         {authView === 'forgot' && "Reset your password"}
//                         {authView === 'reset' && "Set a new password"}
//                     </p>
//                 </div>
//                 {renderForm()}
//                 <div className="text-center">
//                     {authView !== 'forgot' && authView !== 'reset' && (
//                         <Button variant="link" type="button" onClick={() => { setAuthView(authView === 'login' ? 'signup' : 'login'); auth.setAuthError(""); auth.setAuthMessage(""); }}>
//                             {authView === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
//                         </Button>
//                     )}
//                      {(authView === 'forgot' || authView === 'reset') && (
//                         <Button variant="link" type="button" onClick={() => { setAuthView('login'); auth.setAuthError(""); auth.setAuthMessage(""); }}>
//                            Back to Sign In
//                         </Button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };


// // --- App Structure ---
// const App = () => {
//     const [view, setView] = useState('mocker');
//     const auth = useContext(AuthContext);

//     if (!auth.token) {
//         return <AuthComponent />;
//     }

//     return (
//         <div className="font-sans">
//             <div style={{ display: view === 'mocker' ? 'block' : 'none' }}>
//                 <ChatPageComponent onOpenTempChat={() => setView('tempChat')} />
//             </div>
            
//             {view === 'tempChat' && <TemporaryChatInterface onClose={() => setView('mocker')} />}
//         </div>
//     );
// }

// const ChatPage = () => {
//     return (
//         <AuthProvider>
//             <App />
//         </AuthProvider>
//     );
// };

// export default ChatPage;
















// 3 code 


// import React, { useState, useRef, useEffect, useContext } from 'react';
// import { AuthContext } from '../context/AuthContext';

// // --- Inline SVG Icons ---
// const Send = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
// const Plus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
// const LogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
// const Archive = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
// const Trash2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
// const Edit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 0 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
// const MessageSquare = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
// const ArchiveRestore = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
// const PanelLeftCloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>;
// const PanelRightOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m15 9 3 3-3 3"/></svg>;
// const Copy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
// const TempChatIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>;
// const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
// const PaperclipIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg>;

// // --- UI Components ---
// const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
//     const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
//     const variants = {
//         default: 'bg-blue-600 text-white hover:bg-blue-700',
//         ghost: 'hover:bg-gray-700 hover:text-white',
//         secondary: 'bg-gray-600 text-white hover:bg-gray-500',
//         link: 'text-blue-400 underline-offset-4 hover:underline',
//     };
//     const sizes = {
//         default: 'h-10 py-2 px-4',
//         sm: 'h-9 px-3 rounded-md',
//         icon: 'h-10 w-10',
//     };
//     return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
// };
// const Input = ({ className = '', ...props }) => <input className={`flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
// const Textarea = ({ className = '', ...props }) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
// const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => onOpenChange(false)}><div onClick={e => e.stopPropagation()}>{children}</div></div> : null;
// const DialogContent = ({ children, className }) => <div className={`relative z-50 grid w-full max-w-lg gap-4 border bg-gray-900 border-gray-800 p-6 shadow-lg rounded-lg ${className}`}>{children}</div>;
// const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
// const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold leading-none tracking-tight text-white">{children}</h2>;
// const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">{children}</div>;
// const AlertDialog = Dialog;
// const AlertDialogContent = DialogContent;
// const AlertDialogHeader = DialogHeader;
// const AlertDialogTitle = DialogTitle;
// const AlertDialogDescription = ({ children }) => <p className="text-sm text-gray-400">{children}</p>;
// const AlertDialogFooter = DialogFooter;
// const AlertDialogCancel = (props) => <Button variant="ghost" {...props} />;
// const AlertDialogAction = ({ className, ...props }) => <Button className={`bg-red-600 hover:bg-red-700 ${className}`} {...props} />;
// const Avatar = ({ children }) => <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">{children}</div>;
// const AvatarFallback = ({ children }) => <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-700 text-white">{children}</span>;


// // --- Helper Functions ---
// const exportAsJSON = (jsonData) => { const dataStr = JSON.stringify(jsonData, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'data.json'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
// const exportAsCSV = (jsonData) => { let dataArray = []; if (Array.isArray(jsonData)) dataArray = jsonData; else if (typeof jsonData === 'object' && jsonData !== null) { const dataKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key])); if (dataKey) dataArray = jsonData[dataKey]; else dataArray = [jsonData]; } if (dataArray.length === 0) { alert("Could not find a valid array of data to convert to CSV."); return; } const headers = Object.keys(dataArray[0] || {}); const csvRows = [headers.join(','), ...dataArray.map(row => headers.map(header => JSON.stringify(row[header], (_, value) => value === null ? '' : value)).join(','))]; const csvContent = csvRows.join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'data.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

// // --- JsonTable Component ---
// const JsonTable = ({ jsonData }) => {
//     let dataArray = [];
//     if (Array.isArray(jsonData)) {
//         dataArray = jsonData;
//     } else if (typeof jsonData === 'object' && jsonData !== null) {
//         const keyWithArray = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
//         if (keyWithArray) {
//             dataArray = jsonData[keyWithArray];
//         } else {
//             dataArray = [jsonData];
//         }
//     }

//     if (dataArray.length === 0 || typeof dataArray[0] !== 'object' || dataArray[0] === null) {
//         return (
//             <pre className="bg-black/20 p-4 rounded-md text-xs text-white overflow-auto">
//                 <code>{JSON.stringify(jsonData, null, 2)}</code>
//             </pre>
//         );
//     }

//     const headers = Object.keys(dataArray[0]);

//     return (
//         <div className="overflow-x-auto rounded-lg border border-gray-700">
//             <table className="w-full text-sm text-left text-gray-300">
//                 <thead className="text-xs text-white uppercase bg-gray-700/50">
//                     <tr>
//                         {headers.map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {dataArray.map((row, index) => (
//                         <tr key={index} className="bg-gray-800/50 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
//                             {headers.map(header => (
//                                 <td key={`${index}-${header}`} className="px-6 py-4">
//                                     {typeof row[header] === 'object' && row[header] !== null ? JSON.stringify(row[header]) : String(row[header])}
//                                 </td>
//                             ))}
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// };

// // --- New Temporary Chat Interface ---
// const TemporaryChatInterface = ({ onClose }) => {
//     const [messages, setMessages] = useState([{ role: 'assistant', content: 'This is a temporary chat. History will not be saved.' }]);
//     const [input, setInput] = useState('');
//     const [isLoading, setIsLoading] = useState(false);
//     const [editingMessage, setEditingMessage] = useState(null);
//     const [editedContent, setEditedContent] = useState("");
//     const [fileName, setFileName] = useState(null);
//     const [fileContent, setFileContent] = useState(null);
//     const fileInputRef = useRef(null);
//     const chatEndRef = useRef(null);
//     const { token } = useContext(AuthContext);

//     useEffect(() => {
//         chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//     }, [messages]);

//     const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         setFileName(file.name);
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const text = e.target.result;
//             if (file.name.endsWith('.json')) {
//                 setFileContent(JSON.parse(text));
//             } else if (file.name.endsWith('.csv')) {
//                 const lines = text.split('\n');
//                 const headers = lines[0].split(',').map(h => h.trim());
//                 const json = lines.slice(1).map(line => {
//                     const values = line.split(',').map(v => v.trim());
//                     return headers.reduce((obj, header, index) => {
//                         obj[header] = values[index];
//                         return obj;
//                     }, {});
//                 });
//                 setFileContent(json);
//             }
//         };
//         reader.readAsText(file);
//     };

//     const handleSubmit = async (promptToSend, existingMessages = null) => {
//         if (!promptToSend.trim() || isLoading) return;
        
//         const finalPrompt = fileContent 
//             ? `Using the following data as context:\n\n${JSON.stringify(fileContent, null, 2)}\n\nPlease apply this instruction: ${promptToSend}`
//             : promptToSend;

//         const currentMessages = existingMessages ? existingMessages : [...messages, { role: 'user', content: promptToSend }];
//         if (!existingMessages) {
//             setMessages(currentMessages);
//             setInput('');
//         }
//         setIsLoading(true);
//         setFileName(null);
//         setFileContent(null);

//         try {
//             const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
//                 body: JSON.stringify({
//                     prompt: finalPrompt,
//                     is_temporary: true 
//                 }),
//             });

//             if (!response.ok) {
//                  const errorData = await response.json();
//                 throw new Error(errorData.detail || `API call failed with status: ${response.status}`);
//             }
//             const data = await response.json();
//             setMessages([...currentMessages, { role: 'assistant', content: data.response }]);

//         } catch (error) {
//             console.error("Error calling local backend:", error);
//             setMessages([...currentMessages, { role: 'assistant', content: { error: error.message } }]);
//         } finally {
//             setIsLoading(false);
//         }
//     };
    
//     const handleFormSubmit = (e) => {
//         e.preventDefault();
//         handleSubmit(input);
//     };

//     const handleCopyPrompt = (content) => {
//         navigator.clipboard.writeText(content);
//     };

//     const handleEditClick = (index, content) => {
//         setEditingMessage({ index, content });
//         setEditedContent(content);
//     };
    
//     const handleCancelEdit = () => {
//         setEditingMessage(null);
//     };

//     const handleSaveEdit = (indexToSave) => {
//         const updatedMessages = messages.map((msg, index) =>
//             index === indexToSave ? { ...msg, content: editedContent } : msg
//         );
//         const messagesToResubmit = updatedMessages.slice(0, indexToSave + 1);
//         setMessages(messagesToResubmit);
//         handleSubmit(editedContent, messagesToResubmit);
//         setEditingMessage(null);
//     };

//     const renderContent = (content) => {
//         if (typeof content === 'object' && content !== null) {
//             if (content.error) {
//                 return <p className="text-red-400 whitespace-pre-wrap">Error: {content.error}</p>;
//             }
//             return (
//                  <>
//                     <JsonTable jsonData={content} />
//                     <div className="flex gap-2 mt-4 border-t border-gray-700 pt-2">
//                         <Button size="sm" variant="secondary" onClick={() => exportAsJSON(content)}>Export JSON</Button>
//                         <Button size="sm" variant="secondary" onClick={() => exportAsCSV(content)}>Export CSV</Button>
//                     </div>
//                 </>
//             );
//         }
//         return <p className="whitespace-pre-wrap">{String(content)}</p>;
//     };

//     return (
//         <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col animate-slide-in">
//             <style>{`
//                 @keyframes slide-in {
//                     from { transform: translateY(100%); }
//                     to { transform: translateY(0); }
//                 }
//             `}</style>
//             <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
//                 <h2 className="text-xl font-bold">Temporary Chat</h2>
//                 <Button variant="ghost" size="icon" onClick={onClose}><CloseIcon /></Button>
//             </header>
//             <main className="flex-1 overflow-y-auto p-6">
//                 <div className="flex flex-col gap-4">
//                     {messages.map((msg, index) => (
//                         <div key={index}>
//                             {editingMessage?.index === index ? (
//                                 <div className="bg-gray-800 p-3 rounded-lg">
//                                     <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={3} />
//                                     <div className="flex justify-end gap-2 mt-2">
//                                         <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
//                                         <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
//                                     </div>
//                                 </div>
//                             ) : (
//                                 <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                     <div className={`p-4 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-purple-600 text-white' : 'bg-gray-700'}`}>
//                                        {renderContent(msg.content)}
//                                     </div>
//                                     {msg.role === 'user' && (
//                                         <div className="flex flex-col">
//                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyPrompt(msg.content)}><Copy /></Button>
//                                             <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(index, msg.content)}><Edit /></Button>
//                                         </div>
//                                     )}
//                                 </div>
//                             )}
//                         </div>
//                     ))}
//                     <div ref={chatEndRef} />
//                 </div>
//             </main>
//             <footer className="p-4">
//                 {fileName && (
//                     <div className="flex items-center justify-between bg-gray-700 text-xs px-3 py-1 rounded-md mb-2">
//                         <span>{fileName}</span>
//                         <button onClick={() => { setFileName(null); setFileContent(null); }} className="text-gray-400 hover:text-white">&times;</button>
//                     </div>
//                 )}
//                 <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
//                     <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current.click()}>
//                         <Plus />
//                     </Button>
//                     <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv"/>
//                     <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message or upload a file..." disabled={isLoading} className="bg-transparent border-none focus-visible:ring-0" />
//                     <Button type="submit" size="icon" disabled={isLoading}>{isLoading ? '...' : <Send />}</Button>
//                 </form>
//             </footer>
//         </div>
//     );
// };


// // --- The Main App Component ---
// const ChatPage = () => {
//     const [view, setView] = useState('mocker');
    
//     return (
//         <div className="font-sans">
//             <div style={{ display: view === 'mocker' ? 'block' : 'none' }}>
//                 <ChatPageComponent onOpenTempChat={() => setView('tempChat')} />
//             </div>
            
//             {view === 'tempChat' && <TemporaryChatInterface onClose={() => setView('mocker')} />}
//         </div>
//     );
// };

// const ChatPageComponent = ({ onOpenTempChat }) => {
//     const [messages, setMessages] = useState([]);
//     const [promptInput, setPromptInput] = useState('');
//     const [isAiLoading, setIsAiLoading] = useState(false);
//     const [recentHistory, setRecentHistory] = useState([]);
//     const [archivedHistory, setArchivedHistory] = useState([]);
//     const [editingMessage, setEditingMessage] = useState(null);
//     const [editedContent, setEditedContent] = useState("");
//     const [renameModalOpen, setRenameModalOpen] = useState(false);
//     const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
//     const [chatToModify, setChatToModify] = useState(null);
//     const [newTitle, setNewTitle] = useState("");
//     const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
//     const [currentChatId, setCurrentChatId] = useState(null);
//     const [fileName, setFileName] = useState(null);
//     const [fileContent, setFileContent] = useState(null);
//     const fileInputRef = useRef(null);
    
//     const auth = useContext(AuthContext);
//     const chatEndRef = useRef(null);
    
//     const fetchHistory = async () => {
//         if (!auth.token) return;
//         try {
//             const [recentRes, archivedRes] = await Promise.all([
//                 fetch('http://127.0.0.1:8000/history', { headers: { 'Authorization': `Bearer ${auth.token}` } }),
//                 fetch('http://127.0.0.1:8000/history/archived', { headers: { 'Authorization': `Bearer ${auth.token}` } })
//             ]);

//             if (recentRes.ok) {
//                 const recentData = await recentRes.json();
//                 setRecentHistory(recentData.map(chat => ({...chat, messages: JSON.parse(chat.conversation)})));
//             }
//              if (archivedRes.ok) {
//                 const archivedData = await archivedRes.json();
//                 setArchivedHistory(archivedData.map(chat => ({...chat, messages: JSON.parse(chat.conversation)})));
//             }
//         } catch (error) {
//             console.error("Failed to fetch history:", error);
//         }
//     };
    
//      const handleFileChange = (event) => {
//         const file = event.target.files[0];
//         if (!file) return;

//         setFileName(file.name);
//         const reader = new FileReader();
//         reader.onload = (e) => {
//             const text = e.target.result;
//             if (file.name.endsWith('.json')) {
//                 setFileContent(JSON.parse(text));
//             } else if (file.name.endsWith('.csv')) {
//                 const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
//                 if (lines.length < 2) { 
//                     alert("CSV must have a header and at least one data row.");
//                     return;
//                 }
//                 const headers = lines[0].split(',').map(h => h.trim());
//                 const json = lines.slice(1).map(line => {
//                     const values = line.split(',').map(v => v.trim());
//                     return headers.reduce((obj, header, index) => {
//                         obj[header] = values[index];
//                         return obj;
//                     }, {});
//                 });
//                 setFileContent(json);
//             }
//         };
//         reader.readAsText(file);
//     };

//     useEffect(() => {
//         if(auth?.token) fetchHistory();
//     }, [auth?.token]);

//     useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
//     const handleNewGeneration = () => {
//         setMessages([]);
//         setCurrentChatId(null);
//     };
    
//     const handleAiSubmit = async (promptToSend, existingMessages = []) => {
//         if (!promptToSend.trim()) return;

//         const finalPrompt = fileContent 
//             ? `Using the following data as context:\n\n${JSON.stringify(fileContent, null, 2)}\n\nPlease apply this instruction: ${promptToSend}`
//             : promptToSend;
            
//         const currentMessages = existingMessages.length > 0 ? existingMessages : [...messages, { role: 'user', content: promptToSend }];
//         if (existingMessages.length === 0) {
//             setMessages(currentMessages);
//             setPromptInput('');
//         }
//         setIsAiLoading(true);
//         setFileName(null);
//         setFileContent(null);

//         try {
//             const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
//                 body: JSON.stringify({
//                     prompt: finalPrompt,
//                     is_temporary: false 
//                 }),
//             });

//             if (!response.ok) {
//                 const errorData = await response.json();
//                 throw new Error(errorData.detail || `API call failed with status: ${response.status}`);
//             }

//             const data = await response.json();
//             const jsonResponse = data.response;
//             const finalMessages = [...currentMessages, { role: 'assistant', content: jsonResponse }];
//             setMessages(finalMessages);
//             await fetchHistory();


//         } catch (err) {
//             setMessages([...currentMessages, { role: 'assistant', content: { error: err.message } }]);
//         } finally {
//             setIsAiLoading(false);
//         }
//     };

//     const handleFormSubmit = (e) => { e.preventDefault(); handleAiSubmit(promptInput); };
//     const getInitials = (email) => { if (!email) return '??'; return email.substring(0, 2).toUpperCase(); };
//     const handleEditClick = (index, content) => { setEditingMessage({ index, content }); setEditedContent(content); };
//     const handleCancelEdit = () => { setEditingMessage(null); };
//     const handleSaveEdit = (indexToSave) => {
//         const updatedMessages = messages.map((msg, index) => index === indexToSave ? { ...msg, content: editedContent } : msg);
//         const messagesForResubmit = updatedMessages.slice(0, indexToSave + 1);
//         setMessages(messagesForResubmit);
//         handleAiSubmit(editedContent, messagesForResubmit);
//         setEditingMessage(null);
//     };
    
//     const handleArchiveToggle = async (chatId) => {
//         try {
//             await fetch(`http://127.0.0.1:8000/history/${chatId}/archive`, {
//                 method: 'PUT',
//                 headers: { 'Authorization': `Bearer ${auth.token}` }
//             });
//             await fetchHistory();
//         } catch (error) {
//             console.error("Failed to archive/unarchive chat:", error);
//         }
//     };
    
//     const handleDelete = async () => {
//         if (!chatToModify) return;
        
//         try {
//              await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}`, {
//                 method: 'DELETE',
//                 headers: { 'Authorization': `Bearer ${auth.token}` }
//             });

//             if (currentChatId === chatToModify.id) {
//                 handleNewGeneration();
//             }
//             await fetchHistory();
//         } catch (error) {
//             console.error("Failed to delete chat:", error);
//         } finally {
//             setDeleteAlertOpen(false);
//             setChatToModify(null);
//         }
//     };

//     const handleCopyPrompt = (content) => { navigator.clipboard.writeText(content); };
//     const handleRename = async () => { 
//         if (!chatToModify || !newTitle.trim()) return;
//         try {
//             await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}/rename`, {
//                 method: 'PUT',
//                 headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
//                 body: JSON.stringify({ title: newTitle })
//             });
//             await fetchHistory();
//         } catch(error) {
//             console.error("Failed to rename chat:", error);
//         } finally {
//             setRenameModalOpen(false);
//             setNewTitle("");
//         }
//     };
    
//     if (!auth?.user) {
//         return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading user...</div>
//     };

//     const handleSelectChat = (chat) => {
//         setMessages(chat.messages);
//         setCurrentChatId(chat.id);
//     }

//     return (
//         <div className="flex h-screen bg-gray-900 text-white font-sans">
//             <aside className={`bg-black p-4 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
//                 {/* Top Section */}
//                 <div>
//                     <div className="flex items-center justify-between mb-6">
//                         {!isSidebarCollapsed && <h2 className="text-xl font-bold">Data Mocker AI</h2>}
//                         <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
//                             {isSidebarCollapsed ? <PanelRightOpenIcon /> : <PanelLeftCloseIcon />}
//                         </Button>
//                     </div>
                    
//                     <div className="flex flex-col gap-2 mb-4">
//                          <Button variant="ghost" className="justify-start gap-2" onClick={handleNewGeneration}>
//                             <Plus /> {!isSidebarCollapsed && "New Chat"}
//                         </Button>
//                     </div>
//                 </div>

//                 {/* Middle, Scrollable Section */}
//                 <nav className="flex-grow min-h-0 overflow-y-auto">
//                     { recentHistory.length > 0 && !isSidebarCollapsed && <p className="text-xs text-gray-400 px-2 mb-2">Recent</p>}
//                     {recentHistory.map((chat) => (
//                         <div key={chat.id} className="flex items-center group">
//                             <Button variant="ghost" onClick={() => handleSelectChat(chat)} className="flex-1 truncate justify-start text-left gap-2">
//                                 <MessageSquare/> {!isSidebarCollapsed && chat.title}
//                             </Button>
//                             <div className={`opacity-0 group-hover:opacity-100 flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
//                                 <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><Archive /></Button>
//                                 <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 /></Button>
//                             </div>
//                         </div>
//                     ))}
//                     {archivedHistory.length > 0 && (
//                         <div className="mt-4">
//                             {!isSidebarCollapsed && <p className="text-xs text-gray-400 px-2 mb-2">Archived</p>}
//                             {archivedHistory.map((chat) => (
//                                 <div key={chat.id} className="flex items-center group">
//                                     <Button variant="ghost" onClick={() => handleSelectChat(chat)} className="flex-1 truncate justify-start text-left gap-2">
//                                         <MessageSquare/> {!isSidebarCollapsed && chat.title}
//                                     </Button>
//                                     <div className={`opacity-0 group-hover:opacity-100 flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
//                                         <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><ArchiveRestore /></Button>
//                                         <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 /></Button>
//                                     </div>
//                                 </div>
//                             ))}
//                         </div>
//                     )}
//                 </nav>
                
//                 {/* Bottom Section */}
//                 <div>
//                     <div className="flex flex-col gap-2 py-2">
//                         <Button variant="ghost" className="justify-start gap-2" onClick={onOpenTempChat}>
//                             <TempChatIcon /> {!isSidebarCollapsed && "Temporary Chat"}
//                         </Button>
//                     </div>
//                     <div className={`flex items-center gap-3 border-t border-gray-700 pt-4 mt-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
//                         <Avatar><AvatarFallback>{auth.user ? getInitials(auth.user.email) : '...'}</AvatarFallback></Avatar>
//                         {!isSidebarCollapsed && (<div className="flex-1 overflow-hidden"><p className="text-sm font-medium truncate">{auth.user ? auth.user.email : 'Loading...'}</p></div>)}
//                         <Button variant="ghost" size="icon" onClick={auth.logout} className="text-muted-foreground"><LogOut /></Button>
//                     </div>
//                 </div>
//             </aside>
//             <main className="flex-1 flex flex-col p-6 max-h-screen">
//                 <div className="flex-1 overflow-y-auto pr-4">
//                     {messages.length === 0 ? (
//                         <div className="flex flex-col items-center justify-center h-full">
//                             <h1 className="text-4xl font-bold">Data Mocker AI</h1>
//                             <p className="text-gray-400 mt-2">How can I help you today?</p>
//                         </div>
//                     ) : (
//                         <div className="flex flex-col gap-4">
//                             {messages.map((msg, index) => (
//                                 <div key={index}>
//                                     {editingMessage?.index === index ? (
//                                         <div className="bg-gray-800 p-3 rounded-lg">
//                                             <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={3}/>
//                                             <div className="flex justify-end gap-2 mt-2">
//                                                 <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
//                                                 <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
//                                             </div>
//                                         </div>
//                                     ) : (
//                                         <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                                             <div className={`p-4 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
//                                                 {msg.role === 'assistant' ? (
//                                                     <div>
//                                                         {msg.content.error ? ( <p className="text-red-400">Error: {msg.content.error}</p> ) : (
//                                                             <>
//                                                                 <JsonTable jsonData={msg.content} />
//                                                                 <div className="flex gap-2 mt-4 border-t border-gray-700 pt-2">
//                                                                     <Button size="sm" variant="secondary" onClick={() => exportAsJSON(msg.content)}>Export JSON</Button>
//                                                                     <Button size="sm" variant="secondary" onClick={() => exportAsCSV(msg.content)}>Export CSV</Button>
//                                                                 </div>
//                                                             </>
//                                                         )}
//                                                     </div>
//                                                 ) : (<p className="whitespace-pre-wrap">{msg.content}</p>)}
//                                             </div>
//                                             {msg.role === 'user' && (
//                                                 <div className="flex flex-col">
//                                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyPrompt(msg.content)}><Copy /></Button>
//                                                     <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(index, msg.content)}><Edit /></Button>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     )}
//                                 </div>
//                             ))}
//                             <div ref={chatEndRef} />
//                         </div>
//                     )}
//                 </div>
//                 <div className="pt-4">
//                     {fileName && (
//                         <div className="flex items-center justify-between bg-gray-700 text-xs px-3 py-1 rounded-md mb-2">
//                             <span>{fileName}</span>
//                             <button onClick={() => { setFileName(null); setFileContent(null); }} className="text-gray-400 hover:text-white">&times;</button>
//                         </div>
//                     )}
//                     <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
//                          <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current.click()}>
//                             <Plus />
//                         </Button>
//                         <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv"/>
//                         <Input value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder="Describe the data you want or upload a file..." disabled={isAiLoading} className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"/>
//                         <Button type="submit" size="icon" disabled={isAiLoading}>{isAiLoading ? '...' : <Send />}</Button>
//                     </form>
//                 </div>
//             </main>
//             <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}> <DialogContent> <DialogHeader><DialogTitle>Rename Chat</DialogTitle></DialogHeader> <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /> <DialogFooter><Button onClick={handleRename}>Save</Button></DialogFooter> </DialogContent> </Dialog>
//             <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}> <AlertDialogContent> <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader> <AlertDialogDescription>This action cannot be undone. This will permanently delete this conversation.</AlertDialogDescription> <AlertDialogFooter> <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction> </AlertDialogFooter> </AlertDialogContent> </AlertDialog>
//         </div>
//     );
// };

// export default ChatPage;



// 4code 
import React, { useState, useRef, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

// --- Inline SVG Icons ---
const Send = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const Plus = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>;
const LogOut = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const Archive = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const Trash2 = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Edit = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 0 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const MessageSquare = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const ArchiveRestore = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="21 8 21 21 3 21 3 8"></polyline><rect x="1" y="3" width="22" height="5"></rect><line x1="10" y1="12" x2="14" y2="12"></line></svg>;
const PanelLeftCloseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m16 15-3-3 3-3"/></svg>;
const PanelRightOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M9 3v18"/><path d="m15 9 3 3-3 3"/></svg>;
const Copy = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>;
const TempChatIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path></svg>;
const CloseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>;
const ThumbsUpIcon = ({ filled }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15.5 10l-3-7-3 7h-1a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4.5a2.5 2.5 0 0 0-2.5-2.5z"/></svg>;
const ThumbsDownIcon = ({ filled }) => <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M8.5 14l3 7 3-7h1a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v4.5a2.5 2.5 0 0 0 2.5 2.5z"/></svg>;
const RefreshCwIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 21v-5h5"/></svg>;
const SpreadsheetIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>;


// --- UI Components ---
const Button = ({ children, variant = 'default', size = 'default', className = '', ...props }) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
    const variants = {
        default: 'bg-blue-600 text-white hover:bg-blue-700',
        ghost: 'hover:bg-gray-700 hover:text-white',
        secondary: 'bg-gray-600 text-white hover:bg-gray-500',
        link: 'text-blue-400 underline-offset-4 hover:underline',
    };
    const sizes = {
        default: 'h-10 py-2 px-4',
        sm: 'h-9 px-3 rounded-md',
        icon: 'h-10 w-10',
    };
    return <button className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>;
};
const Input = ({ className = '', ...props }) => <input className={`flex h-10 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
const Textarea = ({ className = '', ...props }) => <textarea className={`flex min-h-[80px] w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`} {...props} />;
const Dialog = ({ open, onOpenChange, children }) => open ? <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80" onClick={() => onOpenChange(false)}><div onClick={e => e.stopPropagation()}>{children}</div></div> : null;
const DialogContent = ({ children, className }) => <div className={`relative z-50 grid w-full max-w-lg gap-4 border bg-gray-900 border-gray-800 p-6 shadow-lg rounded-lg ${className}`}>{children}</div>;
const DialogHeader = ({ children }) => <div className="flex flex-col space-y-1.5 text-center sm:text-left">{children}</div>;
const DialogTitle = ({ children }) => <h2 className="text-lg font-semibold leading-none tracking-tight text-white">{children}</h2>;
const DialogFooter = ({ children }) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">{children}</div>;
const AlertDialog = Dialog;
const AlertDialogContent = DialogContent;
const AlertDialogHeader = DialogHeader;
const AlertDialogTitle = DialogTitle;
const AlertDialogDescription = ({ children }) => <p className="text-sm text-gray-400">{children}</p>;
const AlertDialogFooter = DialogFooter;
const AlertDialogCancel = (props) => <Button variant="ghost" {...props} />;
const AlertDialogAction = ({ className, ...props }) => <Button className={`bg-red-600 hover:bg-red-700 ${className}`} {...props} />;
const Avatar = ({ children }) => <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">{children}</div>;
const AvatarFallback = ({ children }) => <span className="flex h-full w-full items-center justify-center rounded-full bg-gray-700 text-white">{children}</span>;


// --- Helper Functions ---
const exportAsJSON = (jsonData) => { const dataStr = JSON.stringify(jsonData, null, 2); const blob = new Blob([dataStr], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'data.json'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };
const exportAsCSV = (jsonData) => { let dataArray = []; if (Array.isArray(jsonData)) dataArray = jsonData; else if (typeof jsonData === 'object' && jsonData !== null) { const dataKey = Object.keys(jsonData).find(key => Array.isArray(jsonData[key])); if (dataKey) dataArray = jsonData[dataKey]; else dataArray = [jsonData]; } if (dataArray.length === 0) { alert("Could not find a valid array of data to convert to CSV."); return; } const headers = Object.keys(dataArray[0] || {}); const csvRows = [headers.join(','), ...dataArray.map(row => headers.map(header => JSON.stringify(row[header], (_, value) => value === null ? '' : value)).join(','))]; const csvContent = csvRows.join('\n'); const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = 'data.csv'; document.body.appendChild(link); link.click(); document.body.removeChild(link); };

// --- JsonTable Component ---
const JsonTable = ({ jsonData }) => {
    let dataArray = [];
    if (Array.isArray(jsonData)) {
        dataArray = jsonData;
    } else if (typeof jsonData === 'object' && jsonData !== null) {
        const keyWithArray = Object.keys(jsonData).find(key => Array.isArray(jsonData[key]));
        if (keyWithArray) {
            dataArray = jsonData[keyWithArray];
        } else {
            dataArray = [jsonData];
        }
    }

    if (dataArray.length === 0 || typeof dataArray[0] !== 'object' || dataArray[0] === null) {
        return (
            <pre className="bg-black/20 p-4 rounded-md text-xs text-white overflow-auto">
                <code>{JSON.stringify(jsonData, null, 2)}</code>
            </pre>
        );
    }

    const headers = Object.keys(dataArray[0]);

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-sm text-left text-gray-300">
                <thead className="text-xs text-white uppercase bg-gray-700/50">
                    <tr>
                        {headers.map(header => <th key={header} scope="col" className="px-6 py-3">{header}</th>)}
                    </tr>
                </thead>
                <tbody>
                    {dataArray.map((row, index) => (
                        <tr key={index} className="bg-gray-800/50 border-b border-gray-700 last:border-b-0 hover:bg-gray-700/50">
                            {headers.map(header => (
                                <td key={`${index}-${header}`} className="px-6 py-4">
                                    {typeof row[header] === 'object' && row[header] !== null ? JSON.stringify(row[header]) : String(row[header])}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const ResponseActions = ({ content, onRegenerate }) => {
    const [feedback, setFeedback] = useState(null); // 'good', 'bad', or null

    const handleCopy = () => {
        navigator.clipboard.writeText(JSON.stringify(content, null, 2));
    };

    return (
        <div className="flex items-center gap-2 mt-2 text-gray-400">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopy}><Copy /></Button>
            <Button variant="ghost" size="icon" className={`h-8 w-8 ${feedback === 'good' ? 'text-blue-500' : ''}`} onClick={() => setFeedback('good')}><ThumbsUpIcon filled={feedback === 'good'} /></Button>
            <Button variant="ghost" size="icon" className={`h-8 w-8 ${feedback === 'bad' ? 'text-red-500' : ''}`} onClick={() => setFeedback('bad')}><ThumbsDownIcon filled={feedback === 'bad'} /></Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRegenerate}><RefreshCwIcon /></Button>
        </div>
    );
};

// --- New Temporary Chat Interface ---
const TemporaryChatInterface = ({ onClose }) => {
    const [messages, setMessages] = useState([{ role: 'assistant', content: 'This is a temporary chat. History will not be saved.' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editedContent, setEditedContent] = useState("");
    const [fileName, setFileName] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const fileInputRef = useRef(null);
    const chatEndRef = useRef(null);
    const { token } = useContext(AuthContext);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            if (file.name.endsWith('.json')) {
                setFileContent(JSON.parse(text));
            } else if (file.name.endsWith('.csv')) {
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim());
                const json = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    return headers.reduce((obj, header, index) => {
                        obj[header] = values[index];
                        return obj;
                    }, {});
                });
                setFileContent(json);
            }
        };
        reader.readAsText(file);
    };

    const handleSubmit = async (promptToSend, existingMessages = null) => {
        if (!promptToSend.trim() && !fileContent) return;
        
        const finalPrompt = fileContent 
            ? `Using the following data as context:\n\n${JSON.stringify(fileContent, null, 2)}\n\nPlease apply this instruction: ${promptToSend}`
            : promptToSend;

        const userMessage = { 
            role: 'user', 
            content: promptToSend, 
            attachment: fileName ? { name: fileName, type: 'Spreadsheet' } : null 
        };
        
        const currentMessages = existingMessages ? existingMessages : [...messages, userMessage];

        if (!existingMessages) {
            setMessages(currentMessages);
            setInput('');
        }
        setIsLoading(true);
        setFileName(null);
        setFileContent(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    is_temporary: true 
                }),
            });

            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.detail || `API call failed with status: ${response.status}`);
            }
            const data = await response.json();
            setMessages([...currentMessages, { role: 'assistant', content: data.response }]);

        } catch (error) {
            console.error("Error calling local backend:", error);
            setMessages([...currentMessages, { role: 'assistant', content: { error: error.message } }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFormSubmit = (e) => {
        e.preventDefault();
        handleSubmit(input);
    };

    const handleCopyPrompt = (content) => {
        navigator.clipboard.writeText(content);
    };

    const handleEditClick = (index, content) => {
        setEditingMessage({ index, content });
        setEditedContent(content);
    };
    
    const handleCancelEdit = () => {
        setEditingMessage(null);
    };

    const handleSaveEdit = (indexToSave) => {
        const updatedMessages = messages.map((msg, index) =>
            index === indexToSave ? { ...msg, content: editedContent } : msg
        );
        const messagesToResubmit = updatedMessages.slice(0, indexToSave + 1);
        setMessages(messagesToResubmit);
        handleSubmit(editedContent, messagesToResubmit);
        setEditingMessage(null);
    };
    
    const handleRegenerate = (index) => {
        const lastUserMessage = messages[index-1];
        if(lastUserMessage && lastUserMessage.role === 'user') {
            const messagesToResubmit = messages.slice(0, index);
            setMessages(messagesToResubmit);
            handleSubmit(lastUserMessage.content, messagesToResubmit);
        }
    };

    const renderContent = (content, index) => {
        if (typeof content === 'object' && content !== null) {
            if (content.error) {
                return <p className="text-red-400 whitespace-pre-wrap">Error: {content.error}</p>;
            }
            return (
                 <>
                    <JsonTable jsonData={content} />
                    <div className="flex gap-2 mt-4 border-t border-gray-700 pt-2">
                        <Button size="sm" variant="secondary" onClick={() => exportAsJSON(content)}>Export JSON</Button>
                        <Button size="sm" variant="secondary" onClick={() => exportAsCSV(content)}>Export CSV</Button>
                    </div>
                    <ResponseActions content={content} onRegenerate={() => handleRegenerate(index)} />
                </>
            );
        }
        return <p className="whitespace-pre-wrap">{String(content)}</p>;
    };

    return (
        <div className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col animate-slide-in">
            <style>{`
                @keyframes slide-in {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}</style>
            <header className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
                <h2 className="text-xl font-bold">Temporary Chat</h2>
                <Button variant="ghost" size="icon" onClick={onClose}><CloseIcon /></Button>
            </header>
            <main className="flex-1 overflow-y-auto p-6">
                <div className="flex flex-col gap-4">
                    {messages.map((msg, index) => (
                        <div key={index}>
                            {editingMessage?.index === index ? (
                                <div className="bg-gray-800 p-3 rounded-lg">
                                    <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={3} />
                                    <div className="flex justify-end gap-2 mt-2">
                                        <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                                        <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                     {msg.attachment && (
                                         <div className="p-4 rounded-lg max-w-xl bg-blue-600 text-white">
                                            <div className="bg-gray-700/50 p-3 rounded-md mb-2 flex items-start gap-3">
                                                <div className="text-green-400"><SpreadsheetIcon/></div>
                                                <div>
                                                    <p className="font-bold text-sm text-white">{msg.attachment.name}</p>
                                                    <p className="text-xs text-gray-300">{msg.attachment.type}</p>
                                                </div>
                                            </div>
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                         </div>
                                     )}
                                    {!msg.attachment && (
                                        <div className={`p-4 rounded-lg max-w-xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-700'}`}>
                                            {renderContent(msg.content, index)}
                                        </div>
                                    )}
                                    {msg.role === 'user' && (
                                        <div className="flex flex-col">
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyPrompt(msg.content)}><Copy /></Button>
                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(index, msg.content)}><Edit /></Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                    <div ref={chatEndRef} />
                </div>
            </main>
            <footer className="p-4 bg-gray-900">
                <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
                    <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current.click()}>
                        <Plus />
                    </Button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv"/>
                    <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={fileName ? "Continue prompt with file..." : "Type a message..."} disabled={isLoading} className="bg-transparent border-none focus-visible:ring-0" />
                    <Button type="submit" size="icon" disabled={isLoading}>{isLoading ? '...' : <Send />}</Button>
                </form>
            </footer>
        </div>
    );
};


// --- The Main App Component ---
const ChatPage = () => {
    const [view, setView] = useState('mocker');
    
    return (
        <div className="font-sans">
            <div style={{ display: view === 'mocker' ? 'block' : 'none' }}>
                <ChatPageComponent onOpenTempChat={() => setView('tempChat')} />
            </div>
            
            {view === 'tempChat' && <TemporaryChatInterface onClose={() => setView('mocker')} />}
        </div>
    );
};

const ChatPageComponent = ({ onOpenTempChat }) => {
    const [messages, setMessages] = useState([]);
    const [promptInput, setPromptInput] = useState('');
    const [isAiLoading, setIsAiLoading] = useState(false);
    const [recentHistory, setRecentHistory] = useState([]);
    const [archivedHistory, setArchivedHistory] = useState([]);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editedContent, setEditedContent] = useState("");
    const [renameModalOpen, setRenameModalOpen] = useState(false);
    const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
    const [chatToModify, setChatToModify] = useState(null);
    const [newTitle, setNewTitle] = useState("");
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [currentChatId, setCurrentChatId] = useState(null);
    const [fileName, setFileName] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const fileInputRef = useRef(null);
    
    const auth = useContext(AuthContext);
    const chatEndRef = useRef(null);
    
    const fetchHistory = async () => {
        if (!auth.token) return;
        try {
            const [recentRes, archivedRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/history', { headers: { 'Authorization': `Bearer ${auth.token}` } }),
                fetch('http://127.0.0.1:8000/history/archived', { headers: { 'Authorization': `Bearer ${auth.token}` } })
            ]);

            if (recentRes.ok) {
                const recentData = await recentRes.json();
                setRecentHistory(recentData.map(chat => ({...chat, messages: JSON.parse(chat.conversation)})));
            }
             if (archivedRes.ok) {
                const archivedData = await archivedRes.json();
                setArchivedHistory(archivedData.map(chat => ({...chat, messages: JSON.parse(chat.conversation)})));
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };
    
     const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            if (file.name.endsWith('.json')) {
                setFileContent(JSON.parse(text));
            } else if (file.name.endsWith('.csv')) {
                const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
                if (lines.length < 2) { 
                    alert("CSV must have a header and at least one data row.");
                    return;
                }
                const headers = lines[0].split(',').map(h => h.trim());
                const json = lines.slice(1).map(line => {
                    const values = line.split(',').map(v => v.trim());
                    return headers.reduce((obj, header, index) => {
                        obj[header] = values[index];
                        return obj;
                    }, {});
                });
                setFileContent(json);
            }
        };
        reader.readAsText(file);
    };

    useEffect(() => {
        if(auth?.token) fetchHistory();
    }, [auth?.token]);

    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
    
    const handleNewGeneration = () => {
        setMessages([]);
        setCurrentChatId(null);
    };
    
    const handleAiSubmit = async (promptToSend, existingMessages = []) => {
        if (!promptToSend.trim() && !fileContent) return;

        const finalPrompt = fileContent 
            ? `Using the following data as context:\n\n${JSON.stringify(fileContent, null, 2)}\n\nPlease apply this instruction: ${promptToSend}`
            : promptToSend;
            
        const userMessage = { 
            role: 'user', 
            content: promptToSend, 
            attachment: fileName ? { name: fileName, type: 'Spreadsheet' } : null 
        };

        const currentMessages = existingMessages.length > 0 ? existingMessages : [...messages, userMessage];
        
        if (existingMessages.length === 0) {
            setMessages(currentMessages);
            setPromptInput('');
        }
        setIsAiLoading(true);
        setFileName(null);
        setFileContent(null);

        try {
            const response = await fetch('http://127.0.0.1:8000/generate-with-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
                body: JSON.stringify({
                    prompt: finalPrompt,
                    is_temporary: false 
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || `API call failed with status: ${response.status}`);
            }

            const data = await response.json();
            const jsonResponse = data.response;
            const finalMessages = [...currentMessages, { role: 'assistant', content: jsonResponse }];
            setMessages(finalMessages);
            await fetchHistory();


        } catch (err) {
            setMessages([...currentMessages, { role: 'assistant', content: { error: err.message } }]);
        } finally {
            setIsAiLoading(false);
        }
    };
    
    const handleRegenerate = (index) => {
        const lastUserMessage = messages[index-1];
        if(lastUserMessage && lastUserMessage.role === 'user') {
            const messagesToResubmit = messages.slice(0, index);
            setMessages(messagesToResubmit);
            handleAiSubmit(lastUserMessage.content, messagesToResubmit);
        }
    };

    const handleFormSubmit = (e) => { e.preventDefault(); handleAiSubmit(promptInput); };
    const getInitials = (email) => { if (!email) return '??'; return email.substring(0, 2).toUpperCase(); };
    const handleEditClick = (index, content) => { setEditingMessage({ index, content }); setEditedContent(content); };
    const handleCancelEdit = () => { setEditingMessage(null); };
    const handleSaveEdit = (indexToSave) => {
        const updatedMessages = messages.map((msg, index) => index === indexToSave ? { ...msg, content: editedContent } : msg);
        const messagesForResubmit = updatedMessages.slice(0, indexToSave + 1);
        setMessages(messagesForResubmit);
        handleAiSubmit(editedContent, messagesForResubmit);
        setEditingMessage(null);
    };
    
    const handleArchiveToggle = async (chatId) => {
        try {
            await fetch(`http://127.0.0.1:8000/history/${chatId}/archive`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });
            await fetchHistory();
        } catch (error) {
            console.error("Failed to archive/unarchive chat:", error);
        }
    };
    
    const handleDelete = async () => {
        if (!chatToModify) return;
        
        try {
             await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${auth.token}` }
            });

            if (currentChatId === chatToModify.id) {
                handleNewGeneration();
            }
            await fetchHistory();
        } catch (error) {
            console.error("Failed to delete chat:", error);
        } finally {
            setDeleteAlertOpen(false);
            setChatToModify(null);
        }
    };

    const handleCopyPrompt = (content) => { navigator.clipboard.writeText(content); };
    const handleRename = async () => { 
        if (!chatToModify || !newTitle.trim()) return;
        try {
            await fetch(`http://127.0.0.1:8000/history/${chatToModify.id}/rename`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${auth.token}` },
                body: JSON.stringify({ title: newTitle })
            });
            await fetchHistory();
        } catch(error) {
            console.error("Failed to rename chat:", error);
        } finally {
            setRenameModalOpen(false);
            setNewTitle("");
        }
    };
    
    if (!auth?.user) return null;

    const handleSelectChat = (chat) => {
        setMessages(chat.messages);
        setCurrentChatId(chat.id);
    }

    return (
        <div className="flex h-screen bg-gray-900 text-white font-sans">
            <aside className={`bg-black p-4 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
                {/* Top Section */}
                <div>
                    <div className="flex items-center justify-between mb-6">
                        {!isSidebarCollapsed && <h2 className="text-xl font-bold">Data Mocker AI</h2>}
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}>
                            {isSidebarCollapsed ? <PanelRightOpenIcon /> : <PanelLeftCloseIcon />}
                        </Button>
                    </div>
                    
                    <div className="flex flex-col gap-2 mb-4">
                         <Button variant="ghost" className="justify-start gap-2" onClick={handleNewGeneration}>
                            <Plus /> {!isSidebarCollapsed && "New Chat"}
                        </Button>
                    </div>
                </div>

                {/* Middle, Scrollable Section */}
                <nav className="flex-grow min-h-0 overflow-y-auto">
                    { recentHistory.length > 0 && !isSidebarCollapsed && <p className="text-xs text-gray-400 px-2 mb-2">Recent</p>}
                    {recentHistory.map((chat) => (
                        <div key={chat.id} className="flex items-center group">
                            <Button variant="ghost" onClick={() => handleSelectChat(chat)} className="flex-1 truncate justify-start text-left gap-2">
                                <MessageSquare/> {!isSidebarCollapsed && chat.title}
                            </Button>
                            <div className={`opacity-0 group-hover:opacity-100 flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><Archive /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 /></Button>
                            </div>
                        </div>
                    ))}
                    {archivedHistory.length > 0 && (
                        <div className="mt-4">
                            {!isSidebarCollapsed && <p className="text-xs text-gray-400 px-2 mb-2">Archived</p>}
                            {archivedHistory.map((chat) => (
                                <div key={chat.id} className="flex items-center group">
                                    <Button variant="ghost" onClick={() => handleSelectChat(chat)} className="flex-1 truncate justify-start text-left gap-2">
                                        <MessageSquare/> {!isSidebarCollapsed && chat.title}
                                    </Button>
                                    <div className={`opacity-0 group-hover:opacity-100 flex items-center ${isSidebarCollapsed ? 'hidden' : ''}`}>
                                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleArchiveToggle(chat.id)}><ArchiveRestore /></Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => { setChatToModify(chat); setDeleteAlertOpen(true); }}><Trash2 /></Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </nav>
                
                {/* Bottom Section */}
                <div>
                    <div className="flex flex-col gap-2 py-2">
                        <Button variant="ghost" className="justify-start gap-2" onClick={onOpenTempChat}>
                            <TempChatIcon /> {!isSidebarCollapsed && "Temporary Chat"}
                        </Button>
                    </div>
                    <div className={`flex items-center gap-3 border-t border-gray-700 pt-4 mt-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                        <Avatar><AvatarFallback>{auth.user ? getInitials(auth.user.email) : '...'}</AvatarFallback></Avatar>
                        {!isSidebarCollapsed && (<div className="flex-1 overflow-hidden"><p className="text-sm font-medium truncate">{auth.user ? auth.user.email : 'Loading...'}</p></div>)}
                        <Button variant="ghost" size="icon" onClick={auth.logout} className="text-muted-foreground"><LogOut /></Button>
                    </div>
                </div>
            </aside>
            <main className="flex-1 flex flex-col p-6 max-h-screen">
                <div className="flex-1 overflow-y-auto pr-4">
                    {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full">
                            <h1 className="text-4xl font-bold">Data Mocker AI</h1>
                            <p className="text-gray-400 mt-2">How can I help you today?</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {messages.map((msg, index) => (
                                <div key={index}>
                                    {editingMessage?.index === index ? (
                                        <div className="bg-gray-800 p-3 rounded-lg">
                                            <Textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={3}/>
                                            <div className="flex justify-end gap-2 mt-2">
                                                <Button variant="ghost" onClick={handleCancelEdit}>Cancel</Button>
                                                <Button onClick={() => handleSaveEdit(index)}>Save & Submit</Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-4 rounded-lg max-w-2xl ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>
                                                 {msg.attachment && (
                                                    <div className="bg-gray-700/50 p-3 rounded-md mb-2 flex items-start gap-3">
                                                         <div className="text-green-400"><SpreadsheetIcon/></div>
                                                         <div>
                                                             <p className="font-bold text-sm text-white">{msg.attachment.name}</p>
                                                             <p className="text-xs text-gray-300">{msg.attachment.type}</p>
                                                         </div>
                                                     </div>
                                                 )}
                                                {msg.role === 'assistant' ? (
                                                    <div>
                                                        {msg.content.error ? ( <p className="text-red-400">Error: {msg.content.error}</p> ) : (
                                                            <>
                                                                <JsonTable jsonData={msg.content} />
                                                                <div className="flex gap-2 mt-4 border-t border-gray-700 pt-2">
                                                                    <Button size="sm" variant="secondary" onClick={() => exportAsJSON(msg.content)}>Export JSON</Button>
                                                                    <Button size="sm" variant="secondary" onClick={() => exportAsCSV(msg.content)}>Export CSV</Button>
                                                                </div>
                                                                <ResponseActions content={msg.content} onRegenerate={() => handleRegenerate(index)} />
                                                            </>
                                                        )}
                                                    </div>
                                                ) : (<p className="whitespace-pre-wrap">{msg.content}</p>)}
                                            </div>
                                            {msg.role === 'user' && (
                                                <div className="flex flex-col">
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopyPrompt(msg.content)}><Copy /></Button>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditClick(index, msg.content)}><Edit /></Button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    )}
                </div>
                <div className="pt-4">
                    {fileName && (
                         <div className="bg-gray-700/50 p-3 rounded-md mb-2 flex items-start gap-3">
                             <div className="text-green-400"><SpreadsheetIcon/></div>
                             <div>
                                 <p className="font-bold text-sm text-white">{fileName}</p>
                                  <p className="text-xs text-gray-300">Spreadsheet</p>
                             </div>
                             <button onClick={() => { setFileName(null); setFileContent(null); }} className="text-gray-400 hover:text-white ml-auto">&times;</button>
                         </div>
                    )}
                    <form onSubmit={handleFormSubmit} className="flex gap-2 items-center bg-gray-800 p-2 rounded-lg">
                         <Button type="button" variant="ghost" size="icon" onClick={() => fileInputRef.current.click()}>
                            <Plus />
                        </Button>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json,.csv"/>
                        <Input value={promptInput} onChange={(e) => setPromptInput(e.target.value)} placeholder={fileName ? "Generate more data..." : "Describe the data you want or upload a file..."} disabled={isAiLoading} className="bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"/>
                        <Button type="submit" size="icon" disabled={isAiLoading}>{isAiLoading ? '...' : <Send />}</Button>
                    </form>
                </div>
            </main>
            <Dialog open={renameModalOpen} onOpenChange={setRenameModalOpen}> <DialogContent> <DialogHeader><DialogTitle>Rename Chat</DialogTitle></DialogHeader> <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} /> <DialogFooter><Button onClick={handleRename}>Save</Button></DialogFooter> </DialogContent> </Dialog>
            <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}> <AlertDialogContent> <AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle></AlertDialogHeader> <AlertDialogDescription>This action cannot be undone. This will permanently delete this conversation.</AlertDialogDescription> <AlertDialogFooter> <AlertDialogCancel onClick={() => setDeleteAlertOpen(false)}>Cancel</AlertDialogCancel> <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction> </AlertDialogFooter> </AlertDialogContent> </AlertDialog>
        </div>
    );
};

export default ChatPage;

