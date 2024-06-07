import aiohttp.web
from tqdm import tqdm
from time import time

limit = 50000 # how many packets per second can the server handle?

pbar = tqdm(desc="Packets sent")

connected_websockets = []

async def websocket_handler(request):
    ws = aiohttp.web.WebSocketResponse()
    await ws.prepare(request)
    ws.time = time()
    connected_websockets.append(ws)

    try:
        async for msg in ws:
            length = len(msg.data)
            if length == 1:
                await ws.send_bytes(len(connected_websockets).to_bytes(4, "little"))
                pbar.update(1)
            elif length == 8:
                if ws.time < time() - ((len(connected_websockets) ** 2) / limit):
                    for socket in connected_websockets:
                        if socket != ws:
                            try:
                                await socket.send_bytes(msg.data)
                                pbar.update()
                            except:
                                connected_websockets.remove(socket)
                    ws.time = time()
            else:
                raise ValueError()
    finally:
        connected_websockets.remove(ws)

    return ws

if __name__ == '__main__':
    app = aiohttp.web.Application()
    app.router.add_get('/', websocket_handler)
    aiohttp.web.run_app(app, port=727)