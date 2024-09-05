import pytest
from fastapi.testclient import TestClient
from app.main import app  # Assuming your FastAPI app is in app.main
from app.models.notification_request import NotificationRequestModel
from app.utils.database import get_db, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Create a test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override the get_db dependency to use the test database
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

# Create the test client
client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_and_teardown():
    Base.metadata.create_all(bind=engine)  # Create the tables
    yield
    Base.metadata.drop_all(bind=engine)  # Drop the tables after tests

def test_create_notification_request_success():
    """
    Test that a notification request is successfully created and stored in the database.
    """
    request_data = {
        "client_path": "some/path",
        "msg": "Test notification",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test Subject"
    }

    response = client.post("/notification-requests", json=request_data)
    
    assert response.status_code == 200
    assert response.json()["status"] == "sent"

def test_create_notification_request_missing_fields():
    """
    Test that a notification request fails when required fields are missing.
    """
    request_data = {
        "msg": "Test notification",
        "groups": ["group1", "group2"]
    }

    response = client.post("/notification-requests", json=request_data)
    
    assert response.status_code == 422  # Unprocessable Entity

def test_create_notification_request_invalid_data():
    """
    Test that a notification request fails with invalid data.
    """
    request_data = {
        "client_path": 1234,  # Invalid data type, should be a string
        "msg": "Test notification",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test Subject"
    }

    response = client.post("/notification-requests", json=request_data)
    
    assert response.status_code == 422  # Unprocessable Entity

def test_create_notification_request_service_failure():
    """
    Test the scenario where the TelAlert service fails to send the notification.
    """
    request_data = {
        "client_path": "some/path",
        "msg": "Test notification",
        "groups": ["group1", "group2"],
        "destinations": ["dest1", "dest2"],
        "subject": "Test Subject"
    }

    # Mock the notify function to simulate failure
    with pytest.raises(Exception):
        response = client.post("/notification-requests", json=request_data)

        assert response.status_code == 500  # Internal Server Error
        assert response.json()["detail"] == "Failed to send notification."

