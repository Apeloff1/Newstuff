# ========== GO FISH! DAILY REWARDS & SEASON PASS API ==========
# Login bonuses, season pass progression, and recurring rewards

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
import os

router = APIRouter(prefix="/api/rewards", tags=["rewards"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ========== DAILY REWARD CONFIGURATION ==========

DAILY_REWARDS = [
    {"day": 1, "type": "coins", "amount": 100, "premium_amount": 200},
    {"day": 2, "type": "energy", "amount": 20, "premium_amount": 50},
    {"day": 3, "type": "coins", "amount": 200, "premium_amount": 400},
    {"day": 4, "type": "bait", "amount": 5, "premium_amount": 15},
    {"day": 5, "type": "coins", "amount": 300, "premium_amount": 600},
    {"day": 6, "type": "gems", "amount": 10, "premium_amount": 25},
    {"day": 7, "type": "mystery_box", "amount": 1, "premium_amount": 2},  # Weekly milestone
    {"day": 8, "type": "coins", "amount": 150, "premium_amount": 300},
    {"day": 9, "type": "energy", "amount": 30, "premium_amount": 60},
    {"day": 10, "type": "coins", "amount": 250, "premium_amount": 500},
    {"day": 11, "type": "bait", "amount": 10, "premium_amount": 25},
    {"day": 12, "type": "coins", "amount": 350, "premium_amount": 700},
    {"day": 13, "type": "gems", "amount": 15, "premium_amount": 40},
    {"day": 14, "type": "lucky_ticket", "amount": 1, "premium_amount": 3},  # 2-week milestone
    {"day": 15, "type": "coins", "amount": 200, "premium_amount": 400},
    {"day": 16, "type": "energy", "amount": 40, "premium_amount": 80},
    {"day": 17, "type": "coins", "amount": 300, "premium_amount": 600},
    {"day": 18, "type": "bait", "amount": 15, "premium_amount": 35},
    {"day": 19, "type": "coins", "amount": 400, "premium_amount": 800},
    {"day": 20, "type": "gems", "amount": 20, "premium_amount": 50},
    {"day": 21, "type": "rare_lure", "amount": 1, "premium_amount": 1},  # 3-week milestone
    {"day": 22, "type": "coins", "amount": 250, "premium_amount": 500},
    {"day": 23, "type": "energy", "amount": 50, "premium_amount": 100},
    {"day": 24, "type": "coins", "amount": 350, "premium_amount": 700},
    {"day": 25, "type": "bait", "amount": 20, "premium_amount": 50},
    {"day": 26, "type": "coins", "amount": 450, "premium_amount": 900},
    {"day": 27, "type": "gems", "amount": 30, "premium_amount": 75},
    {"day": 28, "type": "legendary_box", "amount": 1, "premium_amount": 2},  # Monthly milestone
    {"day": 29, "type": "coins", "amount": 500, "premium_amount": 1000},
    {"day": 30, "type": "premium_currency", "amount": 50, "premium_amount": 150},
]

MILESTONE_REWARDS = {
    7: {"name": "Weekly Warrior", "coins": 500, "gems": 25},
    14: {"name": "Dedicated Fisher", "coins": 1000, "gems": 50, "lure": "silver_spoon"},
    21: {"name": "True Angler", "coins": 2000, "gems": 100, "rod_upgrade": True},
    28: {"name": "Fishing Legend", "coins": 5000, "gems": 200, "exclusive_cosmetic": "golden_badge"},
}


# ========== SEASON PASS CONFIGURATION ==========

def generate_season_pass_tiers(max_level: int = 50):
    """Generate season pass tier rewards"""
    tiers = []
    for level in range(1, max_level + 1):
        xp_required = level * 100 + (level - 1) * 50
        
        # Free rewards (every level)
        free_reward = None
        if level % 5 == 0:
            free_reward = {"type": "mystery_box", "amount": 1}
        elif level % 3 == 0:
            free_reward = {"type": "bait", "amount": 5}
        else:
            free_reward = {"type": "coins", "amount": level * 50}
        
        # Premium rewards (better rewards)
        premium_reward = None
        if level == 50:
            premium_reward = {"type": "legendary_rod", "item_id": "season_rod", "exclusive": True}
        elif level % 10 == 0:
            premium_reward = {"type": "exclusive_cosmetic", "item_id": f"season_cosmetic_{level}"}
        elif level % 5 == 0:
            premium_reward = {"type": "gems", "amount": 50 + level}
        else:
            premium_reward = {"type": "coins", "amount": level * 100}
        
        tiers.append({
            "level": level,
            "required_xp": xp_required,
            "free_reward": free_reward,
            "premium_reward": premium_reward
        })
    
    return tiers


# ========== REQUEST MODELS ==========

class ClaimDailyRewardRequest(BaseModel):
    user_id: str


class ClaimSeasonRewardRequest(BaseModel):
    user_id: str
    season_pass_id: str
    level: int
    is_premium: bool


class PurchaseSeasonPassRequest(BaseModel):
    user_id: str
    season_pass_id: str


class AddSeasonXPRequest(BaseModel):
    user_id: str
    xp_amount: int


# ========== DAILY REWARDS ENDPOINTS ==========

@router.get("/daily/status/{user_id}")
async def get_daily_reward_status(user_id: str):
    """Get user's daily reward status"""
    player_rewards = await db.player_daily_rewards.find_one({"user_id": user_id}, {"_id": 0})
    
    if not player_rewards:
        player_rewards = {
            "user_id": user_id,
            "current_streak": 0,
            "max_streak": 0,
            "total_logins": 0,
            "last_login_date": None,
            "claimed_days": [],
            "milestone_claimed": [],
            "is_premium": False
        }
        await db.player_daily_rewards.insert_one(player_rewards)
    
    # Check if can claim today
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    can_claim = player_rewards.get("last_login_date") != today
    
    # Get next reward
    current_day = (player_rewards.get("current_streak", 0) % 30) + 1
    next_reward = DAILY_REWARDS[current_day - 1] if current_day <= len(DAILY_REWARDS) else DAILY_REWARDS[0]
    
    return {
        "status": player_rewards,
        "can_claim": can_claim,
        "current_day": current_day,
        "next_reward": next_reward,
        "all_rewards": DAILY_REWARDS,
        "milestones": MILESTONE_REWARDS
    }


@router.post("/daily/claim")
async def claim_daily_reward(request: ClaimDailyRewardRequest):
    """Claim today's daily reward"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    yesterday = (datetime.now(timezone.utc) - timedelta(days=1)).strftime("%Y-%m-%d")
    
    player_rewards = await db.player_daily_rewards.find_one({"user_id": request.user_id}, {"_id": 0})
    
    if not player_rewards:
        player_rewards = {
            "user_id": request.user_id,
            "current_streak": 0,
            "max_streak": 0,
            "total_logins": 0,
            "last_login_date": None,
            "claimed_days": [],
            "milestone_claimed": [],
            "is_premium": False
        }
    
    # Check if already claimed today
    if player_rewards.get("last_login_date") == today:
        raise HTTPException(status_code=400, detail="Already claimed today's reward")
    
    # Calculate streak
    last_login = player_rewards.get("last_login_date")
    if last_login == yesterday:
        new_streak = player_rewards.get("current_streak", 0) + 1
    else:
        new_streak = 1  # Reset streak
    
    # Get reward
    current_day = ((new_streak - 1) % 30) + 1
    reward_config = DAILY_REWARDS[current_day - 1]
    
    is_premium = player_rewards.get("is_premium", False)
    reward_amount = reward_config.get("premium_amount" if is_premium else "amount", reward_config["amount"])
    reward_type = reward_config["type"]
    
    # Apply reward
    rewards_given = {"type": reward_type, "amount": reward_amount}
    
    if reward_type == "coins":
        await db.users.update_one({"id": request.user_id}, {"$inc": {"score": reward_amount}})
    elif reward_type == "gems":
        await db.users.update_one({"id": request.user_id}, {"$inc": {"gems": reward_amount}})
    elif reward_type == "energy":
        await db.player_energy.update_one(
            {"user_id": request.user_id},
            {"$inc": {"current_energy": reward_amount}},
            upsert=True
        )
    elif reward_type == "bait":
        await db.player_bait.update_one(
            {"user_id": request.user_id},
            {"$inc": {"baits.common_bait": reward_amount}},
            upsert=True
        )
    elif reward_type in ["mystery_box", "legendary_box", "lucky_ticket"]:
        await db.player_items.update_one(
            {"user_id": request.user_id},
            {"$inc": {f"items.{reward_type}": reward_amount}},
            upsert=True
        )
    
    # Check for milestone rewards
    milestone_reward = None
    if new_streak in MILESTONE_REWARDS and new_streak not in player_rewards.get("milestone_claimed", []):
        milestone = MILESTONE_REWARDS[new_streak]
        milestone_reward = milestone
        
        if "coins" in milestone:
            await db.users.update_one({"id": request.user_id}, {"$inc": {"score": milestone["coins"]}})
        if "gems" in milestone:
            await db.users.update_one({"id": request.user_id}, {"$inc": {"gems": milestone["gems"]}})
        
        await db.player_daily_rewards.update_one(
            {"user_id": request.user_id},
            {"$push": {"milestone_claimed": new_streak}}
        )
    
    # Update player rewards
    await db.player_daily_rewards.update_one(
        {"user_id": request.user_id},
        {
            "$set": {
                "current_streak": new_streak,
                "last_login_date": today
            },
            "$max": {"max_streak": new_streak},
            "$inc": {"total_logins": 1},
            "$push": {"claimed_days": today}
        },
        upsert=True
    )
    
    return {
        "success": True,
        "streak": new_streak,
        "day": current_day,
        "reward": rewards_given,
        "milestone_reward": milestone_reward
    }


# ========== SEASON PASS ENDPOINTS ==========

@router.get("/season/current")
async def get_current_season_pass():
    """Get current active season pass"""
    now = datetime.now(timezone.utc).isoformat()
    season_pass = await db.season_passes.find_one({
        "status": "active",
        "start_date": {"$lte": now},
        "end_date": {"$gte": now}
    }, {"_id": 0})
    
    if not season_pass:
        # Create default season pass if none exists
        season_number = 1
        last_season = await db.season_passes.find_one({}, {"_id": 0}, sort=[("season", -1)])
        if last_season:
            season_number = last_season.get("season", 0) + 1
        
        now_dt = datetime.now(timezone.utc)
        end_date = now_dt + timedelta(days=30)
        
        season_pass = {
            "id": str(uuid.uuid4()),
            "name": f"Season {season_number}: Ocean Explorer",
            "season": season_number,
            "theme": "ocean",
            "start_date": now_dt.isoformat(),
            "end_date": end_date.isoformat(),
            "max_level": 50,
            "tiers": generate_season_pass_tiers(50),
            "bonus_challenges": [
                {"id": "catch_100", "description": "Catch 100 fish", "target": 100, "xp_reward": 500},
                {"id": "perfect_20", "description": "Get 20 perfect catches", "target": 20, "xp_reward": 300},
                {"id": "rare_10", "description": "Catch 10 rare fish", "target": 10, "xp_reward": 750},
            ],
            "premium_price": 9.99,
            "status": "active"
        }
        await db.season_passes.insert_one(season_pass)
    
    # Calculate time remaining
    end_date = datetime.fromisoformat(season_pass["end_date"].replace("Z", "+00:00"))
    time_remaining = end_date - datetime.now(timezone.utc)
    season_pass["days_remaining"] = max(0, time_remaining.days)
    season_pass["hours_remaining"] = max(0, time_remaining.seconds // 3600)
    
    return season_pass


@router.get("/season/{season_pass_id}/progress/{user_id}")
async def get_season_progress(season_pass_id: str, user_id: str):
    """Get user's season pass progress"""
    progress = await db.player_season_pass.find_one({
        "user_id": user_id,
        "season_pass_id": season_pass_id
    }, {"_id": 0})
    
    if not progress:
        progress = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "season_pass_id": season_pass_id,
            "current_level": 1,
            "current_xp": 0,
            "is_premium": False,
            "claimed_free_rewards": [],
            "claimed_premium_rewards": [],
            "bonus_challenges_completed": [],
            "purchased_at": None
        }
        await db.player_season_pass.insert_one(progress)
    
    # Get season pass details
    season_pass = await db.season_passes.find_one({"id": season_pass_id}, {"_id": 0})
    
    # Calculate XP to next level
    if season_pass and progress["current_level"] < season_pass["max_level"]:
        current_tier = season_pass["tiers"][progress["current_level"] - 1]
        xp_to_next = current_tier["required_xp"] - progress["current_xp"]
        progress["xp_to_next_level"] = max(0, xp_to_next)
        progress["xp_required"] = current_tier["required_xp"]
    else:
        progress["xp_to_next_level"] = 0
        progress["xp_required"] = 0
    
    return {"progress": progress, "season_pass": season_pass}


@router.post("/season/add-xp")
async def add_season_xp(request: AddSeasonXPRequest):
    """Add XP to season pass (called after catching fish, etc.)"""
    # Get current season
    now = datetime.now(timezone.utc).isoformat()
    season_pass = await db.season_passes.find_one({
        "status": "active",
        "start_date": {"$lte": now},
        "end_date": {"$gte": now}
    }, {"_id": 0})
    
    if not season_pass:
        return {"success": False, "message": "No active season"}
    
    # Get or create progress
    progress = await db.player_season_pass.find_one({
        "user_id": request.user_id,
        "season_pass_id": season_pass["id"]
    }, {"_id": 0})
    
    if not progress:
        progress = {
            "id": str(uuid.uuid4()),
            "user_id": request.user_id,
            "season_pass_id": season_pass["id"],
            "current_level": 1,
            "current_xp": 0,
            "is_premium": False,
            "claimed_free_rewards": [],
            "claimed_premium_rewards": [],
            "bonus_challenges_completed": []
        }
        await db.player_season_pass.insert_one(progress)
    
    if progress["current_level"] >= season_pass["max_level"]:
        return {"success": True, "message": "Already at max level", "level": progress["current_level"]}
    
    # Add XP and check for level ups
    new_xp = progress["current_xp"] + request.xp_amount
    new_level = progress["current_level"]
    levels_gained = 0
    
    while new_level < season_pass["max_level"]:
        tier = season_pass["tiers"][new_level - 1]
        if new_xp >= tier["required_xp"]:
            new_xp -= tier["required_xp"]
            new_level += 1
            levels_gained += 1
        else:
            break
    
    # Update progress
    await db.player_season_pass.update_one(
        {"user_id": request.user_id, "season_pass_id": season_pass["id"]},
        {"$set": {"current_xp": new_xp, "current_level": new_level}}
    )
    
    return {
        "success": True,
        "xp_added": request.xp_amount,
        "new_level": new_level,
        "current_xp": new_xp,
        "levels_gained": levels_gained
    }


@router.post("/season/claim")
async def claim_season_reward(request: ClaimSeasonRewardRequest):
    """Claim a season pass reward"""
    progress = await db.player_season_pass.find_one({
        "user_id": request.user_id,
        "season_pass_id": request.season_pass_id
    }, {"_id": 0})
    
    if not progress:
        raise HTTPException(status_code=404, detail="Season pass progress not found")
    
    if request.level > progress["current_level"]:
        raise HTTPException(status_code=400, detail="Level not reached yet")
    
    # Check if premium reward and user has premium
    if request.is_premium and not progress["is_premium"]:
        raise HTTPException(status_code=400, detail="Premium pass required")
    
    # Check if already claimed
    claimed_list = "claimed_premium_rewards" if request.is_premium else "claimed_free_rewards"
    if request.level in progress.get(claimed_list, []):
        raise HTTPException(status_code=400, detail="Reward already claimed")
    
    # Get season pass to find reward
    season_pass = await db.season_passes.find_one({"id": request.season_pass_id}, {"_id": 0})
    if not season_pass:
        raise HTTPException(status_code=404, detail="Season pass not found")
    
    tier = season_pass["tiers"][request.level - 1]
    reward = tier.get("premium_reward" if request.is_premium else "free_reward")
    
    if not reward:
        raise HTTPException(status_code=400, detail="No reward at this level")
    
    # Apply reward
    reward_type = reward.get("type")
    reward_amount = reward.get("amount", 1)
    
    if reward_type == "coins":
        await db.users.update_one({"id": request.user_id}, {"$inc": {"score": reward_amount}})
    elif reward_type == "gems":
        await db.users.update_one({"id": request.user_id}, {"$inc": {"gems": reward_amount}})
    elif reward_type == "mystery_box":
        await db.player_items.update_one(
            {"user_id": request.user_id},
            {"$inc": {"items.mystery_box": reward_amount}},
            upsert=True
        )
    elif reward_type == "bait":
        await db.player_bait.update_one(
            {"user_id": request.user_id},
            {"$inc": {"baits.common_bait": reward_amount}},
            upsert=True
        )
    elif reward_type in ["exclusive_cosmetic", "legendary_rod"]:
        await db.player_items.update_one(
            {"user_id": request.user_id},
            {"$push": {"unlocked_items": reward.get("item_id", f"season_{request.level}")}},
            upsert=True
        )
    
    # Mark as claimed
    await db.player_season_pass.update_one(
        {"user_id": request.user_id, "season_pass_id": request.season_pass_id},
        {"$push": {claimed_list: request.level}}
    )
    
    return {"success": True, "reward": reward}


@router.post("/season/purchase")
async def purchase_season_pass(request: PurchaseSeasonPassRequest):
    """Purchase premium season pass"""
    season_pass = await db.season_passes.find_one({"id": request.season_pass_id}, {"_id": 0})
    if not season_pass:
        raise HTTPException(status_code=404, detail="Season pass not found")
    
    # In production, this would integrate with payment processing
    # For now, simulate purchase
    
    await db.player_season_pass.update_one(
        {"user_id": request.user_id, "season_pass_id": request.season_pass_id},
        {
            "$set": {
                "is_premium": True,
                "purchased_at": datetime.now(timezone.utc).isoformat()
            }
        },
        upsert=True
    )
    
    # Record purchase
    purchase = {
        "id": str(uuid.uuid4()),
        "user_id": request.user_id,
        "item_type": "season_pass",
        "item_id": request.season_pass_id,
        "item_name": season_pass["name"],
        "quantity": 1,
        "price": season_pass["premium_price"],
        "currency": "usd",
        "payment_method": "iap",
        "purchased_at": datetime.now(timezone.utc).isoformat()
    }
    await db.purchases.insert_one(purchase)
    
    return {"success": True, "message": "Season pass activated!"}


# ========== LUCKY WHEEL ==========

@router.get("/wheel/config")
async def get_wheel_config():
    """Get lucky wheel configuration"""
    wheel = {
        "id": "daily_wheel",
        "name": "Daily Lucky Wheel",
        "slots": [
            {"slot_id": 0, "type": "coins", "amount": 50, "probability": 0.25, "rarity": "common"},
            {"slot_id": 1, "type": "coins", "amount": 100, "probability": 0.20, "rarity": "common"},
            {"slot_id": 2, "type": "coins", "amount": 200, "probability": 0.15, "rarity": "uncommon"},
            {"slot_id": 3, "type": "energy", "amount": 20, "probability": 0.15, "rarity": "uncommon"},
            {"slot_id": 4, "type": "bait", "amount": 5, "probability": 0.10, "rarity": "rare"},
            {"slot_id": 5, "type": "gems", "amount": 10, "probability": 0.08, "rarity": "rare"},
            {"slot_id": 6, "type": "gems", "amount": 25, "probability": 0.04, "rarity": "epic"},
            {"slot_id": 7, "type": "mystery_box", "amount": 1, "probability": 0.02, "rarity": "epic"},
            {"slot_id": 8, "type": "legendary_box", "amount": 1, "probability": 0.01, "rarity": "legendary"},
        ],
        "free_spins_per_day": 1,
        "ad_spins_per_day": 3,
        "gem_spin_cost": 50
    }
    return wheel


@router.get("/wheel/status/{user_id}")
async def get_wheel_status(user_id: str):
    """Get user's wheel spin status"""
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    
    status = await db.player_wheel_status.find_one({"user_id": user_id}, {"_id": 0})
    
    if not status or status.get("date") != today:
        status = {
            "user_id": user_id,
            "date": today,
            "free_spins_remaining": 1,
            "ad_spins_remaining": 3,
            "total_spins_today": 0
        }
        await db.player_wheel_status.update_one(
            {"user_id": user_id},
            {"$set": status},
            upsert=True
        )
    
    return status


@router.post("/wheel/spin/{user_id}")
async def spin_wheel(user_id: str, spin_type: str = "free"):
    """Spin the lucky wheel"""
    import random
    
    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    status = await db.player_wheel_status.find_one({"user_id": user_id}, {"_id": 0})
    
    if not status or status.get("date") != today:
        status = {
            "user_id": user_id,
            "date": today,
            "free_spins_remaining": 1,
            "ad_spins_remaining": 3,
            "total_spins_today": 0
        }
    
    # Check spin availability
    if spin_type == "free" and status["free_spins_remaining"] <= 0:
        raise HTTPException(status_code=400, detail="No free spins remaining")
    elif spin_type == "ad" and status["ad_spins_remaining"] <= 0:
        raise HTTPException(status_code=400, detail="No ad spins remaining")
    elif spin_type == "gem":
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user.get("gems", 0) < 50:
            raise HTTPException(status_code=400, detail="Insufficient gems")
        await db.users.update_one({"id": user_id}, {"$inc": {"gems": -50}})
    
    # Determine result based on probabilities
    wheel_config = await get_wheel_config()
    slots = wheel_config["slots"]
    
    rand = random.random()
    cumulative = 0
    won_slot = slots[0]
    
    for slot in slots:
        cumulative += slot["probability"]
        if rand <= cumulative:
            won_slot = slot
            break
    
    # Apply reward
    reward_type = won_slot["type"]
    reward_amount = won_slot["amount"]
    
    if reward_type == "coins":
        await db.users.update_one({"id": user_id}, {"$inc": {"score": reward_amount}})
    elif reward_type == "gems":
        await db.users.update_one({"id": user_id}, {"$inc": {"gems": reward_amount}})
    elif reward_type == "energy":
        await db.player_energy.update_one(
            {"user_id": user_id},
            {"$inc": {"current_energy": reward_amount}},
            upsert=True
        )
    elif reward_type == "bait":
        await db.player_bait.update_one(
            {"user_id": user_id},
            {"$inc": {"baits.common_bait": reward_amount}},
            upsert=True
        )
    elif reward_type in ["mystery_box", "legendary_box"]:
        await db.player_items.update_one(
            {"user_id": user_id},
            {"$inc": {f"items.{reward_type}": reward_amount}},
            upsert=True
        )
    
    # Update spin status
    update_fields = {"total_spins_today": status["total_spins_today"] + 1, "date": today}
    if spin_type == "free":
        update_fields["free_spins_remaining"] = status["free_spins_remaining"] - 1
    elif spin_type == "ad":
        update_fields["ad_spins_remaining"] = status["ad_spins_remaining"] - 1
    
    await db.player_wheel_status.update_one(
        {"user_id": user_id},
        {"$set": update_fields},
        upsert=True
    )
    
    # Record spin
    spin_record = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "wheel_id": "daily_wheel",
        "slot_won": won_slot["slot_id"],
        "reward_type": reward_type,
        "reward_amount": reward_amount,
        "rarity": won_slot["rarity"],
        "spin_type": spin_type,
        "spun_at": datetime.now(timezone.utc).isoformat()
    }
    await db.wheel_spins.insert_one(spin_record)
    
    return {
        "success": True,
        "result": {
            "slot": won_slot["slot_id"],
            "type": reward_type,
            "amount": reward_amount,
            "rarity": won_slot["rarity"]
        },
        "spins_remaining": {
            "free": update_fields.get("free_spins_remaining", status["free_spins_remaining"]),
            "ad": update_fields.get("ad_spins_remaining", status["ad_spins_remaining"])
        }
    }
