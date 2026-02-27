import React, { useState, useEffect, useRef } from 'react';
import { FiMessageCircle, FiX, FiSend, FiMinimize2, FiMaximize2 } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text:
        "Hi! I'm your SkillSync assistant. I can guide you through Upload → Analyze → Builder → Download, help you find Jobs & Internships, and prepare for interviews. For example, you can ask:\n\n• \"How do I analyze my resume?\"\n• \"Where can I see my ATS score?\"\n• \"How do Jobs & Internships work?\"\n• \"How do I use the Resume Builder?\"",
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [userResumes, setUserResumes] = useState([]);
  const messagesEndRef = useRef(null);

  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Comprehensive responses for SkillSync features
  const skillSyncResponses = {
    dashboard: [
      "Welcome to your SkillSync Dashboard! Here you can see your resume analytics, ATS scores, and recent activity. Upload a resume to get started with analysis.",
      "Your Dashboard shows key metrics: total resumes uploaded, average ATS score, and recent analyses. Each analysis helps you understand how well your resume matches job requirements.",
      "The Dashboard is your command center. View your resume performance, access recent reports, and track your job search progress all in one place."
    ],
    upload: [
      "To upload a resume, click the Upload button in the sidebar. SkillSync accepts PDF and DOCX files up to 10MB. Your resume will be automatically parsed for skills and experience.",
      "Resume uploads are secure and private. Once uploaded, your resume can be analyzed against job descriptions to get ATS compatibility scores and improvement suggestions.",
      "Upload your resume to unlock powerful features: ATS scoring, skill gap analysis, and personalized interview preparation based on your actual experience."
    ],
    analyze: [
      "Resume Analysis is SkillSync's core feature! Select a resume, paste a job description, and get a detailed ATS score with specific recommendations.",
      "Our AI analyzes semantic similarity between your resume and job requirements, identifies matching and missing skills, and provides actionable suggestions to improve your ATS score.",
      "Analysis results include: ATS compatibility score (0-88%), skill matching analysis, missing sections detection, grammar checks, and personalized improvement tips."
    ],
    builder: [
      "The Resume Builder lets you create professional resumes from scratch. Choose from Modern, Classic, or Creative templates, then fill in your information with our guided interface.",
      "Start by selecting a template that matches your industry. The builder includes sections for personal info, summary, skills, experience, education, and projects with live preview.",
      "Built resumes are automatically saved and can be analyzed just like uploaded resumes. The builder ensures ATS-friendly formatting and professional presentation."
    ],
    savedResumes: [
      "Your Saved Resumes page shows all resumes you've created or uploaded. Each resume shows its template, creation date, and last modified time.",
      "From Saved Resumes, you can edit existing resumes, download PDFs, or delete old versions. Each resume maintains its unique name and template choice.",
      "Saved resumes can be used for analysis against job descriptions. The system remembers your preferences and provides consistent formatting."
    ],
    interview: [
      "Interview Prep generates 5-7 personalized questions based on your resume content. Questions are tailored to your specific skills, experience, and projects mentioned.",
      "Questions include technical skills assessment, behavioral scenarios, and experience-based problems. Each question is designed to help you prepare for real interviews.",
      "Practice answering these questions out loud. The AI analyzes your resume to create relevant questions that hiring managers in your field would ask."
    ],
    ats: [
      "ATS (Applicant Tracking System) scores measure how well your resume matches job requirements. SkillSync provides realistic scores (never 100%) based on multiple factors.",
      "Our ATS analysis considers: keyword matching, skill relevance, experience alignment, section completeness, and formatting quality. Scores range from 15-88%.",
      "Focus on scores above 70% for better chances. Use the detailed recommendations to improve specific areas of your resume."
    ],
    templates: [
      "SkillSync offers three professional templates: Modern (tech-focused), Classic (traditional), and Creative (design-oriented). Each is ATS-optimized and mobile-friendly.",
      "Choose templates based on your industry and personal style. Modern works well for tech roles, Classic for conservative industries, Creative for marketing/design positions.",
      "All templates include live preview so you can see exactly how your resume will look before finalizing."
    ]
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchUserResumes();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserResumes = async () => {
    try {
      const response = await axios.get(`${API_URL}/resumes`);
      setUserResumes(response.data);
    } catch (error) {
      console.error('Error fetching resumes:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse = generateBotResponse(inputMessage.toLowerCase());
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000); // Random delay between 1-2 seconds
  };

  const generateBotResponse = (userInput) => {
    const input = userInput.toLowerCase();

    // Greeting responses
    if (input.includes('hello') || input.includes('hi') || input.includes('hey') || input.includes('start')) {
      const greetings = [
        `Hello ${user?.name || 'there'}! Welcome to SkillSync! I'm here to help you optimize your resume and prepare for interviews. What would you like to do first?`,
        `Hi! I'm your SkillSync assistant. Ready to analyze your resume or build a new one? Let me know how I can help!`,
        `Greetings! SkillSync helps you get better job matches through intelligent resume analysis. What can I assist you with today?`
      ];
      return {
        id: messages.length + 2,
        text: greetings[Math.floor(Math.random() * greetings.length)],
        isBot: true,
        timestamp: new Date()
      };
    }

    // Dashboard/Home questions
    if (input.includes('dashboard') || input.includes('home') || input.includes('main')) {
      const response = skillSyncResponses.dashboard[Math.floor(Math.random() * skillSyncResponses.dashboard.length)];
      return {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    }

    // Upload questions
    if (input.includes('upload') || input.includes('add resume')) {
      const response = skillSyncResponses.upload[Math.floor(Math.random() * skillSyncResponses.upload.length)];
      return {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    }

    // Analysis questions
    if (input.includes('analyze') || input.includes('analysis') || input.includes('ats') || input.includes('score')) {
      if (input.includes('ats') || input.includes('score')) {
        const response = skillSyncResponses.ats[Math.floor(Math.random() * skillSyncResponses.ats.length)];
        return {
          id: messages.length + 2,
          text: response,
          isBot: true,
          timestamp: new Date()
        };
      }
      const response = skillSyncResponses.analyze[Math.floor(Math.random() * skillSyncResponses.analyze.length)];
      return {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    }

    // Builder/Template questions
    if (input.includes('build') || input.includes('create') || input.includes('template') || input.includes('design')) {
      if (input.includes('template')) {
        const response = skillSyncResponses.templates[Math.floor(Math.random() * skillSyncResponses.templates.length)];
        return {
          id: messages.length + 2,
          text: response,
          isBot: true,
          timestamp: new Date()
        };
      }
      const response = skillSyncResponses.builder[Math.floor(Math.random() * skillSyncResponses.builder.length)];
      return {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    }

    // Jobs & internships questions
    if (input.includes('job') || input.includes('jobs') || input.includes('intern') || input.includes('internship')) {
      return {
        id: messages.length + 2,
        text:
          "To explore Jobs & Internships in SkillSync, open the \"Jobs & Internships\" page from the sidebar. There you can select a Job Role (e.g., Software Engineer, Data Analyst), choose a Location (e.g., Hyderabad, Remote), and filter by employment type. The platform uses the JSearch API to show live roles with Apply links.\n\nTip: Start by picking a role that matches your resume and a location like your city or Remote.",
        isBot: true,
        timestamp: new Date()
      };
    }

    // Interview questions
    if (input.includes('interview') || input.includes('practice') || input.includes('prepare')) {
      const response = skillSyncResponses.interview[Math.floor(Math.random() * skillSyncResponses.interview.length)];
      return {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    }

    // Saved resumes questions
    if (input.includes('saved') || input.includes('my resumes') || input.includes('manage')) {
      const response = skillSyncResponses.savedResumes[Math.floor(Math.random() * skillSyncResponses.savedResumes.length)];
      return {
        id: messages.length + 2,
        text: response,
        isBot: true,
        timestamp: new Date()
      };
    }

    // Resume count questions
    if ((input.includes('resume') || input.includes('cv')) && (input.includes('how many') || input.includes('count') || input.includes('total'))) {
      return {
        id: messages.length + 2,
        text: `You have ${userResumes.length} resume${userResumes.length !== 1 ? 's' : ''} in your account. ${userResumes.length > 0 ? 'You can view and manage them in the Saved Resumes section.' : 'Upload your first resume to get started with analysis!'}`,
        isBot: true,
        timestamp: new Date()
      };
    }

    // General resume questions
    if (input.includes('resume') || input.includes('cv')) {
      return {
        id: messages.length + 2,
        text: "SkillSync handles both uploaded resumes (PDF/DOCX) and built resumes. Your resumes are securely stored and used for ATS analysis, skill gap detection, and personalized interview preparation. Each resume is intelligently parsed for maximum accuracy.",
        isBot: true,
        timestamp: new Date()
      };
    }

    // Help and features questions
    if (input.includes('help') || input.includes('what can you do') || input.includes('features') || input.includes('how')) {
      return {
        id: messages.length + 2,
        text: "SkillSync offers comprehensive resume optimization:\n\n📊 Dashboard - Track your resume performance\n📤 Upload Resume - Import existing resumes\n🔍 Analyze Resume - Get ATS scores & recommendations\n🎨 Resume Builder - Create professional resumes\n💾 Saved Resumes - Manage all your resumes\n🎤 Interview Prep - Practice with AI-generated questions\n\nWhat would you like to explore first?",
        isBot: true,
        timestamp: new Date()
      };
    }

    // Navigation questions
    if (input.includes('where') || input.includes('find') || input.includes('go to')) {
      return {
        id: messages.length + 2,
        text: "Use the sidebar menu to navigate:\n• Dashboard - Overview and analytics\n• Upload - Add new resumes\n• Analyze - Check ATS compatibility\n• Builder - Create/edit resumes\n• Saved Resumes - Manage your collection\n• Interview Prep - Practice questions\n\nThe hamburger menu (☰) controls the sidebar on mobile devices.",
        isBot: true,
        timestamp: new Date()
      };
    }

    // Thank you responses
    if (input.includes('thank') || input.includes('thanks')) {
      return {
        id: messages.length + 2,
        text: "You're welcome! I'm here whenever you need help with your resume optimization journey. Feel free to ask about any SkillSync features!",
        isBot: true,
        timestamp: new Date()
      };
    }

    // Default responses
    const defaultResponses = [
      "I'd be happy to help you with SkillSync! You can ask me about resume uploading, ATS analysis, interview preparation, or any platform features. What would you like to know?",
      "SkillSync is designed to help you optimize your resume for better job matches. I can guide you through uploading resumes, getting ATS scores, building new resumes, or practicing interviews. How can I assist?",
      "I'm your SkillSync assistant! Whether you need help with resume analysis, template selection, interview preparation, or understanding ATS scores, I'm here to help. What would you like to explore?"
    ];

    return {
      id: messages.length + 2,
      text: defaultResponses[Math.floor(Math.random() * defaultResponses.length)],
      isBot: true,
      timestamp: new Date()
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Don't render chatbot on auth pages
  if (!user) return null;

  return (
    <>
      {/* Chatbot Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all duration-300 hover:scale-110 z-50"
          aria-label="Open chat"
        >
          <FiMessageCircle size={24} />
        </button>
      )}

      {/* Chatbot Window */}
      {isOpen && (
        <div className={`fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-2xl z-50 transition-all duration-300 ${
          isMinimized ? 'h-14' : 'h-[500px]'
        }`}>
          {/* Header */}
          <div className="bg-primary-600 text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold">AI</span>
              </div>
              <div>
                <h3 className="font-semibold">SkillSync Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                {isMinimized ? <FiMaximize2 size={16} /> : <FiMinimize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded"
              >
                <FiX size={16} />
              </button>
            </div>
          </div>

          {/* Chat Content */}
          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="flex-1 p-4 space-y-4 overflow-y-auto h-80">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.isBot
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-primary-600 text-white'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t p-4">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    disabled={isTyping}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    className="bg-primary-600 text-white p-2 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiSend size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;