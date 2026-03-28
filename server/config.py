from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GEMINI_API_KEY: str = ""
    GEMINI_PRO_MODEL: str = "gemini-2.0-pro-exp"
    GEMINI_FLASH_MODEL: str = "gemini-2.0-flash-exp"
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/campaigns"
    REDIS_URL: str = "redis://localhost:6379/0"
    MAX_EDITOR_ITERATIONS: int = 3
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra='ignore')

settings = Settings()
