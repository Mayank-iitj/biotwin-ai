import asyncio
import uuid
from sqlalchemy import delete
from app.core.database import async_session_maker, engine, Base
from app.models.user import User
from app.models.blood_report import BloodReport
from app.models.wearable import WearableData
from app.models.lifestyle import LifestyleLog, FamilyHistory
from app.models.risk import RiskAssessment
from app.models.recommendation import Recommendation
from app.core.seed import seed_user_data
from app.routers.auth import get_password_hash

async def reset_and_seed():
    demo_uuid = uuid.UUID("00000000-0000-0000-0000-000000000000")
    print("Connecting to database...")
    
    async with async_session_maker() as session:
        # 1. Clean existing records for this user
        print("Cleaning old data...")
        await session.execute(delete(Recommendation).where(Recommendation.user_id == demo_uuid))
        await session.execute(delete(RiskAssessment).where(RiskAssessment.user_id == demo_uuid))
        await session.execute(delete(WearableData).where(WearableData.user_id == demo_uuid))
        await session.execute(delete(LifestyleLog).where(LifestyleLog.user_id == demo_uuid))
        await session.execute(delete(FamilyHistory).where(FamilyHistory.user_id == demo_uuid))
        
        # Select blood report IDs to delete values first
        res = await session.execute(delete(BloodReport).where(BloodReport.user_id == demo_uuid))
        
        # Check if user exists, if not create
        user_res = await session.execute(session.query(User).filter(User.id == demo_uuid))
        user = user_res.scalar_one_or_none()
        if not user:
            print("Creating demo user...")
            user = User(
                id=demo_uuid,
                email="demo@biotwin.ai",
                full_name="Demo User",
                password_hash=get_password_hash("demopassword")
            )
            session.add(user)
            await session.commit()
            await session.refresh(user)
            
        print("Seeding Fitbit dataset...")
        await seed_user_data(demo_uuid, session)
        print("Database commit...")
        await session.commit()
        
    print("Database seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(reset_and_seed())
