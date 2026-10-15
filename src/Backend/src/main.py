from fastapi import FastAPI

import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from google import genai



# Initialize the application
app = FastAPI()

#Loading the API key
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY");

# LLM

llm = ChatGoogleGenerativeAI(
    model="models/gemini-3.8-flash", 
    temperature=0,
    google_api_key=api_key
)

prompt = ChatPromptTemplate.from_messages([
    ("system", "You are an expert AI assistant that gives concise answers."),
    ("human", "{user_input}")
])

chain = prompt | llm

@app.get("/")
def read_root():
    try:
        client = genai.Client()

        interaction = client.interactions.create(
            model="gemini-3.8-flash",
            input="Explain how AI works in a few words"
        )

        return interaction.output_text

    except Exception as e:
        return str(e)

    
