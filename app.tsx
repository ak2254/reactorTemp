from fastapi import FastAPI, HTTPException, Depends, status as http_status
from sqlalchemy.ext.asyncio import AsyncSession
import asyncio
import logging

app = FastAPI()
logger = logging.getLogger(__name__)

class NotificationExceptionGroup(Exception):
    pass

# Assuming `notify` is a synchronous function.
async def create_notification_request(
    request: NotificationRequestCreate, 
    db: AsyncSession = Depends(get_db)
):
    try:
        # Step 1: Create a new notification request in the database
        new_request = await notification_requests.create_notification_request(db, request)
    except Exception as e:
        logger.error(f"Failed to create notification request: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create notification request."
        )

    loop = asyncio.get_event_loop()
    try:
        # Step 2: Attempt to send the notification with a timeout
        timeout = 5.0
        status, timestamp = await asyncio.wait_for(
            loop.run_in_executor(
                None, 
                notify,
                request.client_path,
                request.msg,
                request.groups,
                request.destinations,
                request.subject
            ),
            timeout=timeout
        )
    except asyncio.TimeoutError:
        logger.error("Notification sending timed out.")
        await notification_requests.update_notification_request(db, new_request.id, "timeout")
        raise HTTPException(
            status_code=http_status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Notification sending timed out."
        )
    except NotificationExceptionGroup as e:
        logger.error(f"Notification failed for one or more destinations/groups: {str(e)}")
        await notification_requests.update_notification_request(db, new_request.id, "failed")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification to some groups or destinations."
        )
    except psycopg.errors.UniqueViolation:
        logger.error("Duplicate idempotency key detected.")
        raise HTTPException(
            status_code=http_status.HTTP_409_CONFLICT,
            detail="Duplicate idempotency key detected."
        )
    except psycopg.errors.DatabaseError as e:
        logger.error(f"Database error occurred: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database error occurred."
        )
    except Exception as e:
        logger.error(f"Notification failed: {str(e)}")
        await notification_requests.update_notification_request(db, new_request.id, "failed")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send notification."
        )

    # Step 3: Update the notification request status based on the result
    try:
        await notification_requests.update_notification_request(db, new_request.id, status)
    except Exception as e:
        logger.error(f"Failed to update notification request status: {str(e)}")
        raise HTTPException(
            status_code=http_status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update notification request status."
        )

    return new_request

# Example usage
@app.post("/notification-requests")
async def create_notification(request: NotificationRequestCreate, db: AsyncSession = Depends(get_db)):
    return await create_notification_request(request, db)
