import pytest
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError
from app.main import app  # assuming this is where your FastAPI app is defined
from app.models import Notification  # assuming this is your Notification model
from app.schemas.notification_request import NotificationRequestCreate

client = TestClient(app)

@pytest.mark.asyncio
async def test_create_notification_request_success(db_session):
    request_data = {
        "client_path": "/path/to/client",
        "msg": "Test message",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test subject"
    }
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["status"] == "success"
    assert response_data["client_path"] == request_data["client_path"]
    assert response_data["msg"] == request_data["msg"]

@pytest.mark.asyncio
async def test_create_notification_request_telalert_failure(db_session, mocker):
    request_data = {
        "client_path": "/path/to/client",
        "msg": "Test message",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test subject"
    }
    mocker.patch("app.services.telalert_service.notify", side_effect=Exception("TelAlert failure"))
    
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 500
    response_data = response.json()
    assert response_data["detail"] == "Failed to send notification."

@pytest.mark.asyncio
async def test_create_notification_request_db_error(db_session, mocker):
    request_data = {
        "client_path": "/path/to/client",
        "msg": "Test message",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test subject"
    }
    mocker.patch("app.crud.notification_requests.create_notification_request", side_effect=SQLAlchemyError("DB error"))
    
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 500
    response_data = response.json()
    assert response_data["detail"] == "Failed to create notification request."

@pytest.mark.asyncio
async def test_create_notification_request_invalid_data(db_session):
    request_data = {
        "client_path": "",  # Invalid: empty path
        "msg": "Test message",
        "groups": "invalid_groups_format",  # Invalid: not a list
        "destinations": ["dest1", "dest2"],
        "subject": "Test subject"
    }
    
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 422  # Unprocessable Entity
    response_data = response.json()
    assert "client_path" in response_data["detail"][0]["loc"]
    assert "groups" in response_data["detail"][0]["loc"]

@pytest.mark.asyncio
async def test_create_notification_request_optional_fields_omitted(db_session):
    request_data = {
        "client_path": "/path/to/client",
        "msg": "Test message",
    }
    
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["status"] == "success"
    assert response_data["groups"] is None
    assert response_data["destinations"] is None
    assert response_data["subject"] is None

@pytest.mark.asyncio
async def test_notification_created_in_database(db_session):
    request_data = {
        "client_path": "/path/to/client",
        "msg": "Test message",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test subject"
    }
    
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 200
    
    notification = db_session.query(Notification).filter_by(request_id=response.json()["id"]).first()
    assert notification is not None
    assert notification.status == "success"
    assert notification.msg == request_data["msg"]

@pytest.mark.asyncio
async def test_create_notification_request_empty_groups_destinations(db_session):
    request_data = {
        "client_path": "/path/to/client",
        "msg": "Test message",
        "groups": [],
        "destinations": [],
        "subject": "Test subject"
    }
    
    response = await client.post("/notification-requests", json=request_data)
    assert response.status_code == 200
    response_data = response.json()
    assert response_data["status"] == "success"
    assert response_data["groups"] is None
    assert response_data["destinations"] is None
