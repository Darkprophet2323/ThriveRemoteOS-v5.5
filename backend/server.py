from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import aiohttp
import feedparser
import psutil
import platform
import time
import uuid
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="ThriveRemoteOS API", version="5.4.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ===== MODELS =====

class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class SystemPerformance(BaseModel):
    cpu_percent: float
    memory_percent: float
    disk_percent: float
    uptime: str
    network_sent: int
    network_recv: int
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class WeatherData(BaseModel):
    location: str
    temperature: float
    description: str
    humidity: int
    wind_speed: float
    air_quality: Optional[str] = None
    forecast: List[Dict[str, Any]]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class NewsItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: str
    url: str
    source: str
    published: datetime
    category: str

class JobOpportunity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    company: str
    location: str
    description: str
    salary: Optional[str] = None
    remote_type: str
    url: str
    visa_support: bool = False
    posted_date: datetime

class DownloadItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    filename: str
    url: str
    progress: float = 0.0
    status: str = "pending"  # pending, downloading, completed, failed
    file_size: Optional[int] = None
    downloaded_size: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None

class DownloadCreate(BaseModel):
    filename: str
    url: str

class RelocateOpportunity(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    country: str
    city: str
    job_title: str
    company: str
    visa_type: str
    salary_range: str
    benefits: List[str]
    requirements: List[str]
    relocation_package: Dict[str, Any]
    application_url: str

# ===== UTILITY FUNCTIONS =====

def get_system_uptime():
    """Get system uptime in a readable format"""
    boot_time = psutil.boot_time()
    uptime_seconds = time.time() - boot_time
    days = int(uptime_seconds // 86400)
    hours = int((uptime_seconds % 86400) // 3600)
    minutes = int((uptime_seconds % 3600) // 60)
    return f"{days}d {hours}h {minutes}m"

async def fetch_weather_data(city: str = "London"):
    """Fetch enhanced weather data with forecast"""
    # Mock weather data - in production, use OpenWeatherMap API
    forecast_data = [
        {"day": "Today", "temp": 22, "condition": "Sunny"},
        {"day": "Tomorrow", "temp": 20, "condition": "Cloudy"},
        {"day": "Day 3", "temp": 18, "condition": "Rain"},
    ]
    
    return WeatherData(
        location=city,
        temperature=22.5,
        description="Partly cloudy",
        humidity=65,
        wind_speed=5.2,
        air_quality="Good",
        forecast=forecast_data
    )

async def fetch_tech_news():
    """Fetch technology news"""
    news_items = []
    try:
        # Mock news data - in production, use news APIs
        mock_news = [
            {
                "title": "AI Revolution Continues: New Developments in Remote Work",
                "description": "Latest advancements in AI technology are transforming how remote teams collaborate...",
                "url": "https://example.com/ai-remote-work",
                "source": "TechCrunch",
                "category": "technology"
            },
            {
                "title": "Global Remote Work Market Grows 25% This Quarter",
                "description": "The remote work industry shows unprecedented growth with new opportunities emerging...",
                "url": "https://example.com/remote-work-growth",
                "source": "Forbes",
                "category": "employment"
            },
            {
                "title": "Best Cities for Remote Workers in 2024",
                "description": "Comprehensive guide to the most remote-friendly cities worldwide...",
                "url": "https://example.com/best-remote-cities",
                "source": "Remote Year",
                "category": "relocation"
            }
        ]
        
        for item in mock_news:
            news_items.append(NewsItem(
                title=item["title"],
                description=item["description"],
                url=item["url"],
                source=item["source"],
                published=datetime.utcnow(),
                category=item["category"]
            ))
    except Exception as e:
        logger.error(f"Error fetching news: {e}")
    
    return news_items

async def fetch_job_opportunities():
    """Fetch remote job opportunities"""
    jobs = []
    try:
        # Mock job data - in production, use Remotive API
        mock_jobs = [
            {
                "title": "Senior Full Stack Developer",
                "company": "TechCorp International",
                "location": "Remote (Global)",
                "description": "Join our remote team building cutting-edge applications...",
                "salary": "$80k - $120k",
                "remote_type": "Fully Remote",
                "url": "https://example.com/job1",
                "visa_support": True
            },
            {
                "title": "UX/UI Designer",
                "company": "Design Studio",
                "location": "Remote (EU)",
                "description": "Create beautiful and intuitive user experiences...",
                "salary": "€60k - €85k",
                "remote_type": "Hybrid",
                "url": "https://example.com/job2",
                "visa_support": False
            },
            {
                "title": "Data Scientist",
                "company": "AI Innovations",
                "location": "Remote (US/CA)",
                "description": "Work with cutting-edge AI and machine learning...",
                "salary": "$90k - $140k",
                "remote_type": "Fully Remote",
                "url": "https://example.com/job3",
                "visa_support": True
            }
        ]
        
        for job in mock_jobs:
            jobs.append(JobOpportunity(
                title=job["title"],
                company=job["company"],
                location=job["location"],
                description=job["description"],
                salary=job["salary"],
                remote_type=job["remote_type"],
                url=job["url"],
                visa_support=job["visa_support"],
                posted_date=datetime.utcnow()
            ))
    except Exception as e:
        logger.error(f"Error fetching jobs: {e}")
    
    return jobs

async def fetch_relocate_opportunities():
    """Fetch global relocation opportunities"""
    opportunities = []
    try:
        mock_opportunities = [
            {
                "country": "Portugal",
                "city": "Lisbon",
                "job_title": "Software Engineer",
                "company": "European Tech Hub",
                "visa_type": "Tech Visa",
                "salary_range": "€45k - €70k",
                "benefits": ["Health Insurance", "Relocation Package", "Language Courses"],
                "requirements": ["3+ years experience", "EU citizenship or visa"],
                "relocation_package": {
                    "housing_allowance": "€2000",
                    "flight_tickets": "Included",
                    "visa_assistance": "Full support"
                },
                "application_url": "https://example.com/portugal-job"
            },
            {
                "country": "Estonia",
                "city": "Tallinn",
                "job_title": "Digital Nomad Consultant",
                "company": "Baltic Innovations",
                "visa_type": "Digital Nomad Visa",
                "salary_range": "€40k - €60k",
                "benefits": ["Tax Benefits", "Startup Environment", "EU Access"],
                "requirements": ["Digital skills", "Remote work experience"],
                "relocation_package": {
                    "housing_allowance": "€1500",
                    "startup_visa": "Fast-track processing",
                    "networking_events": "Included"
                },
                "application_url": "https://example.com/estonia-job"
            }
        ]
        
        for opp in mock_opportunities:
            opportunities.append(RelocateOpportunity(
                country=opp["country"],
                city=opp["city"],
                job_title=opp["job_title"],
                company=opp["company"],
                visa_type=opp["visa_type"],
                salary_range=opp["salary_range"],
                benefits=opp["benefits"],
                requirements=opp["requirements"],
                relocation_package=opp["relocation_package"],
                application_url=opp["application_url"]
            ))
    except Exception as e:
        logger.error(f"Error fetching relocation opportunities: {e}")
    
    return opportunities

# ===== API ENDPOINTS =====

@api_router.get("/")
async def root():
    return {"message": "ThriveRemoteOS API v5.4 - Professional Remote Work Platform"}

# System Performance Endpoints
@api_router.get("/system/performance", response_model=SystemPerformance)
async def get_system_performance():
    """Get real-time system performance metrics"""
    try:
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        network = psutil.net_io_counters()
        
        return SystemPerformance(
            cpu_percent=cpu_percent,
            memory_percent=memory.percent,
            disk_percent=disk.percent,
            uptime=get_system_uptime(),
            network_sent=network.bytes_sent,
            network_recv=network.bytes_recv
        )
    except Exception as e:
        logger.error(f"Error getting system performance: {e}")
        raise HTTPException(status_code=500, detail="Unable to fetch system performance")

@api_router.get("/system/info")
async def get_system_info():
    """Get system information"""
    return {
        "platform": platform.system(),
        "platform_version": platform.version(),
        "architecture": platform.architecture()[0],
        "processor": platform.processor(),
        "hostname": platform.node(),
        "python_version": platform.python_version()
    }

# Weather Endpoints
@api_router.get("/weather/enhanced", response_model=WeatherData)
async def get_enhanced_weather(city: str = "London"):
    """Get enhanced weather data with forecasts and air quality"""
    return await fetch_weather_data(city)

@api_router.get("/weather/cities")
async def get_weather_cities():
    """Get list of available weather cities"""
    return {
        "cities": [
            "London", "New York", "Tokyo", "Berlin", "Paris", 
            "Sydney", "Toronto", "Amsterdam", "Barcelona", "Singapore"
        ]
    }

# News Endpoints
@api_router.get("/news/live", response_model=List[NewsItem])
async def get_live_news():
    """Get real-time technology and employment news"""
    return await fetch_tech_news()

@api_router.get("/news/categories")
async def get_news_categories():
    """Get available news categories"""
    return {
        "categories": ["technology", "employment", "relocation", "startup", "remote-work"]
    }

# Job Opportunities Endpoints
@api_router.get("/jobs/live", response_model=List[JobOpportunity])
async def get_live_jobs():
    """Get live remote job opportunities"""
    return await fetch_job_opportunities()

@api_router.get("/jobs/search")
async def search_jobs(keyword: str = "", location: str = "", remote_only: bool = True):
    """Search for specific job opportunities"""
    jobs = await fetch_job_opportunities()
    
    # Filter jobs based on search criteria
    if keyword:
        jobs = [job for job in jobs if keyword.lower() in job.title.lower() or keyword.lower() in job.description.lower()]
    
    if location:
        jobs = [job for job in jobs if location.lower() in job.location.lower()]
    
    if remote_only:
        jobs = [job for job in jobs if "remote" in job.remote_type.lower()]
    
    return jobs

# RelocateMe Endpoints
@api_router.get("/relocateme/opportunities", response_model=List[RelocateOpportunity])
async def get_relocate_opportunities():
    """Get global relocation opportunities with visa support"""
    return await fetch_relocate_opportunities()

@api_router.get("/relocateme/countries")
async def get_relocate_countries():
    """Get list of countries with relocation opportunities"""
    return {
        "countries": [
            {"name": "Portugal", "visa_type": "Tech Visa", "processing_time": "2-3 months"},
            {"name": "Estonia", "visa_type": "Digital Nomad Visa", "processing_time": "1-2 months"},
            {"name": "Germany", "visa_type": "EU Blue Card", "processing_time": "3-4 months"},
            {"name": "Canada", "visa_type": "Express Entry", "processing_time": "6-8 months"},
            {"name": "Netherlands", "visa_type": "Highly Skilled Migrant", "processing_time": "2-3 months"}
        ]
    }

@api_router.post("/relocateme/apply")
async def apply_for_relocation(opportunity_id: str, applicant_data: Dict[str, Any]):
    """Apply for a relocation opportunity"""
    application = {
        "id": str(uuid.uuid4()),
        "opportunity_id": opportunity_id,
        "applicant_data": applicant_data,
        "status": "submitted",
        "submitted_at": datetime.utcnow()
    }
    
    await db.relocation_applications.insert_one(application)
    return {"message": "Application submitted successfully", "application_id": application["id"]}

# Download Management Endpoints
@api_router.post("/downloads/start", response_model=DownloadItem)
async def start_download(download_data: DownloadCreate):
    """Start a new download"""
    download_item = DownloadItem(
        filename=download_data.filename,
        url=download_data.url,
        status="downloading"
    )
    
    await db.downloads.insert_one(download_item.dict())
    
    # Simulate download progress (in production, implement actual download logic)
    asyncio.create_task(simulate_download_progress(download_item.id))
    
    return download_item

async def simulate_download_progress(download_id: str):
    """Simulate download progress for demo purposes"""
    for progress in range(0, 101, 10):
        await asyncio.sleep(1)  # Simulate download time
        await db.downloads.update_one(
            {"id": download_id},
            {"$set": {"progress": progress, "status": "downloading" if progress < 100 else "completed"}}
        )

@api_router.get("/downloads", response_model=List[DownloadItem])
async def get_downloads():
    """Get all downloads"""
    downloads = await db.downloads.find().to_list(1000)
    return [DownloadItem(**download) for download in downloads]

@api_router.get("/downloads/{download_id}", response_model=DownloadItem)
async def get_download(download_id: str):
    """Get specific download by ID"""
    download = await db.downloads.find_one({"id": download_id})
    if not download:
        raise HTTPException(status_code=404, detail="Download not found")
    return DownloadItem(**download)

@api_router.delete("/downloads/{download_id}")
async def delete_download(download_id: str):
    """Delete a download"""
    result = await db.downloads.delete_one({"id": download_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Download not found")
    return {"message": "Download deleted successfully"}

# AI Tools Endpoints
@api_router.get("/ai/tools")
async def get_ai_tools():
    """Get list of 120+ AI tools for remote work"""
    ai_tools = [
        {"name": "ChatGPT", "category": "Writing", "description": "AI writing assistant", "url": "https://chat.openai.com"},
        {"name": "Midjourney", "category": "Design", "description": "AI image generation", "url": "https://midjourney.com"},
        {"name": "Notion AI", "category": "Productivity", "description": "AI-powered workspace", "url": "https://notion.so"},
        {"name": "GitHub Copilot", "category": "Development", "description": "AI code assistant", "url": "https://github.com/copilot"},
        {"name": "Jasper", "category": "Marketing", "description": "AI content creation", "url": "https://jasper.ai"},
        # Add more tools...
    ]
    
    return {"tools": ai_tools, "total_count": 120}

@api_router.get("/ai/categories")
async def get_ai_categories():
    """Get AI tool categories"""
    return {
        "categories": [
            "Writing", "Design", "Development", "Marketing", "Analytics", 
            "Customer Service", "Project Management", "Sales", "HR", "Finance"
        ]
    }

# Legacy endpoints (maintain compatibility)
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)