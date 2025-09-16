// import { useState, useRef, useEffect } from 'react'
// import { 
//   MessageCircle, 
//   Send, 
//   X, 
//   Minimize2, 
//   Bot,
//   User,
//   Paperclip,
//   ThumbsUp,
//   ThumbsDown
// } from 'lucide-react'

// const Chatbot = () => {
//   const [isOpen, setIsOpen] = useState(false)
//   const [isMinimized, setIsMinimized] = useState(false)
//   const [messages, setMessages] = useState([
//     {
//       id: 1,
//       type: 'bot',
//       message: "Hi! I'm your AI career assistant. How can I help you today?",
//       timestamp: new Date(),
//       suggestions: [
//         "Help me find jobs",
//         "Review my resume",
//         "Interview tips",
//         "Salary negotiation"
//       ]
//     }
//   ])
//   const [inputMessage, setInputMessage] = useState('')
//   const [isTyping, setIsTyping] = useState(false)
//   const messagesEndRef = useRef(null)
//   const inputRef = useRef(null)

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }

//   useEffect(() => {
//     scrollToBottom()
//   }, [messages])

//   const botResponses = {
//     "help me find jobs": {
//       message: "I'd be happy to help you find jobs! I can assist you with:\n\n• Searching for positions matching your skills\n• Setting up job alerts\n• Optimizing your job search strategy\n• Understanding job requirements\n\nWhat type of role are you looking for?",
//       suggestions: ["Software Engineer", "Product Manager", "Data Scientist", "Designer"]
//     },
//     "review my resume": {
//       message: "Great choice! I can help you improve your resume. Here's what I can do:\n\n• Analyze your resume content\n• Check for ATS compatibility\n• Suggest improvements\n• Optimize keywords\n\nWould you like to upload your resume for a detailed analysis?",
//       suggestions: ["Upload resume", "Resume tips", "ATS optimization", "Cover letter help"]
//     },
//     "interview tips": {
//       message: "I'll help you ace your interviews! Here are some key areas I can assist with:\n\n• Common interview questions\n• Technical interview prep\n• Behavioral questions\n• Interview follow-up\n\nWhat type of interview are you preparing for?",
//       suggestions: ["Technical interview", "Behavioral questions", "Phone interview", "Video interview"]
//     },
//     "salary negotiation": {
//       message: "Salary negotiation is crucial! Here's how I can help:\n\n• Research market rates\n• Negotiation strategies\n• Preparing your case\n• Timing your ask\n\nWhat's your current situation - new job offer or raise request?",
//       suggestions: ["New job offer", "Current job raise", "Market research", "Negotiation scripts"]
//     }
//   }

//   const getDefaultResponse = () => ({
//     message: "I understand you're looking for help with your career. I can assist you with:\n\n• Job searching and applications\n• Resume and cover letter optimization\n• Interview preparation\n• Salary negotiation\n• Career advice\n\nWhat would you like to focus on?",
//     suggestions: ["Find jobs", "Resume help", "Interview prep", "Career advice"]
//   })

//   const sendMessage = async (messageText = inputMessage) => {
//     if (!messageText.trim()) return

//     const userMessage = {
//       id: messages.length + 1,
//       type: 'user',
//       message: messageText,
//       timestamp: new Date()
//     }

//     setMessages(prev => [...prev, userMessage])
//     setInputMessage('')
//     setIsTyping(true)

//     // Simulate thinking time
//     setTimeout(() => {
//       const lowerMessage = messageText.toLowerCase()
//       let response = getDefaultResponse()

//       // Find matching response
//       Object.keys(botResponses).forEach(key => {
//         if (lowerMessage.includes(key) || key.includes(lowerMessage)) {
//           response = botResponses[key]
//         }
//       })

//       // Special handling for specific keywords
//       if (lowerMessage.includes('software engineer') || lowerMessage.includes('developer')) {
//         response = {
//           message: "Excellent! For software engineering positions, I recommend:\n\n• Focus on technical skills (React, Node.js, Python)\n• Highlight your projects and GitHub\n• Practice coding interviews\n• Research the company's tech stack\n\nWould you like help with technical interview prep or resume optimization?",
//           suggestions: ["Technical questions", "Code challenges", "System design", "Resume optimization"]
//         }
//       } else if (lowerMessage.includes('product manager')) {
//         response = {
//           message: "Product Management is a great field! Here's how I can help:\n\n• Understanding PM responsibilities\n• Building a PM portfolio\n• Case study preparation\n• Metrics and analytics focus\n\nWhat aspect of PM roles interests you most?",
//           suggestions: ["PM skills", "Case studies", "Portfolio tips", "PM interview prep"]
//         }
//       }

//       const botMessage = {
//         id: messages.length + 2,
//         type: 'bot',
//         message: response.message,
//         timestamp: new Date(),
//         suggestions: response.suggestions
//       }

//       setMessages(prev => [...prev, botMessage])
//       setIsTyping(false)
//     }, 1500)
//   }

//   const handleSuggestionClick = (suggestion) => {
//     sendMessage(suggestion)
//   }

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       sendMessage()
//     }
//   }

//   const formatTime = (timestamp) => {
//     return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
//   }

//   if (!isOpen) {
//     return (
//       <div className="fixed bottom-6 right-6 z-[9999]">
//         <button
//           onClick={() => setIsOpen(true)}
//           className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group hover:scale-110 animate-pulse"
//         >
//           <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
//         </button>
        
//         {/* Notification badge */}
//         <div className="absolute -top-2 -left-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-bounce">
//           💬
//         </div>
        
//         {/* Floating tooltip */}
//         <div className="absolute bottom-full right-0 mb-4 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none">
//           Chat with AI Assistant
//           <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="fixed bottom-6 right-6 z-[9999]">
//       <div className={`bg-white rounded-2xl shadow-2xl border border-gray-200 transition-all duration-300 ${
//         isMinimized ? 'h-16' : 'h-96'
//       } w-80`}>
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
//           <div className="flex items-center space-x-3">
//             <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
//               <Bot size={18} />
//             </div>
//             <div>
//               <h3 className="font-semibold text-sm">Career Assistant</h3>
//               <p className="text-xs opacity-90">Online now</p>
//             </div>
//           </div>
          
//           <div className="flex items-center space-x-2">
//             <button
//               onClick={() => setIsMinimized(!isMinimized)}
//               className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
//             >
//               <Minimize2 size={16} />
//             </button>
//             <button
//               onClick={() => setIsOpen(false)}
//               className="p-1 hover:bg-white hover:bg-opacity-20 rounded"
//             >
//               <X size={16} />
//             </button>
//           </div>
//         </div>

//         {!isMinimized && (
//           <>
//             {/* Messages */}
//             <div className="h-64 overflow-y-auto p-4 space-y-4">
//               {messages.map((message) => (
//                 <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
//                     <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${
//                       message.type === 'user' 
//                         ? 'bg-blue-500 text-white' 
//                         : 'bg-gray-200 text-gray-600'
//                     }`}>
//                       {message.type === 'user' ? <User size={12} /> : <Bot size={12} />}
//                     </div>
                    
//                     <div className={`rounded-lg p-3 ${
//                       message.type === 'user'
//                         ? 'bg-blue-500 text-white rounded-br-none'
//                         : 'bg-gray-100 text-gray-800 rounded-bl-none'
//                     }`}>
//                       <p className="text-sm whitespace-pre-line">{message.message}</p>
//                       <p className={`text-xs mt-1 ${
//                         message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
//                       }`}>
//                         {formatTime(message.timestamp)}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               ))}

//               {/* Suggestions */}
//               {messages.length > 0 && messages[messages.length - 1].type === 'bot' && messages[messages.length - 1].suggestions && (
//                 <div className="flex flex-wrap gap-2 mt-2">
//                   {messages[messages.length - 1].suggestions.map((suggestion, index) => (
//                     <button
//                       key={index}
//                       onClick={() => handleSuggestionClick(suggestion)}
//                       className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors"
//                     >
//                       {suggestion}
//                     </button>
//                   ))}
//                 </div>
//               )}

//               {/* Typing indicator */}
//               {isTyping && (
//                 <div className="flex justify-start">
//                   <div className="flex items-center space-x-2">
//                     <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
//                       <Bot size={12} className="text-gray-600" />
//                     </div>
//                     <div className="bg-gray-100 rounded-lg px-3 py-2">
//                       <div className="flex space-x-1">
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
//                         <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input */}
//             <div className="p-4 border-t border-gray-200">
//               <div className="flex items-center space-x-2">
//                 <div className="flex-1 relative">
//                   <input
//                     ref={inputRef}
//                     type="text"
//                     value={inputMessage}
//                     onChange={(e) => setInputMessage(e.target.value)}
//                     onKeyPress={handleKeyPress}
//                     placeholder="Ask me anything about your career..."
//                     className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                   />
//                 </div>
                
//                 <button
//                   onClick={() => sendMessage()}
//                   disabled={!inputMessage.trim() || isTyping}
//                   className={`p-2 rounded-lg transition-colors ${
//                     inputMessage.trim() && !isTyping
//                       ? 'bg-blue-500 text-white hover:bg-blue-600'
//                       : 'bg-gray-200 text-gray-400 cursor-not-allowed'
//                   }`}
//                 >
//                   <Send size={16} />
//                 </button>
//               </div>
              
//               <p className="text-xs text-gray-500 mt-2 text-center">
//                 Powered by AI • Your career assistant
//               </p>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   )
// }

// export default Chatbot
