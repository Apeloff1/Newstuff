# ========== GO FISH! QUEST & MISSION SYSTEM API ==========
# Daily quests, weekly missions, story progression, and achievements

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
import os
import random

router = APIRouter(prefix="/api/quests", tags=["quests"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ========== QUEST TEMPLATES ==========

DAILY_QUEST_TEMPLATES = [
    {
        "name": "Morning Catch",
        "description": "Catch {target} fish to start your day",
        "quest_type": "daily",
        "difficulty": "easy",
        "objectives": [{"type": "catch_fish", "target": 10}],
        "rewards": {"coins": 200, "xp": 50},
    },
    {
        "name": "Big Game Hunter",
        "description": "Catch a fish larger than {target}cm",
        "quest_type": "daily",
        "difficulty": "normal",
        "objectives": [{"type": "catch_size", "target": 80}],
        "rewards": {"coins": 400, "xp": 100},
    },
    {
        "name": "Perfect Angler",
        "description": "Get {target} perfect catches",
        "quest_type": "daily",
        "difficulty": "normal",
        "objectives": [{"type": "perfect_catch", "target": 5}],
        "rewards": {"coins": 350, "xp": 80, "bait": 3},
    },
    {
        "name": "Combo Master",
        "description": "Achieve a {target}x combo",
        "quest_type": "daily",
        "difficulty": "hard",
        "objectives": [{"type": "combo", "target": 10}],
        "rewards": {"coins": 600, "xp": 150, "gems": 5},
    },
    {
        "name": "Score Champion",
        "description": "Score {target} points in a single session",
        "quest_type": "daily",
        "difficulty": "normal",
        "objectives": [{"type": "score", "target": 2000}],
        "rewards": {"coins": 500, "xp": 120},
    },
    {
        "name": "Rare Hunter",
        "description": "Catch a rare fish",
        "quest_type": "daily",
        "difficulty": "hard",
        "objectives": [{"type": "catch_rarity", "target": 1, "min_rarity": 2}],
        "rewards": {"coins": 750, "xp": 200, "gems": 10},
    },
    {
        "name": "Deep Sea Explorer",
        "description": "Catch fish in the Deep Ocean stage",
        "quest_type": "daily",
        "difficulty": "normal",
        "objectives": [{"type": "catch_stage", "target": 5, "stage": 2}],
        "rewards": {"coins": 450, "xp": 100},
    },
    {
        "name": "Bass Master",
        "description": "Catch {target} Bass",
        "quest_type": "daily",
        "difficulty": "normal",
        "objectives": [{"type": "catch_type", "target": 3, "fish_type": "Bass"}],
        "rewards": {"coins": 400, "xp": 90},
    },
]

WEEKLY_QUEST_TEMPLATES = [
    {
        "name": "Weekly Warrior",
        "description": "Catch {target} fish this week",
        "quest_type": "weekly",
        "difficulty": "normal",
        "objectives": [{"type": "catch_fish", "target": 100}],
        "rewards": {"coins": 2000, "xp": 500, "gems": 25},
    },
    {
        "name": "Tournament Contender",
        "description": "Participate in {target} tournaments",
        "quest_type": "weekly",
        "difficulty": "normal",
        "objectives": [{"type": "tournament_join", "target": 3}],
        "rewards": {"coins": 1500, "xp": 400, "lucky_ticket": 1},
    },
    {
        "name": "Social Butterfly",
        "description": "Send {target} gifts to friends",
        "quest_type": "weekly",
        "difficulty": "easy",
        "objectives": [{"type": "send_gift", "target": 5}],
        "rewards": {"coins": 1000, "xp": 250},
    },
    {
        "name": "Legendary Seeker",
        "description": "Catch a Golden Koi",
        "quest_type": "weekly",
        "difficulty": "legendary",
        "objectives": [{"type": "catch_type", "target": 1, "fish_type": "Golden Koi"}],
        "rewards": {"coins": 5000, "xp": 1000, "gems": 100, "exclusive_lure": True},
    },
    {
        "name": "Perfect Week",
        "description": "Get {target} perfect catches",
        "quest_type": "weekly",
        "difficulty": "hard",
        "objectives": [{"type": "perfect_catch", "target": 50}],
        "rewards": {"coins": 3000, "xp": 750, "gems": 50},
    },
]

STORY_QUESTS = [
    {
        "id": "story_1",
        "name": "First Steps",
        "chapter": 1,
        "description": "Learn the basics of fishing",
        "objectives": [{"type": "catch_fish", "target": 5}],
        "rewards": {"coins": 500, "xp": 100},
        "unlock_requirement": None,
    },
    {
        "id": "story_2",
        "name": "The Perfect Cast",
        "chapter": 1,
        "description": "Master the art of perfect catches",
        "objectives": [{"type": "perfect_catch", "target": 3}],
        "rewards": {"coins": 750, "xp": 150, "lure_unlock": "spoon"},
        "unlock_requirement": "story_1",
    },
    {
        "id": "story_3",
        "name": "Sunset Waters",
        "chapter": 2,
        "description": "Explore the Sunset River",
        "objectives": [{"type": "catch_stage", "target": 10, "stage": 1}],
        "rewards": {"coins": 1000, "xp": 200},
        "unlock_requirement": "story_2",
    },
    {
        "id": "story_4",
        "name": "Into the Deep",
        "chapter": 3,
        "description": "Brave the Deep Ocean at night",
        "objectives": [
            {"type": "catch_stage", "target": 15, "stage": 2},
            {"type": "catch_type", "target": 2, "fish_type": "Catfish"}
        ],
        "rewards": {"coins": 1500, "xp": 300, "rod_unlock": "carbon"},
        "unlock_requirement": "story_3",
    },
    {
        "id": "story_5",
        "name": "Storm Chaser",
        "chapter": 4,
        "description": "Fish in the stormy seas",
        "objectives": [
            {"type": "catch_stage", "target": 20, "stage": 3},
            {"type": "catch_rarity", "target": 5, "min_rarity": 2}
        ],
        "rewards": {"coins": 2500, "xp": 500, "gems": 50},
        "unlock_requirement": "story_4",
    },
    {
        "id": "story_6",
        "name": "The Golden Legend",
        "chapter": 5,
        "description": "Catch the legendary Golden Koi",
        "objectives": [{"type": "catch_type", "target": 1, "fish_type": "Golden Koi"}],
        "rewards": {"coins": 10000, "xp": 2000, "gems": 200, "exclusive_title": "Legend"},
        "unlock_requirement": "story_5",
    },
]


# ========== REQUEST MODELS ==========

class CreateQuestRequest(BaseModel):
    quest_type: str
    user_id: str


class UpdateQuestProgressRequest(BaseModel):
    user_id: str
    quest_id: str
    objective_type: str
    progress_delta: int = 1
    extra_data: Dict[str, Any] = Field(default_factory=dict)


class ClaimQuestRewardRequest(BaseModel):
    user_id: str
    quest_id: str


# ========== QUEST GENERATION ==========

def generate_daily_quests(count: int = 3):
    """Generate random daily quests"""
    selected = random.sample(DAILY_QUEST_TEMPLATES, min(count, len(DAILY_QUEST_TEMPLATES)))
    quests = []
    
    for template in selected:
        quest = {
            "id": str(uuid.uuid4()),
            **template,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        }
        quests.append(quest)
    
    return quests


def generate_weekly_quests(count: int = 2):
    """Generate random weekly quests"""
    selected = random.sample(WEEKLY_QUEST_TEMPLATES, min(count, len(WEEKLY_QUEST_TEMPLATES)))
    quests = []
    
    for template in selected:
        quest = {
            "id": str(uuid.uuid4()),
            **template,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        }
        quests.append(quest)
    
    return quests


# ========== QUEST ENDPOINTS ==========

@router.get("/daily/{user_id}")
async def get_daily_quests(user_id: str):
    """Get user's active daily quests"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    # Check if quests exist for today
    player_quests = await db.player_quests.find({
        "user_id": user_id,
        "quest_type": "daily",
        "quest_date": today
    }, {"_id": 0}).to_list(10)
    
    if not player_quests:
        # Generate new daily quests
        daily_quests = generate_daily_quests(3)
        
        for quest in daily_quests:
            player_quest = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "quest_id": quest["id"],
                "quest_date": today,
                "quest_data": quest,
                "quest_type": "daily",
                "status": "active",
                "objectives_progress": [0] * len(quest["objectives"]),
                "started_at": datetime.now(timezone.utc).isoformat(),
                "completed_at": None,
                "claimed_at": None
            }
            await db.player_quests.insert_one(player_quest)
            player_quests.append(player_quest)
    
    return {"quests": player_quests, "date": today}


@router.get("/weekly/{user_id}")
async def get_weekly_quests(user_id: str):
    """Get user's active weekly quests"""
    # Calculate current week (Monday-Sunday)
    today = datetime.now(timezone.utc)
    week_start = today - timedelta(days=today.weekday())
    week_key = week_start.strftime("%Y-W%W")
    
    player_quests = await db.player_quests.find({
        "user_id": user_id,
        "quest_type": "weekly",
        "quest_date": week_key
    }, {"_id": 0}).to_list(10)
    
    if not player_quests:
        weekly_quests = generate_weekly_quests(2)
        
        for quest in weekly_quests:
            player_quest = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "quest_id": quest["id"],
                "quest_date": week_key,
                "quest_data": quest,
                "quest_type": "weekly",
                "status": "active",
                "objectives_progress": [0] * len(quest["objectives"]),
                "started_at": datetime.now(timezone.utc).isoformat(),
                "completed_at": None,
                "claimed_at": None
            }
            await db.player_quests.insert_one(player_quest)
            player_quests.append(player_quest)
    
    return {"quests": player_quests, "week": week_key}


@router.get("/story/{user_id}")
async def get_story_quests(user_id: str):
    """Get user's story quest progress"""
    # Get completed story quests
    completed = await db.player_story_progress.find_one({"user_id": user_id}, {"_id": 0})
    
    if not completed:
        completed = {
            "user_id": user_id,
            "completed_quests": [],
            "current_chapter": 1
        }
        await db.player_story_progress.insert_one(completed)
    
    completed_ids = completed.get("completed_quests", [])
    
    # Determine available quests
    available_quests = []
    for quest in STORY_QUESTS:
        if quest["id"] in completed_ids:
            quest["status"] = "completed"
        elif quest["unlock_requirement"] is None or quest["unlock_requirement"] in completed_ids:
            quest["status"] = "available"
        else:
            quest["status"] = "locked"
        available_quests.append(quest)
    
    # Get active story quest progress
    active_quest = await db.player_quests.find_one({
        "user_id": user_id,
        "quest_type": "story",
        "status": "active"
    }, {"_id": 0})
    
    return {
        "story_quests": available_quests,
        "completed": completed_ids,
        "current_chapter": completed.get("current_chapter", 1),
        "active_quest": active_quest
    }


@router.post("/story/{user_id}/start/{quest_id}")
async def start_story_quest(user_id: str, quest_id: str):
    """Start a story quest"""
    # Find story quest template
    story_quest = next((q for q in STORY_QUESTS if q["id"] == quest_id), None)
    if not story_quest:
        raise HTTPException(status_code=404, detail="Story quest not found")
    
    # Check unlock requirement
    completed = await db.player_story_progress.find_one({"user_id": user_id}, {"_id": 0})
    completed_ids = completed.get("completed_quests", []) if completed else []
    
    if story_quest["unlock_requirement"] and story_quest["unlock_requirement"] not in completed_ids:
        raise HTTPException(status_code=400, detail="Quest not unlocked yet")
    
    if quest_id in completed_ids:
        raise HTTPException(status_code=400, detail="Quest already completed")
    
    # Check if already has an active story quest
    active = await db.player_quests.find_one({
        "user_id": user_id,
        "quest_type": "story",
        "status": "active"
    })
    if active:
        raise HTTPException(status_code=400, detail="Already have an active story quest")
    
    # Create player quest
    player_quest = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "quest_id": quest_id,
        "quest_date": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "quest_data": story_quest,
        "quest_type": "story",
        "status": "active",
        "objectives_progress": [0] * len(story_quest["objectives"]),
        "started_at": datetime.now(timezone.utc).isoformat(),
        "completed_at": None,
        "claimed_at": None
    }
    
    await db.player_quests.insert_one(player_quest)
    return {"success": True, "quest": {k: v for k, v in player_quest.items() if k != "_id"}}


# ========== QUEST PROGRESS ==========

@router.post("/progress")
async def update_quest_progress(request: UpdateQuestProgressRequest):
    """Update progress on quests based on player actions"""
    # Get all active quests for user
    active_quests = await db.player_quests.find({
        "user_id": request.user_id,
        "status": "active"
    }, {"_id": 0}).to_list(20)
    
    updated_quests = []
    completed_quests = []
    
    for quest in active_quests:
        quest_data = quest["quest_data"]
        objectives = quest_data["objectives"]
        progress = quest["objectives_progress"]
        
        was_updated = False
        
        for i, objective in enumerate(objectives):
            if objective["type"] == request.objective_type:
                # Check additional filters
                matches = True
                
                if "fish_type" in objective and request.extra_data.get("fish_type") != objective["fish_type"]:
                    matches = False
                if "stage" in objective and request.extra_data.get("stage") != objective["stage"]:
                    matches = False
                if "min_rarity" in objective and request.extra_data.get("rarity", 0) < objective["min_rarity"]:
                    matches = False
                if "min_size" in objective and request.extra_data.get("size", 0) < objective.get("min_size", 0):
                    matches = False
                
                if matches:
                    progress[i] = min(progress[i] + request.progress_delta, objective["target"])
                    was_updated = True
        
        if was_updated:
            # Check if quest is completed
            is_complete = all(
                progress[i] >= objectives[i]["target"]
                for i in range(len(objectives))
            )
            
            if is_complete and quest["status"] == "active":
                await db.player_quests.update_one(
                    {"id": quest["id"]},
                    {
                        "$set": {
                            "objectives_progress": progress,
                            "status": "completed",
                            "completed_at": datetime.now(timezone.utc).isoformat()
                        }
                    }
                )
                completed_quests.append(quest["id"])
            else:
                await db.player_quests.update_one(
                    {"id": quest["id"]},
                    {"$set": {"objectives_progress": progress}}
                )
            
            updated_quests.append({
                "quest_id": quest["id"],
                "progress": progress,
                "completed": is_complete
            })
    
    return {
        "success": True,
        "updated_quests": updated_quests,
        "completed_quests": completed_quests
    }


@router.post("/claim")
async def claim_quest_reward(request: ClaimQuestRewardRequest):
    """Claim reward for completed quest"""
    quest = await db.player_quests.find_one({
        "id": request.quest_id,
        "user_id": request.user_id
    }, {"_id": 0})
    
    if not quest:
        raise HTTPException(status_code=404, detail="Quest not found")
    
    if quest["status"] != "completed":
        raise HTTPException(status_code=400, detail="Quest not completed")
    
    if quest.get("claimed_at"):
        raise HTTPException(status_code=400, detail="Reward already claimed")
    
    rewards = quest["quest_data"].get("rewards", {})
    
    # Apply rewards
    if "coins" in rewards:
        await db.users.update_one({"id": request.user_id}, {"$inc": {"score": rewards["coins"]}})
    if "gems" in rewards:
        await db.users.update_one({"id": request.user_id}, {"$inc": {"gems": rewards["gems"]}})
    if "xp" in rewards:
        # Add season pass XP
        from rewards_routes import add_season_xp
        # In practice, call the endpoint or shared function
        pass
    if "bait" in rewards:
        await db.player_bait.update_one(
            {"user_id": request.user_id},
            {"$inc": {"baits.common_bait": rewards["bait"]}},
            upsert=True
        )
    if "lucky_ticket" in rewards:
        await db.player_items.update_one(
            {"user_id": request.user_id},
            {"$inc": {"items.lucky_ticket": rewards["lucky_ticket"]}},
            upsert=True
        )
    
    # Mark as claimed
    await db.player_quests.update_one(
        {"id": request.quest_id},
        {"$set": {"claimed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    # For story quests, update story progress
    if quest["quest_type"] == "story":
        await db.player_story_progress.update_one(
            {"user_id": request.user_id},
            {
                "$push": {"completed_quests": quest["quest_data"]["id"]},
                "$max": {"current_chapter": quest["quest_data"].get("chapter", 1) + 1}
            },
            upsert=True
        )
    
    return {"success": True, "rewards": rewards}


# ========== ACHIEVEMENTS ==========

ACHIEVEMENTS = [
    {"id": "first_catch", "name": "First Catch", "description": "Catch your first fish", "icon": "🐟", "xp": 50, "gems": 5},
    {"id": "catch_100", "name": "Century Fisher", "description": "Catch 100 fish", "icon": "💯", "xp": 200, "gems": 20},
    {"id": "catch_1000", "name": "Master Angler", "description": "Catch 1000 fish", "icon": "🏆", "xp": 1000, "gems": 100},
    {"id": "catch_10000", "name": "Fishing God", "description": "Catch 10,000 fish", "icon": "👑", "xp": 5000, "gems": 500},
    {"id": "golden_koi", "name": "Legendary Hunter", "description": "Catch a Golden Koi", "icon": "⭐", "xp": 500, "gems": 50},
    {"id": "level_10", "name": "Rising Star", "description": "Reach level 10", "icon": "🌟", "xp": 100, "gems": 10},
    {"id": "level_50", "name": "Pro Angler", "description": "Reach level 50", "icon": "🎖️", "xp": 500, "gems": 50},
    {"id": "level_100", "name": "Fishing Legend", "description": "Reach level 100", "icon": "👑", "xp": 2000, "gems": 200},
    {"id": "prestige_1", "name": "Reborn", "description": "Prestige for the first time", "icon": "♻️", "xp": 1000, "gems": 100},
    {"id": "prestige_5", "name": "Eternal Fisher", "description": "Prestige 5 times", "icon": "🔥", "xp": 5000, "gems": 500},
    {"id": "all_lures", "name": "Collector", "description": "Unlock all lures", "icon": "🎣", "xp": 300, "gems": 30},
    {"id": "perfect_10", "name": "Perfectionist", "description": "Get 10 perfect catches", "icon": "✨", "xp": 100, "gems": 10},
    {"id": "perfect_100", "name": "Precision Master", "description": "Get 100 perfect catches", "icon": "💎", "xp": 500, "gems": 50},
    {"id": "combo_10", "name": "Combo Starter", "description": "Achieve a 10x combo", "icon": "🔥", "xp": 100, "gems": 10},
    {"id": "combo_50", "name": "Combo King", "description": "Achieve a 50x combo", "icon": "👑", "xp": 1000, "gems": 100},
    {"id": "whale_watcher", "name": "Whale Watcher", "description": "See the whale 10 times", "icon": "🐋", "xp": 200, "gems": 20},
    {"id": "storm_fisher", "name": "Storm Chaser", "description": "Catch 50 fish during storms", "icon": "⛈️", "xp": 300, "gems": 30},
    {"id": "night_fisher", "name": "Night Owl", "description": "Catch 100 fish at night", "icon": "🌙", "xp": 200, "gems": 20},
    {"id": "guild_member", "name": "Team Player", "description": "Join a guild", "icon": "🤝", "xp": 100, "gems": 10},
    {"id": "guild_contributor", "name": "Guild Champion", "description": "Contribute 10,000 to guild", "icon": "🏅", "xp": 500, "gems": 50},
    {"id": "tournament_winner", "name": "Champion", "description": "Win a tournament", "icon": "🏆", "xp": 1000, "gems": 100},
    {"id": "friend_5", "name": "Social Fisher", "description": "Make 5 friends", "icon": "👥", "xp": 100, "gems": 10},
    {"id": "gift_10", "name": "Generous", "description": "Send 10 gifts", "icon": "🎁", "xp": 100, "gems": 10},
    {"id": "daily_7", "name": "Weekly Warrior", "description": "Login 7 days in a row", "icon": "📅", "xp": 200, "gems": 20},
    {"id": "daily_30", "name": "Dedicated", "description": "Login 30 days in a row", "icon": "🗓️", "xp": 1000, "gems": 100},
]


@router.get("/achievements/all")
async def get_all_achievements():
    """Get all available achievements"""
    return {"achievements": ACHIEVEMENTS}


@router.get("/achievements/{user_id}")
async def get_user_achievements(user_id: str):
    """Get user's achievement progress"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "achievements": 1})
    unlocked = user.get("achievements", []) if user else []
    
    achievements = []
    for ach in ACHIEVEMENTS:
        ach_copy = dict(ach)
        ach_copy["unlocked"] = ach["id"] in unlocked
        achievements.append(ach_copy)
    
    return {
        "achievements": achievements,
        "unlocked_count": len(unlocked),
        "total_count": len(ACHIEVEMENTS)
    }


@router.post("/achievements/{user_id}/check")
async def check_achievements(user_id: str):
    """Check and unlock new achievements based on player stats"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    current_achievements = user.get("achievements", [])
    stats = await db.player_stats.find_one({"user_id": user_id}, {"_id": 0})
    
    newly_unlocked = []
    
    # Check each achievement
    checks = {
        "first_catch": user.get("total_catches", 0) >= 1,
        "catch_100": user.get("total_catches", 0) >= 100,
        "catch_1000": user.get("total_catches", 0) >= 1000,
        "catch_10000": user.get("total_catches", 0) >= 10000,
        "level_10": user.get("level", 1) >= 10,
        "level_50": user.get("level", 1) >= 50,
        "level_100": user.get("level", 1) >= 100,
        "prestige_1": user.get("prestige", 0) >= 1,
        "prestige_5": user.get("prestige", 0) >= 5,
        "perfect_10": user.get("perfect_catches", 0) >= 10,
        "perfect_100": user.get("perfect_catches", 0) >= 100,
        "combo_10": user.get("max_combo", 0) >= 10,
        "combo_50": user.get("max_combo", 0) >= 50,
        "all_lures": len(user.get("unlocked_lures", [])) >= 3,
    }
    
    for ach_id, condition in checks.items():
        if condition and ach_id not in current_achievements:
            # Unlock achievement
            ach_data = next((a for a in ACHIEVEMENTS if a["id"] == ach_id), None)
            if ach_data:
                newly_unlocked.append(ach_data)
                current_achievements.append(ach_id)
                
                # Award achievement rewards
                if "gems" in ach_data:
                    await db.users.update_one({"id": user_id}, {"$inc": {"gems": ach_data["gems"]}})
    
    if newly_unlocked:
        await db.users.update_one(
            {"id": user_id},
            {"$set": {"achievements": current_achievements}}
        )
    
    return {
        "newly_unlocked": newly_unlocked,
        "total_unlocked": len(current_achievements)
    }
