'use client'

// Import necessary components and hooks from Material UI and React
import { Box, Button, Stack, TextField, Avatar } from '@mui/material'
import { useState, useRef, useEffect } from 'react'

// Main functional component for the application
export default function Home() {
  
  // State to manage the chat messages between user and the assistant
  const [messages, setMessages] = useState([
    {
      // Initial message from MatherBot
      role: 'assistant',
      content: `Welcome to MatherBot!\n\
                MatherBot is your friendly and knowledgeable math assistant, here to help you master math concepts, solve problems, and practice your skills.\n\
                Whether you're tackling basic arithmetic or diving into advanced topics like algebra, geometry, calculus, or statistics,\n\
                MatherBot is designed to guide you step-by-step.\n\
                You can ask for explanations, practice problems, or even track your progress as you improve.\n\
                No matter where you are in your math journey, MatherBot is here to support you with patience and encouragement.`,
    },
  ])

  // State to manage the input message from the user
  const [message, setMessage] = useState('')

  // State to track whether a message is being sent
  const [isLoading, setIsLoading] = useState(false)

  // Function to handle sending of the message
  const sendMessage = async () => {
    // Check if the message is empty or if another message is being processed
    if (!message.trim() || isLoading) return;
    
    // Set the loading state to true as the message is being processed
    setIsLoading(true);

    // Store the user's message locally before clearing the input field
    const userMessage = message;
    setMessage('');
    
    // Update the chat history with the user's message and a placeholder for the assistant's response
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: userMessage },
      { role: 'assistant', content: '' },
    ]);

    // Try to send the message to the assistant API and handle the response
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`, // Retrieve API key from environment variables
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "meta-llama/llama-3.1-8b-instruct:free", // Specify the model being used
          "messages": [...messages, { role: 'user', content: userMessage }], // Send the chat history along with the new message
        }),
      });

      // Check if the API response was successful
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      // Parse the JSON response from the assistant
      const data = await response.json();
      const assistantResponse = data.choices[0].message.content; // Extract only the assistant's response

      // Update the chat history with the assistant's response
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1]; // Get the last (placeholder) message
        let otherMessages = messages.slice(0, messages.length - 1); // Get all other messages
        return [
          ...otherMessages,
          { ...lastMessage, content: assistantResponse }, // Replace the placeholder with the actual response
        ];
      });
    } catch (error) {
      // Log any errors and update the chat history with an error message
      console.error('Error:', error);
      setMessages((messages) => [
        ...messages,
        { role: 'assistant', content: "I'm sorry, but I encountered an error. Please try again later." },
      ]);
    }

    // Reset the loading state as the message processing is complete
    setIsLoading(false);
  }

  // Function to handle 'Enter' key press for sending a message
  const handleKeyPress = (event) => {
    // Send message if Enter is pressed without Shift
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }

  // Reference to the end of the chat messages, used for scrolling
  const messagesEndRef = useRef(null)

  // Function to scroll to the bottom of the chat messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Automatically scroll to the bottom whenever new messages are added
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Render the chat interface
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#121212', // Dark background for the entire application
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
          border: '2px solid #00ffa5', // Bright teal border for a stylish look
          boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.1)', // Slight shadow for depth
        }}
      >
        <Avatar
          alt="Chatbot Logo"
          src='../matherlogo.jpg' // Path to the chatbot's logo image
          sx={{ width: 56, height: 56, mb: 2 }} // Size and spacing for the logo
        />  
        <Stack spacing={2} sx={{ width: '100%', overflowY: 'auto', flexGrow: 1 }}>
          {messages.map((message, index) => (
            <Box
              key={index}
              sx={{
                alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start', // Align user messages to the right, assistant messages to the left
                backgroundColor: message.role === 'user' ? '#1976d2' : '#f1f1f1', // Different colors for user and assistant messages
                color: message.role === 'user' ? '#fff' : '#000', // Text color based on role
                padding: '8px 12px', // Padding inside the message boxes
                borderRadius: '8px', // Rounded corners for the message boxes
                maxWidth: '70%', // Limit the width of message boxes
                wordWrap: 'break-word', // Ensure long words break and wrap to the next line
                boxShadow: '0px 0px 10px rgba(255, 255, 255, 0.1)', // Slight shadow for depth
                border: '2px solid #00ffa5', // Bright teal border for a consistent look
              }}
            >
              {message.content} {/* Render the message content */}
            </Box>
          ))}
          <div ref={messagesEndRef} /> {/* Invisible element to mark the end of the messages */}
        </Stack>
        <Stack direction={'row'} spacing={2} sx={{ pt: 2, width: '100%' }}>
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{ backgroundColor: '#fff', color: '#000', borderRadius: '4px' }} // White background for the text input box
          />
          <Button 
            variant="contained" 
            onClick={sendMessage}
            disabled={isLoading}
            sx={{ backgroundColor: '#00dbfe' }} // Neon teal color for the send button
          >
            {isLoading ? 'Sending...' : 'Send'} {/* Change button text based on loading state */}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
