import os
from dotenv import load_dotenv
import base64
from pathlib import Path
from langchain_core.prompts import ChatPromptTemplate
from utils.main_utils import save_to_file, embed_schema


from langchain_groq import ChatGroq

#Loading the env key from OS.
load_dotenv()
api_key = os.getenv("GROK_KEY");

#Initialize the LLM
llm = ChatGroq(
    model="openai/gpt-oss-120b", 
    temperature=0,
    groq_api_key=api_key,
    reasoning_effort = "low"
)

# Create a template to use with the prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a useful AI bot that helps create SQL queries based on the prompt given by the human."),
    ("human", "{user_input}")
])

# creating the chain to invoke the prompt.
chain = prompt | llm


#function to Load the ERD Schema.

def load_Erd():
    # Model that support Vision ( VISION_LLM )
    erd_llm = ChatGroq(
        model="qwen/qwen3.8-27b", 
        temperature=0,
        groq_api_key=api_key,
        reasoning_effort="medium"
    )

    # Convert the ERD image into base64 format safely
    base64_Image = base64.b64encode(Path("./assets/sample_erd.png").read_bytes()).decode("utf-8")

    # Defined Template
    erd_prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a useful AI bot that converts the given ERD diagram into JSON representation that can be used to store as a knowledge base for RAG system."),
        ("human", [
            {
                "type": "text", 
                "text": "{user_input}"
            },
            {
                "type": "image_url", 
                "image_url": {"url": "data:image/png;base64,{image_data}"}
            }
        ])
    ])

    erd_chain = erd_prompt | erd_llm

    print("invoking the prompt")
    # Invoke the prompt from chain
    erd_json = erd_chain.invoke({
        "user_input": "Convert the given ERD to a format as specified below, make sure to be strict to the format and reduce the max output tokens as much as possible."
        "Format : Table_Name: Column1(Data_type),Column2(dataType),ColumnN(dataType)|index1(fields_in_order),index2(fields in order)|FK(ColumnName++TableName)"
        "only add details that are available no need to suggest details of any type like indexes."
        "no need to add the sizes in the data types."
        "do not any extra markdowns, explanantions or text. keep the output strictly to the format defined."
        "terminate each line with #.",
        "image_data": base64_Image
    })

    print(erd_json.content)
    save_to_file(erd_json.content, "./assets/knowledge_base.txt")

#load_Erd()
embed_schema()

    
