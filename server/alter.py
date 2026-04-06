import asyncio
import sys
import os

# add current dir to sys path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text
from config import settings

async def alter():
    engine = create_async_engine(settings.DATABASE_URL)
    async with engine.begin() as conn:
        try:
            await conn.execute(text("ALTER TABLE campaigns ADD COLUMN name VARCHAR;"))
            print("Successfully added name column.")
        except Exception as e:
            print(f"Failed to alter table (might already exist): {e}")
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(alter())
