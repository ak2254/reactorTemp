import asyncio
import unittest
import httpx
from hyprxa import HyprxaHttpxClient, HyprxaHttpxAsyncClient

class TestHyprxaHttpxClient(unittest.TestCase):
    def setUp(self):
        self.client = HyprxaHttpxClient()

    def test_get_request(self):
        response = self.client.get("https://jsonplaceholder.typicode.com/todos/1")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["userId"], 1)

    def test_post_request(self):
        response = self.client.post("https://jsonplaceholder.typicode.com/posts", json={"title": "foo", "body": "bar", "userId": 1})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.json()["title"], "foo")

class TestHyprxaHttpxAsyncClient(unittest.TestCase):
    async def setUpAsync(self):
        self.client = HyprxaHttpxAsyncClient()

    async def test_get_request_async(self):
        async with httpx.AsyncClient() as httpx_client:
            response = await self.client.get("https://jsonplaceholder.typicode.com/todos/1", httpx_client=httpx_client)
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()["userId"], 1)

    async def test_post_request_async(self):
        async with httpx.AsyncClient() as httpx_client:
            response = await self.client.post("https://jsonplaceholder.typicode.com/posts", json={"title": "foo", "body": "bar", "userId": 1}, httpx_client=httpx_client)
            self.assertEqual(response.status_code, 201)
            self.assertEqual(response.json()["title"], "foo")
