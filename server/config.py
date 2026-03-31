from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    GROQ_API_KEY: str = ""
    # llama-3.3-70b-versatile for reasoning-heavy tasks (fact check, editor)
    GROQ_PRO_MODEL: str = "llama-3.3-70b-versatile"
    # llama-3.1-8b-instant for fast creative tasks (copywriter)
    GROQ_FLASH_MODEL: str = "llama-3.1-8b-instant"
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/campaigns"
    REDIS_URL: str = "redis://localhost:6379/0"
    MAX_EDITOR_ITERATIONS: int = 3
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]
    
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra='ignore')

settings = Settings()
