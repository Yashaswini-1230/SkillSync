import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const SOCKET_URL = process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL.replace('/api', '') : 'http://localhost:5000';

const InterviewPrep = () => {
    const [socket, setSocket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionActive, setSessionActive] = useState(false);
    
    const [resumeContext, setResumeContext] = useState("React, Node.js, MongoDB developer with 3 years experience.");
    const [targetRole, setTargetRole] = useState("Full Stack Developer");
    
    const messagesEndRef = useRef(null);

<<<<<<< Updated upstream:frontend/src/pages/InterviewPrep.jsx
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
=======
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
>>>>>>> Stashed changes:frontend/src/pages/InterviewPrep.js

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const startSession = (e) => {
        e.preventDefault();
        
        const newSocket = io(`${SOCKET_URL}/interview`);
        
        newSocket.on('connect', () => {
            console.log("Connected to interview socket");
            newSocket.emit('join_session', { resumeContext, targetRole });
        });

        newSocket.on('session_started', () => {
            setSessionActive(true);
            setMessages([{
                id: Date.now(),
                role: 'system',
                content: `Session started for role: ${targetRole}. I am your AI interviewer. Let's begin!`
            }]);
            
            // Request first question
            setIsTyping(true);
            newSocket.emit('request_question');
        });

        newSocket.on('receive_question', (data) => {
            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now(), role: 'ai', content: data.question }]);
        });

        newSocket.on('evaluation_result', (data) => {
            setMessages(prev => [...prev, { 
                id: Date.now(), 
                role: 'system', 
                content: `Feedback: ${data.feedback} (Score: ${data.score}/10)`
            }]);
            
            // Request next question automatically after evaluating
            setIsTyping(true);
            newSocket.emit('request_question');
        });

        newSocket.on('error', (data) => {
            setIsTyping(false);
            toast.error(data.message || "An error occurred");
        });

        setSocket(newSocket);

        return () => newSocket.disconnect();
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: input }]);
        socket.emit('submit_answer', { answer: input });
        setInput('');
        setIsTyping(true);
    };

    if (!sessionActive) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8"
                >
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bot size={32} />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">AI Mock Interview</h1>
                        <p className="text-gray-500 mt-2">Practice your interview skills with contextual, dynamic AI.</p>
                    </div>

                    <form onSubmit={startSession} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Role</label>
                            <input 
                                type="text"
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resume Context Summary (Auto-extracted in prod)</label>
                            <textarea 
                                value={resumeContext}
                                onChange={(e) => setResumeContext(e.target.value)}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition h-24"
                                required
                            />
                        </div>
                        <button 
                            type="submit"
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition shadow-lg shadow-blue-200"
                        >
                            Start Interview
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col max-w-4xl mx-auto p-4 md:p-8">
            <div className="bg-white rounded-t-2xl shadow-sm border-b p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Bot size={20} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900">AI Interviewer</h2>
                        <p className="text-xs text-gray-500">Role: {targetRole}</p>
                    </div>
                </div>
                <button 
                    onClick={() => { socket?.disconnect(); setSessionActive(false); }}
                    className="text-sm text-red-500 hover:text-red-600 font-medium px-3 py-1 bg-red-50 rounded-lg"
                >
                    End Session
                </button>
            </div>

            <div className="flex-1 bg-white shadow-sm overflow-y-auto p-4 space-y-6 min-h-[500px]">
                <AnimatePresence>
                    {messages.map((msg) => (
                        <motion.div 
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white ml-2' : 
                                    msg.role === 'system' ? 'bg-orange-100 text-orange-600 mr-2' : 'bg-gray-200 text-gray-600 mr-2'
                                }`}>
                                    {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                                </div>
                                
                                <div className={`px-4 py-3 rounded-2xl ${
                                    msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 
                                    msg.role === 'system' ? 'bg-orange-50 text-orange-800 border border-orange-100 rounded-bl-none text-sm' :
                                    'bg-gray-100 text-gray-800 rounded-bl-none'
                                }`}>
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {isTyping && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2 text-gray-500"
                    >
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            <Bot size={16} />
                        </div>
                        <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-none flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </motion.div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white rounded-b-2xl shadow-sm border-t p-4">
                <form onSubmit={sendMessage} className="relative">
                    <input 
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your answer here..."
                        disabled={isTyping}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition disabled:opacity-50"
                    />
                    <button 
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default InterviewPrep;
