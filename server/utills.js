app.post('/api/openai', async (req, res) => {
    const { message } = req.body;
    
    // store user message in global message state
    const userMessage = { role: "user", content: message };

    // add to global messages list
    global.messages.push(userMessage);

    // send a request to the OpenAI API with the user's message
    // using the node-fetch library
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            // notice how we're using process.env here
            // this is using the environment variable from the .env file
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        // construct the request payload
        // using the entire chat history (global.messages)
        // sending an external request to the OpenAI API
        body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: global.messages,
			// the maximum number of tokens/words the bot should return
            // in response to a given prompt
            max_tokens: 100,
        }),
    });
    
    if (!response.ok) {
        // if the request was not successful, parse the error
        const error = await response.json();

        // log the error for debugging purposes
        console.error('OpenAI API Error:', error);

        // return an error response to the client
        return res.json({ status: 'error', data: null });
    }
    
    // parse the response from OpenAI as json
    const data = await response.json();

    // get the bot's answer from the OpenAI API response
    const botAnswer = data?.choices?.[0]?.message?.content

    // create the bot message object
    const botMessage = { role: "assistant", content: botAnswer };

    // store bot message in global message state
    global.messages.push(botMessage);

    // send the bot's answer back to the client
    return res.json({ status: 'success', data: botAnswer });
});