import os
import re
import json
import time
from datetime import datetime
from flask import Flask, request, jsonify
from flask_cors import CORS
import yfinance as yf
from dotenv import load_dotenv
import google.generativeai as genai
import pandas as pd
from groq import Groq

load_dotenv()

# Gemini setup
GEMINI_KEY = os.environ.get("GEMINI_API_KEY", "")
if GEMINI_KEY:
    genai.configure(api_key=GEMINI_KEY)

# Groq setup
GROQ_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_KEY) if GROQ_KEY else None

import ollama
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import OllamaEmbeddings

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

MODEL = "llama3.2"
DB_DIR = "vectordb"

# ---------------------------------------------------------------------------
# Vector DB for FAQ chatbot (existing functionality)
# ---------------------------------------------------------------------------
print("Loading embeddings...")
try:
    embeddings = OllamaEmbeddings(model="llama3.2")
    # Test embeddings connection
    embeddings.embed_query("test")
    OLLAMA_AVAILABLE = True
except Exception as e:
    print(f"Ollama not available for embeddings, falling back to Gemini embeddings: {e}")
    from langchain_google_genai import GoogleGenerativeAIEmbeddings
    embeddings = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
    OLLAMA_AVAILABLE = False

print("Initializing ChromaDB...")
db = None
try:
    if not os.path.exists(DB_DIR):
        print("Database not found. Creating from faq.txt...")
        if not os.path.exists("faq.txt"):
            print("Error: faq.txt not found!")
            # Create a dummy faq if missing to prevent crash
            with open("faq.txt", "w") as f:
                f.write("Welcome to Investra. How can I help you?")
        
        with open("faq.txt", "r") as f:
            text = f.read()
        text = re.sub(r"\(Q\d+\)", "", text)
        splitter = CharacterTextSplitter(chunk_size=300, chunk_overlap=30)
        docs = splitter.create_documents([text])
        db = Chroma.from_documents(docs, embeddings, persist_directory=DB_DIR)
        db.persist()
    else:
        print("Loading existing database...")
        db = Chroma(persist_directory=DB_DIR, embedding_function=embeddings)
    print("ChromaDB initialization complete.")
except Exception as e:
    print(f"ChromaDB initialization failed: {e}")


# ---------------------------------------------------------------------------
# Nifty 50 Ticker Mapping  (name/alias → NSE ticker)
# ---------------------------------------------------------------------------
NIFTY_50_MAP = {
    "reliance": "RELIANCE.NS",
    "reliance industries": "RELIANCE.NS",
    "tcs": "TCS.NS",
    "tata consultancy": "TCS.NS",
    "tata consultancy services": "TCS.NS",
    "hdfcbank": "HDFCBANK.NS",
    "hdfc bank": "HDFCBANK.NS",
    "hdfc": "HDFCBANK.NS",
    "infosys": "INFY.NS",
    "infy": "INFY.NS",
    "icicibank": "ICICIBANK.NS",
    "icici bank": "ICICIBANK.NS",
    "icici": "ICICIBANK.NS",
    "hindunilvr": "HINDUNILVR.NS",
    "hindustan unilever": "HINDUNILVR.NS",
    "hul": "HINDUNILVR.NS",
    "itc": "ITC.NS",
    "sbin": "SBIN.NS",
    "sbi": "SBIN.NS",
    "state bank": "SBIN.NS",
    "state bank of india": "SBIN.NS",
    "bhartiartl": "BHARTIARTL.NS",
    "bharti airtel": "BHARTIARTL.NS",
    "airtel": "BHARTIARTL.NS",
    "kotakbank": "KOTAKBANK.NS",
    "kotak bank": "KOTAKBANK.NS",
    "kotak mahindra": "KOTAKBANK.NS",
    "kotak": "KOTAKBANK.NS",
    "lti": "LTI.NS",
    "lt": "LT.NS",
    "larsen": "LT.NS",
    "larsen & toubro": "LT.NS",
    "l&t": "LT.NS",
    "axisbank": "AXISBANK.NS",
    "axis bank": "AXISBANK.NS",
    "axis": "AXISBANK.NS",
    "wipro": "WIPRO.NS",
    "hcltech": "HCLTECH.NS",
    "hcl tech": "HCLTECH.NS",
    "hcl technologies": "HCLTECH.NS",
    "hcl": "HCLTECH.NS",
    "asianpaint": "ASIANPAINT.NS",
    "asian paints": "ASIANPAINT.NS",
    "maruti": "MARUTI.NS",
    "maruti suzuki": "MARUTI.NS",
    "sunpharma": "SUNPHARMA.NS",
    "sun pharma": "SUNPHARMA.NS",
    "sun pharmaceutical": "SUNPHARMA.NS",
    "tatamotors": "TATAMOTORS.NS",
    "tata motors": "TATAMOTORS.NS",
    "bajfinance": "BAJFINANCE.NS",
    "bajaj finance": "BAJFINANCE.NS",
    "bajaj": "BAJFINANCE.NS",
    "bajajfinsv": "BAJAJFINSV.NS",
    "bajaj finserv": "BAJAJFINSV.NS",
    "titan": "TITAN.NS",
    "titan company": "TITAN.NS",
    "nestleind": "NESTLEIND.NS",
    "nestle": "NESTLEIND.NS",
    "nestle india": "NESTLEIND.NS",
    "ntpc": "NTPC.NS",
    "powergrid": "POWERGRID.NS",
    "power grid": "POWERGRID.NS",
    "ultracemco": "ULTRACEMCO.NS",
    "ultratech cement": "ULTRACEMCO.NS",
    "ultratech": "ULTRACEMCO.NS",
    "techm": "TECHM.NS",
    "tech mahindra": "TECHM.NS",
    "ongc": "ONGC.NS",
    "tatasteel": "TATASTEEL.NS",
    "tata steel": "TATASTEEL.NS",
    "jswsteel": "JSWSTEEL.NS",
    "jsw steel": "JSWSTEEL.NS",
    "jsw": "JSWSTEEL.NS",
    "adanient": "ADANIENT.NS",
    "adani enterprises": "ADANIENT.NS",
    "adani": "ADANIENT.NS",
    "adaniports": "ADANIPORTS.NS",
    "adani ports": "ADANIPORTS.NS",
    "coalindia": "COALINDIA.NS",
    "coal india": "COALINDIA.NS",
    "bpcl": "BPCL.NS",
    "bharat petroleum": "BPCL.NS",
    "grasim": "GRASIM.NS",
    "grasim industries": "GRASIM.NS",
    "indusindbk": "INDUSINDBK.NS",
    "indusind bank": "INDUSINDBK.NS",
    "indusind": "INDUSINDBK.NS",
    "cipla": "CIPLA.NS",
    "divislab": "DIVISLAB.NS",
    "divis lab": "DIVISLAB.NS",
    "divi's laboratories": "DIVISLAB.NS",
    "drreddy": "DRREDDY.NS",
    "dr reddy": "DRREDDY.NS",
    "dr reddys": "DRREDDY.NS",
    "eichermot": "EICHERMOT.NS",
    "eicher motors": "EICHERMOT.NS",
    "eicher": "EICHERMOT.NS",
    "heromotoco": "HEROMOTOCO.NS",
    "hero motocorp": "HEROMOTOCO.NS",
    "hero": "HEROMOTOCO.NS",
    "hindalco": "HINDALCO.NS",
    "hindalco industries": "HINDALCO.NS",
    "apollohosp": "APOLLOHOSP.NS",
    "apollo hospitals": "APOLLOHOSP.NS",
    "apollo": "APOLLOHOSP.NS",
    "britannia": "BRITANNIA.NS",
    "britannia industries": "BRITANNIA.NS",
    "sbilife": "SBILIFE.NS",
    "sbi life": "SBILIFE.NS",
    "hdfclife": "HDFCLIFE.NS",
    "hdfc life": "HDFCLIFE.NS",
    "m&m": "M&M.NS",
    "mahindra": "M&M.NS",
    "mahindra and mahindra": "M&M.NS",
    "tataconsum": "TATACONSUM.NS",
    "tata consumer": "TATACONSUM.NS",
    "upl": "UPL.NS",
}


def _resolve_ticker(company_name: str) -> str:
    """Map a company name / alias to its NSE ticker symbol."""
    name = company_name.strip().lower()
    if name in NIFTY_50_MAP:
        return NIFTY_50_MAP[name]
    # Partial / fuzzy match
    for key, ticker in NIFTY_50_MAP.items():
        if name in key or key in name:
            return ticker
    # Fallback: treat input as raw ticker
    raw = company_name.upper().replace(" ", "")
    return f"{raw}.NS" if not raw.endswith(".NS") else raw


# ---------------------------------------------------------------------------
# Tool 1 — Last 7 days stock prices (yfinance)
# ---------------------------------------------------------------------------
def get_stock_prices(company_name: str) -> dict:
    """Fetch the last 7 trading days of stock prices for a Nifty 50 company.

    Args:
        company_name: The name or ticker of the company, for example
                      'Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ITC'.

    Returns:
        A dict with the ticker symbol, company name and a list of daily
        price entries (date, open, high, low, close, volume) in INR.
    """
    ticker_symbol = _resolve_ticker(company_name)
    try:
        df = yf.download(ticker_symbol, period="7d", interval="1d", progress=False)
        if df.empty:
            return {"error": f"No price data found for '{company_name}' ({ticker_symbol}). Check the name and try again."}

        def _val(row, col):
            v = row[col]
            return float(v.iloc[0]) if isinstance(v, pd.Series) else float(v)

        prices = []
        for date, row in df.iterrows():
            prices.append({
                "date": date.strftime("%Y-%m-%d"),
                "open": round(_val(row, "Open"), 2),
                "high": round(_val(row, "High"), 2),
                "low": round(_val(row, "Low"), 2),
                "close": round(_val(row, "Close"), 2),
                "volume": int(_val(row, "Volume")),
            })

        first_close = prices[0]["close"]
        last_close = prices[-1]["close"]
        change_pct = round((last_close - first_close) / first_close * 100, 2)

        return {
            "ticker": ticker_symbol,
            "company": company_name,
            "currency": "INR",
            "period": "last 7 trading days",
            "price_data": prices,
            "week_change_percent": change_pct,
        }
    except Exception as e:
        return {"error": f"Failed to fetch prices for {company_name}: {str(e)}"}


# ---------------------------------------------------------------------------
# Tool 2 — Recent stock-related news (yfinance)
# ---------------------------------------------------------------------------
def get_stock_news(company_name: str) -> dict:
    """Fetch major recent news headlines about a Nifty 50 company's stock.

    Args:
        company_name: The name or ticker of the company, for example
                      'Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ITC'.

    Returns:
        A dict with the ticker symbol, company name and a list of up to 7
        recent news items with title, publisher, published date and link.
    """
    ticker_symbol = _resolve_ticker(company_name)
    try:
        import urllib.request
        url = f"http://localhost:5005/api/stocks/news/{ticker_symbol}"
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as response:
            api_data = json.loads(response.read().decode())
            
        news_items = []
        if api_data.get("success"):
            articles = api_data.get("data", [])
            for article in articles[:7]:
                news_items.append({
                    "title": article.get("title", "N/A"),
                    "publisher": article.get("source", "N/A"),
                    "published": article.get("time", "N/A"),
                    "link": article.get("link", ""),
                })

        if not news_items:
            return {
                "ticker": ticker_symbol,
                "company": company_name,
                "news": [],
                "message": "No recent news articles found for this company.",
            }

        return {
            "ticker": ticker_symbol,
            "company": company_name,
            "news": news_items,
        }
    except Exception as e:
        return {"error": f"Failed to fetch news for {company_name}: {str(e)}"}


# ---------------------------------------------------------------------------
# Vega — System Prompt & Personality
# ---------------------------------------------------------------------------
VEGA_SYSTEM_PROMPT = """You are **Vega** ⚡, the AI Trading Mentor on the Investra platform.
Your name comes from the Options Greeks — Vega measures how sensitive an option's price is to changes in volatility. You embody that sharpness and market awareness.

**Your Personality:**
- You're sharp, confident, and energetic — like a cool senior trader who actually enjoys teaching rookies the ropes.
- You keep things real and slightly witty. No boring textbook vibes.
- You use crisp analogies (cricket, Bollywood, everyday life) to make finance click instantly.
- You hype up good questions ("Now THAT's the kind of thinking that separates traders from gamblers 🔥").
- You use emojis smartly — enough to feel modern, not spammy.
- Your signature line: "Let's read the market like a pro."

**Your Mission:**
- EDUCATE users about stock market concepts using REAL data.
- When the user mentions ANY Nifty 50 company, you MUST call BOTH tools — `get_stock_prices` AND `get_stock_news` — to fetch live data before responding.
- Analyze price trends (rising? falling? volatile? consolidating?) and EXPLAIN what patterns mean.
- Connect news events to price movements — teach cause-and-effect thinking.
- Teach concepts like support/resistance, volume spikes, sector rotation, candlestick basics, and market sentiment in plain language.

**Response Format (when analyzing a stock):**
1. 📊 **Price Snapshot** — Summarize the week's price action with key numbers (open, close, high, low, % change).
2. 📰 **News Pulse** — Highlight the most impactful headlines and explain WHY they matter for the stock.
3. 🎓 **Learning Moment** — Teach ONE relevant concept based on what's happening (e.g., if volume spiked, teach about volume; if stock is range-bound, teach about consolidation).
4. ⚡ **Key Takeaway** — One simple, memorable lesson.
5. ⚠️ **Disclaimer** — Remind this is educational, not investment advice.

**Important Rules:**
- You are STRICTLY educational — NEVER give buy/sell/hold recommendations.
- Always add a brief disclaimer that this is for learning, not financial advice.
- If the user asks a general trading concept (like "what is PE ratio?"), answer directly without needing tools.
- If you don't know something, say so honestly.
- Focus on Indian stock market (NSE/BSE) context.
- Keep language simple — imagine explaining to a college student new to investing.
"""

# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.route("/chat", methods=["POST"])
def chat():
    """FAQ chatbot powered by Ollama + ChromaDB (existing)."""
    try:
        data = request.json
        message = data.get("message", "")

        if not message:
            return jsonify({"error": "No message provided"}), 400

        if not db:
            return jsonify({"response": "Hey! Investra's FAQ database is currently initializing. Give me a moment! 🔄"})

        results = db.similarity_search(message, k=2)
        context = "\n".join([r.page_content for r in results])

        system_prompt = """
You are Investra's friendly chatbot.

Rules:
- Keep answers short (max 2-3 sentences)
- Be conversational
- No Q numbers
- Ask follow-up when helpful
- Answer only from context
"""

        # Try Ollama first
        if OLLAMA_AVAILABLE:
            try:
                response = ollama.chat(
                    model=MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": f"Context:\n{context}\n\nUser question: {message}"},
                    ],
                )
                return jsonify({"response": response["message"]["content"]})
            except Exception as ollama_err:
                print(f"Ollama chat failed, falling back to Gemini: {ollama_err}")

        # Fallback to Gemini
        model = genai.GenerativeModel("gemini-2.0-flash")
        prompt = f"System: {system_prompt}\n\nContext:\n{context}\n\nUser question: {message}"
        response = model.generate_content(prompt)
        return jsonify({"response": response.text})

    except Exception as e:
        print(f"Error during chat: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500



# ---------------------------------------------------------------------------
# Groq tool-calling definitions (OpenAI-compatible format)
# ---------------------------------------------------------------------------
GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_stock_prices",
            "description": "Fetch the last 7 trading days of stock prices for a Nifty 50 company. Returns open, high, low, close, volume and weekly change %.",
            "parameters": {
                "type": "object",
                "properties": {
                    "company_name": {
                        "type": "string",
                        "description": "The name or ticker of the company, e.g. 'Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ITC'"
                    }
                },
                "required": ["company_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_stock_news",
            "description": "Fetch major recent news headlines about a Nifty 50 company's stock. Returns up to 7 news items with title, publisher and date.",
            "parameters": {
                "type": "object",
                "properties": {
                    "company_name": {
                        "type": "string",
                        "description": "The name or ticker of the company, e.g. 'Reliance', 'TCS', 'Infosys', 'HDFC Bank', 'ITC'"
                    }
                },
                "required": ["company_name"]
            }
        }
    }
]

# Map tool names to actual functions
TOOL_FUNCTIONS = {
    "get_stock_prices": get_stock_prices,
    "get_stock_news": get_stock_news,
}


def _detect_nifty_company(message: str):
    """Check if the user message mentions a Nifty 50 company. Returns the match or None."""
    msg_lower = message.lower()
    # Sort by key length (longest first) so "hdfc bank" matches before "hdfc"
    for key in sorted(NIFTY_50_MAP.keys(), key=len, reverse=True):
        if key in msg_lower:
            return key
    return None


def _call_groq_with_tools(message: str) -> str:
    """Call Groq LLM with real stock data injected."""

    # Smart approach: detect company name, pre-fetch BOTH data sources,
    # then give the LLM all the data in one shot. More reliable than
    # depending on tool-calling behavior which can be flaky.
    company = _detect_nifty_company(message)

    data_context = ""
    if company:
        print(f"  ⚡ Detected company: '{company}' → fetching data...")
        price_data = get_stock_prices(company)
        news_data = get_stock_news(company)
        data_context = f"""

--- REAL-TIME DATA (fetched just now) ---

STOCK PRICES (Last 7 Trading Days):
{json.dumps(price_data, indent=2)}

RECENT NEWS:
{json.dumps(news_data, indent=2)}

--- END OF DATA ---
"""
        print(f"  ✅ Price data: {'error' not in price_data}, News data: {'error' not in news_data}")

    # Build the prompt with data injected
    user_content = message
    if data_context:
        user_content = f"{message}\n{data_context}"

    messages = [
        {"role": "system", "content": VEGA_SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    response = groq_client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        max_tokens=4096,
        temperature=0.7,
    )

    return response.choices[0].message.content


def _call_gemini_with_tools(message: str) -> str:
    """Call Gemini with automatic function calling."""
    model = genai.GenerativeModel(
        "gemini-2.0-flash",
        tools=[get_stock_prices, get_stock_news],
        system_instruction=VEGA_SYSTEM_PROMPT,
    )
    chat_session = model.start_chat(enable_automatic_function_calling=True)
    response = chat_session.send_message(message)
    return response.text


@app.route("/mentor_chat", methods=["POST"])
def mentor_chat():
    """Vega — AI Trading Mentor. Tries Groq first, falls back to Gemini."""
    try:
        data = request.json
        message = data.get("message", "")

        if not message:
            return jsonify({"error": "No message provided"}), 400

        # ---- Strategy: Groq (primary) → Gemini (fallback) ----
        errors = []

        # Try Groq first (fast + generous free tier)
        if groq_client:
            try:
                print("⚡ Using Groq (primary)...")
                result = _call_groq_with_tools(message)
                return jsonify({"response": result})
            except Exception as groq_err:
                print(f"Groq failed: {groq_err}")
                errors.append(f"Groq: {groq_err}")

        # Fallback to Gemini
        if GEMINI_KEY:
            try:
                print("🔄 Falling back to Gemini...")
                result = _call_gemini_with_tools(message)
                return jsonify({"response": result})
            except Exception as gemini_err:
                print(f"Gemini failed: {gemini_err}")
                errors.append(f"Gemini: {gemini_err}")

        # Both failed
        return jsonify({
            "response": "⚡ Hey! Vega here — both my AI backends are temporarily unavailable. "
                         "This is usually a rate-limit issue. Give me a minute and try again! 🔄"
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    providers = []
    if groq_client:
        providers.append("Groq ✅")
    if GEMINI_KEY:
        providers.append("Gemini ✅")
    print(f"\n⚡ Vega AI Trading Mentor is ready!")
    print(f"   Providers: {', '.join(providers)}")
    print("   /chat         → FAQ chatbot (Ollama)")
    print("   /mentor_chat  → Vega mentor (Tools + LLM)\n")
    app.run(host="0.0.0.0", port=5001, debug=False)
