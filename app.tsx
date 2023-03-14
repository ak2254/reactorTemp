import pytest
from httpx import Response, Request, AsyncClient
from hyprxa_httpx_async_client import HyprxaHttpxAsyncClient


@pytest.mark.asyncio
async def test_send_with_retry():
    client = HyprxaHttpxAsyncClient()
    
    async def successful_request():
        return Response(200, json={"success": True})
    
    response = await client._send_with_retry(successful_request)
    assert response.status_code == 200
    assert response.json() == {"success": True}
    
    async def failing_request():
        return Response(503)
    
    with pytest.raises(Response) as exc_info:
        await client._send_with_retry(failing_request)
    assert exc_info.value.status_code == 503


@pytest.mark.asyncio
async def test_send():
    client = HyprxaHttpxAsyncClient()
    
    async def successful_request():
        return Response(200, json={"success": True})
    
    response = await client.send(Request("GET", "https://example.com"))
    assert response.status_code == 200
    assert response.json() == {"success": True}
    
    async def failing_request():
        return Response(503)
    
    with pytest.raises(Response) as exc_info:
        await client.send(Request("GET", "https://example.com"))
    assert exc_info.value.status_code == 503
