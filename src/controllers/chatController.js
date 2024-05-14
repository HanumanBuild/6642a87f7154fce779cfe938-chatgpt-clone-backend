const axios = require('axios');
const ChatHistory = require('../models/ChatHistory');

const sendMessage = async (req, res) => {
  const { message, userId } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
      prompt: message,
      max_tokens: 150,
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const botReply = response.data.choices[0].text;

    // Save chat history
    const chatHistory = await ChatHistory.findOne({ userId });
    if (chatHistory) {
      chatHistory.messages.push({ sender: 'user', text: message });
      chatHistory.messages.push({ sender: 'bot', text: botReply });
      await chatHistory.save();
    } else {
      await ChatHistory.create({
        userId,
        messages: [
          { sender: 'user', text: message },
          { sender: 'bot', text: botReply }
        ]
      });
    }

    res.json({ reply: botReply });
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Error sending message' });
  }
};

module.exports = { sendMessage };