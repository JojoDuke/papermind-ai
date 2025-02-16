# 📚 Papermind AI

Papermind AI is your intelligent document companion - an AI-powered PDF and document assistant that transforms how you interact with your reading materials. Built with modern technology and designed for seamless user experience, Papermind AI helps you extract insights, generate summaries, and engage in natural conversations about your documents.

## ✨ Features

- **🔍 Smart Document Analysis**: Upload PDFs and other documents for AI-powered analysis
- **💬 Conversational Interface**: Ask questions about your documents and get intelligent responses
- **📝 Auto-Summarization**: Generate concise summaries and key takeaways
- **🎯 Smart Highlights**: AI-powered identification of crucial points and insights
- **🔎 Semantic Search**: Find exactly what you're looking for with natural language queries
- **🌙 Dark Mode**: Easy on the eyes with full dark mode support
- **📱 Responsive Design**: Seamless experience across desktop and mobile devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TailwindCSS, ShadCN UI
- **Backend**: FastAPI/Express.js
- **Database**: PostgreSQL (via Supabase)
- **Vector Storage**: Pinecone/Weaviate
- **Authentication**: Supabase
- **AI Models**: OpenAI GPT-4 Turbo & Embeddings

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/JojoDuke/ChatifyPDF-Fix.git
cd ChatifyPDF-Fix
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4-turbo-preview

# Vector Database Configuration (Choose one)
# For Pinecone:
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
PINECONE_INDEX=your_index_name

# For Weaviate:
WEAVIATE_API_KEY=your_weaviate_key
WEAVIATE_URL=your_weaviate_cluster_url

# Optional: Analytics & Monitoring
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_POSTHOG_HOST=your_posthog_host
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application in action.

## 💼 Business Model

Papermind AI operates on a freemium model:
- **Free Tier**: Limited queries per month
- **Premium**: Unlimited document interactions and advanced features
- **Early Adopter**: Special lifetime deal options available

## 🤝 Contributing

We welcome contributions! Please feel free to submit a Pull Request. Here's how you can contribute:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ by [JojoDuke](https://github.com/JojoDuke)
