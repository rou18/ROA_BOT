import os
from dotenv import load_dotenv
load_dotenv()

import pyupbit
df = pyupbit.get_ohlcv("KRW-BTC", count=30, interval="day")

import openai

# OpenAI API 요청
response = openai.ChatCompletion.create(
    model="gpt-4",
    messages=[
        {
            "role": "system",
            "content": "You are an expert in Bitcoin investing. Tell me whether to buy, sell, or hold based on the chart data provided. Respond in JSON format.\n\nResponse Example:\n{\"decision\": \"buy\", \"reason\": \"some technical reason\"}\n{\"decision\": \"sell\", \"reason\": \"some technical reason\"}\n{\"decision\": \"hold\", \"reason\": \"some technical reason\"}"
        },
        {
            "role": "user",
            "content": df.to_json()
        }
    ]
)
print(response)