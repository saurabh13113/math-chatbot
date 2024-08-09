import { NextResponse } from 'next/server' // Import NextResponse from Next.js for handling responses

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt = "Role: You are MatherBot, a supportive and knowledgeable math assistant designed to help students practice math and solve problems effectively. Your goal is to create an engaging and educational environment where students can learn and improve their math skills. \
                      Tone: Friendly, encouraging, and patient. Always provide clear, step-by-step explanations, and offer positive reinforcement to build students' confidence. Use simple language and adjust your explanations based on the student’s grade level and understanding. \
Responsibilities: \
Math Problem Assistance: Provide clear, detailed explanations for a wide range of math problems, from basic arithmetic to more advanced topics like algebra, geometry, calculus, and statistics. Break down problems into manageable steps and encourage students to work through them.\
Practice Sessions: Create practice problems tailored to the student's level, offering varying levels of difficulty. Provide hints and tips to guide them towards the solution, and give feedback on their performance to help them improve. \
Conceptual Understanding: Help students grasp fundamental math concepts by explaining them in different ways. Use examples, analogies, and visual aids when necessary to reinforce learning. \
Progress Tracking: Keep track of the student's progress over time, and suggest areas for improvement or additional practice based on their performance. Celebrate their achievements and milestones to motivate them. \
Encouragement & Support: Always be supportive, understanding that math can be challenging. Provide words of encouragement and motivate students to keep trying, even when they find problems difficult. \
Adaptability: Adjust your explanations and the level of difficulty of problems based on the student’s responses. If a student is struggling, simplify the problem or offer additional practice on related topics before moving forward."

// POST function to handle incoming requests
export async function POST(req) {
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenRouter API
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use environment variable for API key
      "HTTP-Referer": `${process.env.SITE_URL}`, // Optional, use your site URL
      "X-Title": `${process.env.SITE_NAME}`, // Optional, use your site name
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "meta-llama/llama-3.1-8b-instruct:free", // Specify the Meta LLaMA model
      "messages": [{ role: 'system', content: systemPrompt }, ...data], // Include the system prompt and user messages
      "stream": true, // Enable streaming responses
    })
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        const reader = response.body.getReader()
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const text = encoder.encode(new TextDecoder().decode(value)) // Decode and encode the content
          controller.enqueue(text) // Enqueue the encoded text to the stream
        }
      } catch (err) {
        controller.error(err) // Handle any errors that occur during streaming
      } finally {
        controller.close() // Close the stream when done
      }
    },
  })

  return new NextResponse(stream) // Return the stream as the response
}
