import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai' // Import OpenAI library for interacting with the OpenAI API

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
  const openai = new OpenAI() // Create a new instance of the OpenAI client
  const data = await req.json() // Parse the JSON body of the incoming request

  // Create a chat completion request to the OpenAI API
  const completion = await openai.chat.completions.create({
    messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
    model: 'davinci-002', // Specify the model to use
    stream: true, // Enable streaming responses
  })

  // Create a ReadableStream to handle the streaming response
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
      try {
        // Iterate over the streamed chunks of the response
        for await (const chunk of completion) {
          const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
          if (content) {
            const text = encoder.encode(content) // Encode the content to Uint8Array
            controller.enqueue(text) // Enqueue the encoded text to the stream
          }
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