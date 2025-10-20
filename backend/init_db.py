#!/usr/bin/env python3
import sys
from app import init_db

if __name__ == "__main__":
    try:
        print("🚀 Initializing database...")
        init_db()
        print("✅ Database tables created or verified successfully!")
    except Exception as e:
        print("❌ Database initialization failed:", str(e))
        sys.exit(1)
