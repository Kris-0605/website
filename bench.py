import asyncio
import websockets
from numpy import float32
from random import random

async def send_data(uri, connection_number):
    async with websockets.connect(uri) as websocket:
        try:
            while True:
                data = float32(random()).tobytes() + float32(random()).tobytes()
                await websocket.send(data)
                await asyncio.sleep(random()*5)
        except websockets.ConnectionClosed:
            print(f"Connection {connection_number} closed")

async def main():
    uri = "wss://particle.kris.software/"
    tasks = []

    for i in range(1):
        task = asyncio.create_task(send_data(uri, i))
        tasks.append(task)

    await asyncio.gather(*tasks)

if __name__ == "__main__":
    asyncio.run(main())
