const nvidiaApiKey = "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";

async function test() {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${nvidiaApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'deepseek-ai/deepseek-v4.1-flash',
      messages: [{ role: 'user', content: 'Hello' }],
      temperature: 0.7,
      max_tokens: 1024,
      stream: false
    })
  });

  const text = await response.text();
  console.log('Status:', response.status);
  console.log('Response:', text);
}

test();