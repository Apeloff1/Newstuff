# ========== GO FISH! TOURNAMENT SYSTEM API ==========
# Competitive fishing tournaments with rewards and rankings

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
import os

router = APIRouter(prefix="/api/tournaments", tags=["tournaments"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ========== REQUEST/RESPONSE MODELS ==========

class CreateTournamentRequest(BaseModel):
    name: str
    description: str
    tournament_type: str = "daily"
    duration_hours: int = 24
    entry_fee: int = 0
    entry_currency: str = "coins"
    max_participants: int = 1000
    fish_requirements: List[str] = Field(default_factory=list)
    stage_requirements: List[int] = Field(default_factory=list)


class JoinTournamentRequest(BaseModel):
    user_id: str
    username: str


class UpdateScoreRequest(BaseModel):
    user_id: str
    score_delta: int
    fish_caught: int = 0
    biggest_fish: int = 0
    perfect_catches: int = 0
    combo_max: int = 0


class TournamentRewardTier(BaseModel):
    rank_min: int
    rank_max: int
    rewards: Dict[str, Any]
    trophy_type: str = "bronze"


# ========== TOURNAMENT CRUD ENDPOINTS ==========

@router.post("/create")
async def create_tournament(request: CreateTournamentRequest):
    """Create a new tournament"""
    now = datetime.now(timezone.utc)
    end_time = now + timedelta(hours=request.duration_hours)
    
    # Default reward tiers
    reward_tiers = [
        {"rank_min": 1, "rank_max": 1, "rewards": {"coins": 10000, "gems": 100, "trophy": "gold"}, "trophy_type": "gold"},
        {"rank_min": 2, "rank_max": 3, "rewards": {"coins": 5000, "gems": 50, "trophy": "silver"}, "trophy_type": "silver"},
        {"rank_min": 4, "rank_max": 10, "rewards": {"coins": 2500, "gems": 25, "trophy": "bronze"}, "trophy_type": "bronze"},
        {"rank_min": 11, "rank_max": 50, "rewards": {"coins": 1000, "gems": 10}, "trophy_type": "participation"},
        {"rank_min": 51, "rank_max": 100, "rewards": {"coins": 500}, "trophy_type": "participation"},
    ]
    
    tournament = {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "description": request.description,
        "tournament_type": request.tournament_type,
        "start_time": now.isoformat(),
        "end_time": end_time.isoformat(),
        "entry_fee": request.entry_fee,
        "entry_currency": request.entry_currency,
        "max_participants": request.max_participants,
        "current_participants": 0,
        "status": "active",
        "rules": {
            "min_casts": 10,
            "scoring": "total_score",
            "tiebreaker": "biggest_fish"
        },
        "reward_tiers": reward_tiers,
        "leaderboard": [],
        "stage_requirements": request.stage_requirements,
        "fish_requirements": request.fish_requirements,
        "created_at": now.isoformat()
    }
    
    await db.tournaments.insert_one(tournament)
    return {"success": True, "tournament_id": tournament["id"], "tournament": {k: v for k, v in tournament.items() if k != "_id"}}


@router.get("/active")
async def get_active_tournaments():
    """Get all active tournaments"""
    now = datetime.now(timezone.utc).isoformat()
    tournaments = await db.tournaments.find({
        "status": "active",
        "end_time": {"$gt": now}
    }, {"_id": 0}).to_list(100)
    
    return {"tournaments": tournaments}


@router.get("/{tournament_id}")
async def get_tournament(tournament_id: str):
    """Get tournament details"""
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return tournament


@router.get("/{tournament_id}/leaderboard")
async def get_tournament_leaderboard(tournament_id: str, limit: int = 100):
    """Get tournament leaderboard"""
    entries = await db.tournament_entries.find(
        {"tournament_id": tournament_id},
        {"_id": 0}
    ).sort("score", -1).limit(limit).to_list(limit)
    
    # Add ranks
    for i, entry in enumerate(entries):
        entry["rank"] = i + 1
    
    return {"leaderboard": entries}


# ========== TOURNAMENT PARTICIPATION ==========

@router.post("/{tournament_id}/join")
async def join_tournament(tournament_id: str, request: JoinTournamentRequest):
    """Join a tournament"""
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament["status"] != "active":
        raise HTTPException(status_code=400, detail="Tournament is not active")
    
    if tournament["current_participants"] >= tournament["max_participants"]:
        raise HTTPException(status_code=400, detail="Tournament is full")
    
    # Check if already joined
    existing = await db.tournament_entries.find_one({
        "tournament_id": tournament_id,
        "user_id": request.user_id
    })
    if existing:
        raise HTTPException(status_code=400, detail="Already joined this tournament")
    
    # Deduct entry fee if applicable
    if tournament["entry_fee"] > 0:
        user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        currency_field = "coins" if tournament["entry_currency"] == "coins" else "gems"
        if user.get(currency_field, 0) < tournament["entry_fee"]:
            raise HTTPException(status_code=400, detail=f"Insufficient {tournament['entry_currency']}")
        
        await db.users.update_one(
            {"id": request.user_id},
            {"$inc": {currency_field: -tournament["entry_fee"]}}
        )
    
    # Create entry
    entry = {
        "id": str(uuid.uuid4()),
        "tournament_id": tournament_id,
        "user_id": request.user_id,
        "username": request.username,
        "score": 0,
        "fish_caught": 0,
        "biggest_fish": 0,
        "perfect_catches": 0,
        "combo_max": 0,
        "joined_at": datetime.now(timezone.utc).isoformat(),
        "last_updated": datetime.now(timezone.utc).isoformat()
    }
    
    await db.tournament_entries.insert_one(entry)
    
    # Update participant count
    await db.tournaments.update_one(
        {"id": tournament_id},
        {"$inc": {"current_participants": 1}}
    )
    
    return {"success": True, "entry": {k: v for k, v in entry.items() if k != "_id"}}


@router.post("/{tournament_id}/update-score")
async def update_tournament_score(tournament_id: str, request: UpdateScoreRequest):
    """Update player's tournament score"""
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament["status"] != "active":
        raise HTTPException(status_code=400, detail="Tournament is not active")
    
    # Check tournament hasn't ended
    if datetime.fromisoformat(tournament["end_time"]) < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Tournament has ended")
    
    entry = await db.tournament_entries.find_one({
        "tournament_id": tournament_id,
        "user_id": request.user_id
    })
    
    if not entry:
        raise HTTPException(status_code=404, detail="Not participating in this tournament")
    
    # Update entry
    update_data = {
        "$inc": {
            "score": request.score_delta,
            "fish_caught": request.fish_caught,
            "perfect_catches": request.perfect_catches
        },
        "$max": {
            "biggest_fish": request.biggest_fish,
            "combo_max": request.combo_max
        },
        "$set": {
            "last_updated": datetime.now(timezone.utc).isoformat()
        }
    }
    
    await db.tournament_entries.update_one(
        {"id": entry["id"]},
        update_data
    )
    
    # Get updated entry with rank
    updated_entry = await db.tournament_entries.find_one({"id": entry["id"]}, {"_id": 0})
    rank_count = await db.tournament_entries.count_documents({
        "tournament_id": tournament_id,
        "score": {"$gt": updated_entry["score"]}
    })
    updated_entry["rank"] = rank_count + 1
    
    return {"success": True, "entry": updated_entry}


@router.get("/{tournament_id}/my-entry/{user_id}")
async def get_my_tournament_entry(tournament_id: str, user_id: str):
    """Get player's tournament entry with rank"""
    entry = await db.tournament_entries.find_one({
        "tournament_id": tournament_id,
        "user_id": user_id
    }, {"_id": 0})
    
    if not entry:
        return {"joined": False}
    
    # Calculate rank
    rank_count = await db.tournament_entries.count_documents({
        "tournament_id": tournament_id,
        "score": {"$gt": entry["score"]}
    })
    entry["rank"] = rank_count + 1
    
    total = await db.tournament_entries.count_documents({"tournament_id": tournament_id})
    entry["total_participants"] = total
    
    return {"joined": True, "entry": entry}


# ========== TOURNAMENT COMPLETION ==========

@router.post("/{tournament_id}/finalize")
async def finalize_tournament(tournament_id: str):
    """Finalize tournament and distribute rewards"""
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    if tournament["status"] == "ended":
        raise HTTPException(status_code=400, detail="Tournament already finalized")
    
    # Get final leaderboard
    entries = await db.tournament_entries.find(
        {"tournament_id": tournament_id},
        {"_id": 0}
    ).sort([("score", -1), ("biggest_fish", -1)]).to_list(None)
    
    # Create results and assign rewards
    results = []
    for rank, entry in enumerate(entries, 1):
        # Find applicable reward tier
        reward = {}
        trophy = "participation"
        for tier in tournament["reward_tiers"]:
            if tier["rank_min"] <= rank <= tier["rank_max"]:
                reward = tier["rewards"]
                trophy = tier.get("trophy_type", "participation")
                break
        
        result = {
            "tournament_id": tournament_id,
            "user_id": entry["user_id"],
            "username": entry["username"],
            "final_rank": rank,
            "final_score": entry["score"],
            "rewards_claimed": False,
            "rewards": reward,
            "trophy": trophy
        }
        results.append(result)
        
        # Award rewards to user
        if reward:
            update_ops = {}
            if "coins" in reward:
                update_ops["$inc"] = update_ops.get("$inc", {})
                update_ops["$inc"]["coins"] = reward["coins"]
            if "gems" in reward:
                update_ops["$inc"] = update_ops.get("$inc", {})
                update_ops["$inc"]["gems"] = reward["gems"]
            
            if update_ops:
                await db.users.update_one({"id": entry["user_id"]}, update_ops)
    
    # Save results
    if results:
        await db.tournament_results.insert_many(results)
    
    # Update tournament status
    await db.tournaments.update_one(
        {"id": tournament_id},
        {"$set": {"status": "ended", "final_leaderboard": entries[:100]}}
    )
    
    return {"success": True, "results_count": len(results)}


@router.get("/{tournament_id}/results/{user_id}")
async def get_tournament_results(tournament_id: str, user_id: str):
    """Get player's tournament results"""
    result = await db.tournament_results.find_one({
        "tournament_id": tournament_id,
        "user_id": user_id
    }, {"_id": 0})
    
    if not result:
        return {"participated": False}
    
    return {"participated": True, "result": result}


# ========== SCHEDULED TOURNAMENTS ==========

@router.get("/scheduled/upcoming")
async def get_upcoming_tournaments():
    """Get scheduled upcoming tournaments"""
    now = datetime.now(timezone.utc).isoformat()
    tournaments = await db.tournaments.find({
        "status": "upcoming",
        "start_time": {"$gt": now}
    }, {"_id": 0}).sort("start_time", 1).limit(10).to_list(10)
    
    return {"tournaments": tournaments}


@router.post("/schedule")
async def schedule_tournament(
    name: str,
    description: str,
    tournament_type: str,
    start_hours_from_now: int,
    duration_hours: int = 24,
    entry_fee: int = 0
):
    """Schedule a future tournament"""
    now = datetime.now(timezone.utc)
    start_time = now + timedelta(hours=start_hours_from_now)
    end_time = start_time + timedelta(hours=duration_hours)
    
    tournament = {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "tournament_type": tournament_type,
        "start_time": start_time.isoformat(),
        "end_time": end_time.isoformat(),
        "entry_fee": entry_fee,
        "entry_currency": "coins",
        "max_participants": 1000,
        "current_participants": 0,
        "status": "upcoming",
        "rules": {"min_casts": 10, "scoring": "total_score"},
        "reward_tiers": [
            {"rank_min": 1, "rank_max": 1, "rewards": {"coins": 10000, "gems": 100}, "trophy_type": "gold"},
            {"rank_min": 2, "rank_max": 3, "rewards": {"coins": 5000, "gems": 50}, "trophy_type": "silver"},
            {"rank_min": 4, "rank_max": 10, "rewards": {"coins": 2500, "gems": 25}, "trophy_type": "bronze"},
        ],
        "leaderboard": [],
        "created_at": now.isoformat()
    }
    
    await db.tournaments.insert_one(tournament)
    return {"success": True, "tournament": {k: v for k, v in tournament.items() if k != "_id"}}


# ========== TOURNAMENT HISTORY ==========

@router.get("/history/{user_id}")
async def get_player_tournament_history(user_id: str, limit: int = 20):
    """Get player's tournament participation history"""
    results = await db.tournament_results.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("tournament_id", -1).limit(limit).to_list(limit)
    
    # Enrich with tournament details
    for result in results:
        tournament = await db.tournaments.find_one(
            {"id": result["tournament_id"]},
            {"_id": 0, "name": 1, "tournament_type": 1, "end_time": 1}
        )
        if tournament:
            result["tournament_name"] = tournament.get("name", "Unknown")
            result["tournament_type"] = tournament.get("tournament_type", "unknown")
            result["ended_at"] = tournament.get("end_time")
    
    # Calculate stats
    total_wins = sum(1 for r in results if r["final_rank"] == 1)
    top_10_finishes = sum(1 for r in results if r["final_rank"] <= 10)
    total_rewards = sum(r["rewards"].get("coins", 0) for r in results)
    
    return {
        "history": results,
        "stats": {
            "total_tournaments": len(results),
            "wins": total_wins,
            "top_10_finishes": top_10_finishes,
            "total_coins_won": total_rewards
        }
    }


# ========== AUTO-CREATE DAILY TOURNAMENTS ==========

async def create_daily_tournaments():
    """Create daily tournaments (called by scheduler)"""
    now = datetime.now(timezone.utc)
    today = now.strftime("%Y-%m-%d")
    
    # Check if daily tournaments exist for today
    existing = await db.tournaments.find_one({
        "tournament_type": "daily",
        "created_at": {"$gte": f"{today}T00:00:00"}
    })
    
    if existing:
        return {"message": "Daily tournaments already exist"}
    
    # Create free daily tournament
    free_tournament = {
        "id": str(uuid.uuid4()),
        "name": f"Daily Catch Challenge - {today}",
        "description": "Free daily tournament! Catch as many fish as you can in 24 hours.",
        "tournament_type": "daily",
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(hours=24)).isoformat(),
        "entry_fee": 0,
        "entry_currency": "coins",
        "max_participants": 10000,
        "current_participants": 0,
        "status": "active",
        "rules": {"min_casts": 5, "scoring": "total_score"},
        "reward_tiers": [
            {"rank_min": 1, "rank_max": 1, "rewards": {"coins": 5000, "gems": 50}, "trophy_type": "gold"},
            {"rank_min": 2, "rank_max": 5, "rewards": {"coins": 2000, "gems": 20}, "trophy_type": "silver"},
            {"rank_min": 6, "rank_max": 20, "rewards": {"coins": 1000, "gems": 10}, "trophy_type": "bronze"},
            {"rank_min": 21, "rank_max": 100, "rewards": {"coins": 500}, "trophy_type": "participation"},
        ],
        "leaderboard": [],
        "created_at": now.isoformat()
    }
    
    await db.tournaments.insert_one(free_tournament)
    
    # Create premium daily tournament
    premium_tournament = {
        "id": str(uuid.uuid4()),
        "name": f"Premium Fisher's Cup - {today}",
        "description": "High-stakes daily tournament with bigger prizes!",
        "tournament_type": "daily_premium",
        "start_time": now.isoformat(),
        "end_time": (now + timedelta(hours=24)).isoformat(),
        "entry_fee": 500,
        "entry_currency": "coins",
        "max_participants": 500,
        "current_participants": 0,
        "status": "active",
        "rules": {"min_casts": 10, "scoring": "total_score"},
        "reward_tiers": [
            {"rank_min": 1, "rank_max": 1, "rewards": {"coins": 25000, "gems": 200}, "trophy_type": "gold"},
            {"rank_min": 2, "rank_max": 3, "rewards": {"coins": 15000, "gems": 100}, "trophy_type": "silver"},
            {"rank_min": 4, "rank_max": 10, "rewards": {"coins": 7500, "gems": 50}, "trophy_type": "bronze"},
            {"rank_min": 11, "rank_max": 50, "rewards": {"coins": 3000, "gems": 20}, "trophy_type": "participation"},
        ],
        "leaderboard": [],
        "created_at": now.isoformat()
    }
    
    await db.tournaments.insert_one(premium_tournament)
    
    return {"message": "Daily tournaments created", "tournaments": [free_tournament["id"], premium_tournament["id"]]}


@router.post("/admin/create-daily")
async def admin_create_daily_tournaments():
    """Admin endpoint to manually create daily tournaments"""
    return await create_daily_tournaments()
