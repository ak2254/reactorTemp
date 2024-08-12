# app/routers/notifications.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.utils.database import get_db
from app.models.notification import Notification
from app.schemas.notification import NotificationRequest, NotificationResponse
from app.services.telalert_service import notify

router = APIRouter()

@router.post("/notifications", response_model=NotificationResponse)
def create_notification(notification: NotificationRequest, db: Session = Depends(get_db)):
    # Perform the notification logic using the notify function
    status, timestamp = notify(
        client_path=notification.client_path,
        msg=notification.msg,
        groups=notification.groups,
        destinations=notification.destinations,
        subject=notification.subject
    )

    # Create a new notification record in the database
    new_notification = Notification(
        client_path=str(notification.client_path),  # Convert Path to string
        msg=notification.msg,
        groups=",".join(notification.groups),
        destinations=",".join(notification.destinations),
        subject=notification.subject,
        status=status,
        timestamp=timestamp
    )
    db.add(new_notification)
    db.commit()
    db.refresh(new_notification)

    return new_notification
