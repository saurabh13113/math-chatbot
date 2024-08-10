'use client'

import { Box, Button, Stack, TextField, Avatar } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

export default function Home() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Welcome to MatherBot!\n\
                MatherBot is your friendly and knowledgeable math assistant, here to help you master math concepts, solve problems, and practice your skills.\n\
                Whether you're tackling basic arithmetic or diving into advanced topics like algebra, geometry, calculus, or statistics,\n\
                MatherBot is designed to guide you step-by-step.\n\
                You can ask for explanations, practice problems, or even track your progress as you improve.\n\
                No matter where you are in your math journey, MatherBot is here to support you with patience and encouragement.`,
    },
  ])
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const sendMessage = async () => {
    if (!message.trim() || isLoading) return;
    setIsLoading(true);

    const userMessage = message;
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`, // Store your API key in .env.local for Next.js
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.1-8b-instruct:free",
          "messages": [...messages, { role: 'user', content: userMessage }],
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      const assistantResponse = data.choices[0].message.content; // Extract only the assistant's response

      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [
          ...otherMessages,
          { ...lastMessage, content: assistantResponse },
        ];
      });
    } catch (error) {
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }

    setIsLoading(false);
  }

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212', // Dark background
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '600px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '2rem',
          backgroundColor: '#1e1e1e', // Darker shade for chat box
          borderRadius: '12px',
          border: '2px solid #00ffa5', // Add bright teal frame
          boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.1)',
        }}
      >
        <Avatar
          alt="Chatbot Logo"
          src='../matherlogo.jpg'
          sx={{ width: 56, height: 56, mb: 2 }}
        />  
        <Stack spacing={2} sx={{ width: '100%', overflowY: 'auto', flexGrow: 1 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                backgroundColor: message.role === 'user' ? '#1976d2' : '#f1f1f1',
                color: message.role === 'user' ? '#fff' : '#000',
                padding: '8px 12px',
                borderRadius: '8px',
                maxWidth: '70%',
                wordWrap: 'break-word',
                boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.1)',
                border: '2px solid #00ffa5', // Add bright teal frame
              }}
            >
              {message.content}
            </Box>
          ))}
          <div ref={messagesEndRef} />
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{ pt: 2, width: '100%' }}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{ backgroundColor: '#fff', color: '#000', borderRadius: '4px' }} // Change input text box colour background to white
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ backgroundColor: '#00dbfe' }} // Neon teal button
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}

