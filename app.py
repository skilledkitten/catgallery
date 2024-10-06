from flask import Flask, request, jsonify, render_template
from supabase import create_client, Client
import datetime
from openai import OpenAI
import os
import requests
from mistralai import Mistral

app = Flask(__name__)

SUPABASE_URL = 'https://cyepvmcwuzzlrozhyxsi.supabase.co'
SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5ZXB2bWN3dXp6bHJvemh5eHNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMzU4NTgsImV4cCI6MjA0MzcxMTg1OH0.ZuZ5LbVgMTOp7ZDgliKj1V1bMmlZMAMiidOkEC5Ky5A'
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route('/')
def root():
    return render_template('root.html')

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    prompt = data.get('prompt')
    image_url = generate_image(prompt)

    # Retrieve the API key from environment variables
    api_key = os.environ["MISTRAL_API_KEY"]
    model = "pixtral-12b-2409"

    # Initialize the Mistral client
    client = Mistral(api_key=api_key)

    # Define the messages for the chat
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "text",
                    "text": "What's in this image?"
                },
                {
                    "type": "image_url",
                    "image_url": image_url
                }
            ]
        }
    ]

    try:
        chat_response = client.chat.complete(
            model=model,
            messages=messages
        )
        pixtral_desc = chat_response.choices[0].message.content
    except Exception as e:
        print(f"Error during chat completion: {e}")
        return jsonify({"error": "Failed to generate description. Please try again later."}), 500

    # Fetch the score using the prompt and description
    score_response = requests.post('https://api.chipp.ai/chat', json={
        "applicationId": 15127,
        "apiKey": os.environ.get("CHIPP_API_KEY"),
        "messageList": [
            {
                "senderType": "USER",
                "content": f"Prompt: {prompt}\nDescription: {pixtral_desc}"
            }
        ]
    })

    score = 0  # Default score
    if score_response.ok:
        print(score_response.json())
        score_data = score_response.json()
        score = score_data.get('score', 0)  # Get the score from the response

    # Store the image data in the database
    response = supabase.table('images').insert({
        'url': image_url,
        'prompt': prompt,
        'pixtral_desc': pixtral_desc,  # Store the Pixtral description
        'score': score,  # Store the score
        'created_at': datetime.datetime.now().isoformat()
    }).execute()

    return jsonify({"url": image_url, "prompt": prompt, "pixtral_desc": pixtral_desc, "score": score})

def generate_image(prompt):
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    response = client.images.generate(
        model="dall-e-2",
        prompt=prompt,
    )
    return response.data[0].url

@app.route('/images', methods=['GET'])
def get_images():
    response = supabase.table('images').select('*').order('created_at', desc=True).execute()
    return jsonify(response.data), 200

@app.route('/score', methods=['POST'])
def get_score():
    print("Score endpoint hit")  # Debugging line
    # Retrieve the API key from environment variables
    api_key = os.environ.get("CHIPP_API_KEY")
    
    # Get the request data
    data = request.json
    prompt = data.get('message', '').split('\n')[0]  # Extract prompt from the message
    description = data.get('message', '').split('\n')[1]  # Extract description from the message

    # Prepare the request data
    request_data = {
        "applicationId": 15127,
        "apiKey": api_key,
        "messageList": [
            {
                "senderType": "USER",
                "content": f"Prompt: {prompt}\nDescription: {description}"
            }
        ]
    }

    # Send the POST request to the Chipp API
    response = requests.post('https://api.chipp.ai/chat', json=request_data)

    if response.ok:
        response_data = response.json()
        score = response_data['messageList'][1]['content']  # Adjust based on the actual response structure
        print(f"Score: {score}")  # Debugging line
        return jsonify({"score": score})
    
    return jsonify({"error": "Failed to fetch score"}), response.status_code

if __name__ == '__main__':
    app.run(debug=True, port=9000)
