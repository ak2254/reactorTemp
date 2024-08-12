# app/routers/notifications.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.models.notification_request import NotificationRequest as NotificationRequestModel
from app.models.notification import Notification
from app.schemas.notification import NotificationResponse
from app.schemas.notification_request import NotificationRequestCreate, NotificationRequestResponse
from app.services.telalert_service import notify
from datetime import datetime

router = APIRouter()

@router.post("/notification-requests", response_model=NotificationRequestResponse)
def create_notification_request(request: NotificationRequestCreate, db: Session = Depends(get_db)):
    # Store the initial request in the database
    new_request = NotificationRequestModel(
        client_path=str(request.client_path),
        msg=request.msg,
        groups=",".join(request.groups),
        destinations=",".join(request.destinations),
        subject=request.subject,
        status="pending",
        timestamp=datetime.now()
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    # Attempt to notify using the TelAlert service
    status, timestamp = notify(
        client_path=request.client_path,
        msg=request.msg,
        groups=request.groups,
        destinations=request.destinations,
        subject=request.subject
    )

    # Update the request status
    new_request.status = "success" if status == "success" else "failed"
    db.commit()
    db.refresh(new_request)

    # If successful, store the notification in the notifications table
    if status == "success":
        new_notification = Notification(
            request_id=new_request.id,
            client_path=new_request.client_path,
            msg=new_request.msg,
            groups=new_request.groups,
            destinations=new_request.destinations,
            subject=new_request.subject,
            status="success",
            timestamp=timestamp
        )
        db.add(new_notification)
        db.commit()

    return new_request
