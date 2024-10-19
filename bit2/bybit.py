import os
import pyupbit
import time
from dotenv import load_dotenv
load_dotenv()
from openai import OpenAI
client = OpenAI()

access = os.getenv("UPBIT_ACCESS_KEY")
secret = os.getenv("UPBIT_SECRET_KEY")          # 본인 값으로 변경
upbit = pyupbit.Upbit(access, secret)

def ai_trading():
    df = pyupbit.get_ohlcv("KRW-BTC", count=30, interval="day")
    #df = pyupbit.get_ohlcv("KRW-BTC", count=30, interval="minute1")

    response = client.chat.completions.create(
    model="gpt-4o",
    messages=[
        {
        "role": "system",
        "content": [
            {
            "type": "text",
            "text": "You are an expert in Bitcoin investing. Tell me whether to buy, sell, or hold based on the chart data provided. response in json format.\n\nRespones Example:\n{\"decision\": \"buy\", \"reson\": \"some technical reason\"}\n{\"decision\": \"sell\", \"reson\": \"some technical reason\"}\n{\"decision\": \"hold\", \"reson\": \"some technical reason\"}"
            }
        ]
        },
        {
        "role": "user",
        "content": [
            {
            "type": "text",
            "text": df.to_json()
            }
        ]
        }
    ],
    response_format={
        "type": "json_object"
    }
    )

    result = response.choices[0].message.content

    import json
    result = json.loads(result)

    if result["decision"] == "buy" :
        #매수
        my_krw = upbit.get_balance("KRW")
        if my_krw*0.9995 > 5000:
            print(upbit.buy_market_order("KRW-BTC", my_krw*0.9995))
            print("buy:")
            print(result["reason"])
        else:
            print("krw 5000원 미만")

    elif result["decision"] == "sell" :
        #매도
        my_btc = upbit.get_balance("KRW-BTC")
        current_price = pyupbit.get_orderbook(ticker="KRW-BTC")['orderbook_units'][0]["ask_price"]

        if my_btc*current_price > 5000:
            print(upbit.sell_market_order("KRW-BTC", upbit.get_balance("KRW-BTC")))
            print("sell:")
            print(result["reason"])
        else:
            print("btc 5000원 미만")

    elif result["decision"] == "hold" :
        #대기
        print("hold:")
        print(result["reason"])

while True:
    time.sleep(10)
    ai_trading()
