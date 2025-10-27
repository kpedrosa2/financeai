/**
 * Cliente DeepSeek - USO PESSOAL APENAS
 * ⚠️ NÃO use isso em produção ou apps públicos!
 * A API key fica exposta no navegador
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Armazena a chave de forma temporária (não é seguro para produção!)
let API_KEY = null;

export const setDeepSeekKey = (key) => {
  API_KEY = key;
  if (typeof window !== 'undefined') {
    localStorage.setItem('deepseek_key', key);
  }
};

export const getDeepSeekKey = () => {
  if (!API_KEY && typeof window !== 'undefined') {
    API_KEY = localStorage.getItem('deepseek_key');
  }
  return API_KEY;
};

export const deepseekAnalysis = async ({ prompt, schema = false }) => {
  const key = getDeepSeekKey();
  
  if (!key) {
    throw new Error('Configure a chave API do DeepSeek primeiro');
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um assistente financeiro expert que ajuda pessoas a gerenciar suas finanças pessoais. Sempre responda em português brasileiro de forma clara e prática.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        response_format: schema ? { type: 'json_object' } : undefined
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Erro na API DeepSeek');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    if (schema) {
      return JSON.parse(content);
    }

    return content;

  } catch (error) {
    console.error('❌ Erro DeepSeek:', error);
    throw error;
  }
};