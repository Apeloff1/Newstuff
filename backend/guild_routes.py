# ========== GO FISH! GUILD/TEAM SYSTEM API ==========
# Social guild system with challenges, contributions, and perks

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
import os

router = APIRouter(prefix="/api/guilds", tags=["guilds"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ========== REQUEST/RESPONSE MODELS ==========

class CreateGuildRequest(BaseModel):
    name: str
    tag: str  # 3-5 characters
    description: str = ""
    icon: str = "🎣"
    banner_color: str = "#3B82F6"
    leader_id: str
    leader_username: str
    is_public: bool = True
    min_level: int = 1


class JoinGuildRequest(BaseModel):
    user_id: str
    username: str
    message: str = ""


class UpdateMemberRequest(BaseModel):
    target_user_id: str
    new_rank: Optional[str] = None
    action: Optional[str] = None  # promote, demote, kick


class ContributeRequest(BaseModel):
    user_id: str
    contribution_type: str  # coins, fish, points
    amount: int


class GuildChallengeRequest(BaseModel):
    challenger_user_id: str
    defender_guild_id: str
    challenge_type: str  # fish_count, total_score, biggest_fish
    target: int
    duration_hours: int = 24
    stake_coins: int = 0


class GuildChatRequest(BaseModel):
    user_id: str
    username: str
    message: str


# ========== GUILD RANKS CONFIGURATION ==========

DEFAULT_RANKS = [
    {"name": "leader", "permissions": ["all"], "required_contribution": 0},
    {"name": "co-leader", "permissions": ["invite", "kick_member", "accept_applications", "start_challenge"], "required_contribution": 5000},
    {"name": "elder", "permissions": ["invite", "accept_applications"], "required_contribution": 2000},
    {"name": "member", "permissions": ["chat", "contribute"], "required_contribution": 0},
]

GUILD_PERKS = {
    1: [],
    2: ["bonus_xp_5"],
    3: ["bonus_xp_5", "bonus_coins_5"],
    4: ["bonus_xp_10", "bonus_coins_5", "extra_energy_10"],
    5: ["bonus_xp_10", "bonus_coins_10", "extra_energy_10", "rare_fish_boost_5"],
    6: ["bonus_xp_15", "bonus_coins_10", "extra_energy_15", "rare_fish_boost_5"],
    7: ["bonus_xp_15", "bonus_coins_15", "extra_energy_15", "rare_fish_boost_10"],
    8: ["bonus_xp_20", "bonus_coins_15", "extra_energy_20", "rare_fish_boost_10", "exclusive_badge"],
    9: ["bonus_xp_20", "bonus_coins_20", "extra_energy_20", "rare_fish_boost_15", "exclusive_badge"],
    10: ["bonus_xp_25", "bonus_coins_25", "extra_energy_25", "rare_fish_boost_20", "exclusive_badge", "legendary_lure"],
}


# ========== GUILD CRUD ENDPOINTS ==========

@router.post("/create")
async def create_guild(request: CreateGuildRequest):
    """Create a new guild"""
    # Validate tag length
    if len(request.tag) < 3 or len(request.tag) > 5:
        raise HTTPException(status_code=400, detail="Tag must be 3-5 characters")
    
    # Check if user is already in a guild
    existing_membership = await db.guild_members.find_one({"user_id": request.leader_id})
    if existing_membership:
        raise HTTPException(status_code=400, detail="Already in a guild")
    
    # Check if name or tag is taken
    existing_name = await db.guilds.find_one({"name": request.name})
    if existing_name:
        raise HTTPException(status_code=400, detail="Guild name already taken")
    
    existing_tag = await db.guilds.find_one({"tag": request.tag.upper()})
    if existing_tag:
        raise HTTPException(status_code=400, detail="Tag already taken")
    
    guild = {
        "id": str(uuid.uuid4()),
        "name": request.name,
        "tag": request.tag.upper(),
        "description": request.description,
        "icon": request.icon,
        "banner_color": request.banner_color,
        "leader_id": request.leader_id,
        "level": 1,
        "experience": 0,
        "max_members": 30,
        "member_count": 1,
        "ranks": DEFAULT_RANKS,
        "perks": GUILD_PERKS[1],
        "treasury": {"coins": 0, "gems": 0},
        "weekly_contribution": 0,
        "total_fish_caught": 0,
        "achievements": [],
        "settings": {
            "auto_accept": False,
            "min_level": request.min_level,
            "is_public": request.is_public
        },
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    # Create leader member entry
    leader_member = {
        "id": str(uuid.uuid4()),
        "guild_id": guild["id"],
        "user_id": request.leader_id,
        "username": request.leader_username,
        "rank": "leader",
        "contribution_points": 0,
        "fish_donated": 0,
        "joined_at": datetime.now(timezone.utc).isoformat(),
        "last_active": datetime.now(timezone.utc).isoformat()
    }
    
    await db.guilds.insert_one(guild)
    await db.guild_members.insert_one(leader_member)
    
    return {"success": True, "guild": {k: v for k, v in guild.items() if k != "_id"}}


@router.get("/search")
async def search_guilds(query: str = "", limit: int = 20):
    """Search for guilds"""
    if query:
        guilds = await db.guilds.find({
            "$or": [
                {"name": {"$regex": query, "$options": "i"}},
                {"tag": {"$regex": query, "$options": "i"}}
            ],
            "settings.is_public": True
        }, {"_id": 0}).limit(limit).to_list(limit)
    else:
        guilds = await db.guilds.find(
            {"settings.is_public": True},
            {"_id": 0}
        ).sort("level", -1).limit(limit).to_list(limit)
    
    return {"guilds": guilds}


@router.get("/{guild_id}")
async def get_guild(guild_id: str):
    """Get guild details"""
    guild = await db.guilds.find_one({"id": guild_id}, {"_id": 0})
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    # Get members
    members = await db.guild_members.find(
        {"guild_id": guild_id},
        {"_id": 0}
    ).sort("contribution_points", -1).to_list(100)
    
    guild["members"] = members
    return guild


@router.get("/user/{user_id}")
async def get_user_guild(user_id: str):
    """Get user's current guild"""
    membership = await db.guild_members.find_one({"user_id": user_id}, {"_id": 0})
    if not membership:
        return {"in_guild": False}
    
    guild = await db.guilds.find_one({"id": membership["guild_id"]}, {"_id": 0})
    return {"in_guild": True, "membership": membership, "guild": guild}


# ========== GUILD MEMBERSHIP ==========

@router.post("/{guild_id}/join")
async def join_guild(guild_id: str, request: JoinGuildRequest):
    """Request to join a guild"""
    guild = await db.guilds.find_one({"id": guild_id}, {"_id": 0})
    if not guild:
        raise HTTPException(status_code=404, detail="Guild not found")
    
    if guild["member_count"] >= guild["max_members"]:
        raise HTTPException(status_code=400, detail="Guild is full")
    
    # Check if already in a guild
    existing = await db.guild_members.find_one({"user_id": request.user_id})
    if existing:
        raise HTTPException(status_code=400, detail="Already in a guild")
    
    # Check pending application
    pending = await db.guild_applications.find_one({
        "guild_id": guild_id,
        "user_id": request.user_id,
        "status": "pending"
    })
    if pending:
        raise HTTPException(status_code=400, detail="Application already pending")
    
    # Auto-accept if enabled
    if guild["settings"].get("auto_accept", False):
        member = {
            "id": str(uuid.uuid4()),
            "guild_id": guild_id,
            "user_id": request.user_id,
            "username": request.username,
            "rank": "member",
            "contribution_points": 0,
            "fish_donated": 0,
            "joined_at": datetime.now(timezone.utc).isoformat(),
            "last_active": datetime.now(timezone.utc).isoformat()
        }
        await db.guild_members.insert_one(member)
        await db.guilds.update_one({"id": guild_id}, {"$inc": {"member_count": 1}})
        return {"success": True, "auto_accepted": True, "membership": {k: v for k, v in member.items() if k != "_id"}}
    
    # Create application
    application = {
        "id": str(uuid.uuid4()),
        "guild_id": guild_id,
        "user_id": request.user_id,
        "username": request.username,
        "message": request.message,
        "status": "pending",
        "applied_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.guild_applications.insert_one(application)
    return {"success": True, "auto_accepted": False, "application": {k: v for k, v in application.items() if k != "_id"}}


@router.get("/{guild_id}/applications")
async def get_guild_applications(guild_id: str):
    """Get pending guild applications"""
    applications = await db.guild_applications.find(
        {"guild_id": guild_id, "status": "pending"},
        {"_id": 0}
    ).to_list(100)
    return {"applications": applications}


@router.post("/{guild_id}/applications/{application_id}/accept")
async def accept_application(guild_id: str, application_id: str, approver_user_id: str):
    """Accept a guild application"""
    # Verify approver has permission
    approver = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": approver_user_id
    })
    if not approver or approver["rank"] not in ["leader", "co-leader", "elder"]:
        raise HTTPException(status_code=403, detail="No permission to accept applications")
    
    application = await db.guild_applications.find_one({
        "id": application_id,
        "guild_id": guild_id,
        "status": "pending"
    })
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check guild capacity
    guild = await db.guilds.find_one({"id": guild_id}, {"_id": 0})
    if guild["member_count"] >= guild["max_members"]:
        raise HTTPException(status_code=400, detail="Guild is full")
    
    # Create member
    member = {
        "id": str(uuid.uuid4()),
        "guild_id": guild_id,
        "user_id": application["user_id"],
        "username": application["username"],
        "rank": "member",
        "contribution_points": 0,
        "fish_donated": 0,
        "joined_at": datetime.now(timezone.utc).isoformat(),
        "last_active": datetime.now(timezone.utc).isoformat()
    }
    
    await db.guild_members.insert_one(member)
    await db.guild_applications.update_one(
        {"id": application_id},
        {"$set": {"status": "accepted"}}
    )
    await db.guilds.update_one({"id": guild_id}, {"$inc": {"member_count": 1}})
    
    return {"success": True, "new_member": {k: v for k, v in member.items() if k != "_id"}}


@router.post("/{guild_id}/applications/{application_id}/reject")
async def reject_application(guild_id: str, application_id: str, approver_user_id: str):
    """Reject a guild application"""
    approver = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": approver_user_id
    })
    if not approver or approver["rank"] not in ["leader", "co-leader", "elder"]:
        raise HTTPException(status_code=403, detail="No permission")
    
    await db.guild_applications.update_one(
        {"id": application_id, "guild_id": guild_id},
        {"$set": {"status": "rejected"}}
    )
    return {"success": True}


@router.post("/{guild_id}/leave")
async def leave_guild(guild_id: str, user_id: str):
    """Leave a guild"""
    membership = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": user_id
    })
    if not membership:
        raise HTTPException(status_code=404, detail="Not in this guild")
    
    guild = await db.guilds.find_one({"id": guild_id}, {"_id": 0})
    
    # Leader can't leave without transferring leadership
    if guild["leader_id"] == user_id:
        raise HTTPException(status_code=400, detail="Transfer leadership before leaving")
    
    await db.guild_members.delete_one({"guild_id": guild_id, "user_id": user_id})
    await db.guilds.update_one({"id": guild_id}, {"$inc": {"member_count": -1}})
    
    return {"success": True}


@router.post("/{guild_id}/kick")
async def kick_member(guild_id: str, request: UpdateMemberRequest, kicker_user_id: str):
    """Kick a member from the guild"""
    kicker = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": kicker_user_id
    })
    if not kicker or kicker["rank"] not in ["leader", "co-leader"]:
        raise HTTPException(status_code=403, detail="No permission to kick members")
    
    target = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": request.target_user_id
    })
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if target["rank"] == "leader":
        raise HTTPException(status_code=400, detail="Cannot kick the leader")
    
    await db.guild_members.delete_one({"guild_id": guild_id, "user_id": request.target_user_id})
    await db.guilds.update_one({"id": guild_id}, {"$inc": {"member_count": -1}})
    
    return {"success": True}


@router.post("/{guild_id}/promote")
async def promote_member(guild_id: str, request: UpdateMemberRequest, promoter_user_id: str):
    """Promote a guild member"""
    promoter = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": promoter_user_id
    })
    if not promoter or promoter["rank"] != "leader":
        raise HTTPException(status_code=403, detail="Only leader can promote")
    
    rank_order = ["member", "elder", "co-leader"]
    target = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": request.target_user_id
    })
    
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    
    current_rank_idx = rank_order.index(target["rank"]) if target["rank"] in rank_order else -1
    if current_rank_idx == len(rank_order) - 1:
        raise HTTPException(status_code=400, detail="Already at highest promotable rank")
    
    new_rank = rank_order[current_rank_idx + 1]
    await db.guild_members.update_one(
        {"guild_id": guild_id, "user_id": request.target_user_id},
        {"$set": {"rank": new_rank}}
    )
    
    return {"success": True, "new_rank": new_rank}


@router.post("/{guild_id}/transfer-leadership")
async def transfer_leadership(guild_id: str, current_leader_id: str, new_leader_id: str):
    """Transfer guild leadership"""
    guild = await db.guilds.find_one({"id": guild_id}, {"_id": 0})
    if not guild or guild["leader_id"] != current_leader_id:
        raise HTTPException(status_code=403, detail="Only current leader can transfer")
    
    new_leader = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": new_leader_id
    })
    if not new_leader:
        raise HTTPException(status_code=404, detail="New leader must be a guild member")
    
    # Update roles
    await db.guild_members.update_one(
        {"guild_id": guild_id, "user_id": current_leader_id},
        {"$set": {"rank": "co-leader"}}
    )
    await db.guild_members.update_one(
        {"guild_id": guild_id, "user_id": new_leader_id},
        {"$set": {"rank": "leader"}}
    )
    await db.guilds.update_one(
        {"id": guild_id},
        {"$set": {"leader_id": new_leader_id}}
    )
    
    return {"success": True}


# ========== GUILD CONTRIBUTIONS ==========

@router.post("/{guild_id}/contribute")
async def contribute_to_guild(guild_id: str, request: ContributeRequest):
    """Contribute resources to the guild"""
    membership = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": request.user_id
    })
    if not membership:
        raise HTTPException(status_code=404, detail="Not in this guild")
    
    # Verify user has resources
    user = await db.users.find_one({"id": request.user_id}, {"_id": 0})
    if request.contribution_type == "coins":
        if user.get("score", 0) < request.amount:
            raise HTTPException(status_code=400, detail="Insufficient coins")
        await db.users.update_one(
            {"id": request.user_id},
            {"$inc": {"score": -request.amount}}
        )
    
    # Update contribution
    contribution_points = request.amount // 10  # 1 point per 10 coins
    
    await db.guild_members.update_one(
        {"guild_id": guild_id, "user_id": request.user_id},
        {
            "$inc": {"contribution_points": contribution_points},
            "$set": {"last_active": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    # Update guild treasury and XP
    await db.guilds.update_one(
        {"id": guild_id},
        {
            "$inc": {
                f"treasury.{request.contribution_type}": request.amount,
                "weekly_contribution": request.amount,
                "experience": contribution_points
            }
        }
    )
    
    # Check for level up
    guild = await db.guilds.find_one({"id": guild_id}, {"_id": 0})
    xp_for_next_level = guild["level"] * 1000
    if guild["experience"] >= xp_for_next_level and guild["level"] < 10:
        new_level = guild["level"] + 1
        new_perks = GUILD_PERKS.get(new_level, [])
        new_max_members = 30 + (new_level - 1) * 5
        
        await db.guilds.update_one(
            {"id": guild_id},
            {
                "$set": {
                    "level": new_level,
                    "perks": new_perks,
                    "max_members": new_max_members
                },
                "$inc": {"experience": -xp_for_next_level}
            }
        )
    
    return {"success": True, "contribution_points": contribution_points}


# ========== GUILD CHALLENGES ==========

@router.post("/challenges/create")
async def create_guild_challenge(request: GuildChallengeRequest):
    """Challenge another guild"""
    challenger_membership = await db.guild_members.find_one({"user_id": request.challenger_user_id})
    if not challenger_membership or challenger_membership["rank"] not in ["leader", "co-leader"]:
        raise HTTPException(status_code=403, detail="Must be leader or co-leader to start challenges")
    
    challenger_guild = await db.guilds.find_one({"id": challenger_membership["guild_id"]}, {"_id": 0})
    defender_guild = await db.guilds.find_one({"id": request.defender_guild_id}, {"_id": 0})
    
    if not defender_guild:
        raise HTTPException(status_code=404, detail="Defender guild not found")
    
    if challenger_guild["id"] == defender_guild["id"]:
        raise HTTPException(status_code=400, detail="Cannot challenge your own guild")
    
    # Check stake
    if request.stake_coins > 0:
        if challenger_guild["treasury"].get("coins", 0) < request.stake_coins:
            raise HTTPException(status_code=400, detail="Insufficient guild treasury")
    
    challenge = {
        "id": str(uuid.uuid4()),
        "challenger_guild_id": challenger_guild["id"],
        "challenger_guild_name": challenger_guild["name"],
        "defender_guild_id": request.defender_guild_id,
        "defender_guild_name": defender_guild["name"],
        "challenge_type": request.challenge_type,
        "target": request.target,
        "duration_hours": request.duration_hours,
        "stake": {"coins": request.stake_coins},
        "challenger_progress": 0,
        "defender_progress": 0,
        "status": "pending",
        "winner_guild_id": None,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()  # 24h to accept
    }
    
    await db.guild_challenges.insert_one(challenge)
    return {"success": True, "challenge": {k: v for k, v in challenge.items() if k != "_id"}}


@router.post("/challenges/{challenge_id}/accept")
async def accept_guild_challenge(challenge_id: str, accepter_user_id: str):
    """Accept a guild challenge"""
    challenge = await db.guild_challenges.find_one({"id": challenge_id, "status": "pending"}, {"_id": 0})
    if not challenge:
        raise HTTPException(status_code=404, detail="Challenge not found or not pending")
    
    membership = await db.guild_members.find_one({
        "guild_id": challenge["defender_guild_id"],
        "user_id": accepter_user_id
    })
    if not membership or membership["rank"] not in ["leader", "co-leader"]:
        raise HTTPException(status_code=403, detail="Must be leader or co-leader to accept")
    
    # Check defender has stake
    if challenge["stake"].get("coins", 0) > 0:
        defender_guild = await db.guilds.find_one({"id": challenge["defender_guild_id"]}, {"_id": 0})
        if defender_guild["treasury"].get("coins", 0) < challenge["stake"]["coins"]:
            raise HTTPException(status_code=400, detail="Insufficient guild treasury for stake")
        
        # Deduct stakes
        await db.guilds.update_one(
            {"id": challenge["defender_guild_id"]},
            {"$inc": {"treasury.coins": -challenge["stake"]["coins"]}}
        )
        await db.guilds.update_one(
            {"id": challenge["challenger_guild_id"]},
            {"$inc": {"treasury.coins": -challenge["stake"]["coins"]}}
        )
    
    end_time = datetime.now(timezone.utc) + timedelta(hours=challenge["duration_hours"])
    
    await db.guild_challenges.update_one(
        {"id": challenge_id},
        {
            "$set": {
                "status": "active",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "ends_at": end_time.isoformat()
            }
        }
    )
    
    return {"success": True}


@router.get("/challenges/active/{guild_id}")
async def get_active_challenges(guild_id: str):
    """Get active challenges for a guild"""
    challenges = await db.guild_challenges.find({
        "$or": [
            {"challenger_guild_id": guild_id},
            {"defender_guild_id": guild_id}
        ],
        "status": "active"
    }, {"_id": 0}).to_list(20)
    
    return {"challenges": challenges}


@router.post("/challenges/{challenge_id}/update-progress")
async def update_challenge_progress(challenge_id: str, guild_id: str, progress_delta: int):
    """Update guild's challenge progress"""
    challenge = await db.guild_challenges.find_one({"id": challenge_id, "status": "active"}, {"_id": 0})
    if not challenge:
        raise HTTPException(status_code=404, detail="Active challenge not found")
    
    if guild_id == challenge["challenger_guild_id"]:
        field = "challenger_progress"
    elif guild_id == challenge["defender_guild_id"]:
        field = "defender_progress"
    else:
        raise HTTPException(status_code=400, detail="Guild not part of this challenge")
    
    await db.guild_challenges.update_one(
        {"id": challenge_id},
        {"$inc": {field: progress_delta}}
    )
    
    # Check for completion
    updated = await db.guild_challenges.find_one({"id": challenge_id}, {"_id": 0})
    if updated["challenger_progress"] >= challenge["target"] or updated["defender_progress"] >= challenge["target"]:
        # Determine winner
        winner = None
        if updated["challenger_progress"] >= challenge["target"] and updated["defender_progress"] >= challenge["target"]:
            # Both reached target, higher wins
            winner = challenge["challenger_guild_id"] if updated["challenger_progress"] > updated["defender_progress"] else challenge["defender_guild_id"]
        elif updated["challenger_progress"] >= challenge["target"]:
            winner = challenge["challenger_guild_id"]
        elif updated["defender_progress"] >= challenge["target"]:
            winner = challenge["defender_guild_id"]
        
        if winner:
            # Award stake to winner
            total_stake = challenge["stake"].get("coins", 0) * 2
            if total_stake > 0:
                await db.guilds.update_one(
                    {"id": winner},
                    {"$inc": {"treasury.coins": total_stake}}
                )
            
            await db.guild_challenges.update_one(
                {"id": challenge_id},
                {"$set": {"status": "completed", "winner_guild_id": winner}}
            )
    
    return {"success": True, "current_progress": updated[field]}


# ========== GUILD CHAT ==========

@router.post("/{guild_id}/chat")
async def send_guild_chat(guild_id: str, request: GuildChatRequest):
    """Send a message to guild chat"""
    membership = await db.guild_members.find_one({
        "guild_id": guild_id,
        "user_id": request.user_id
    })
    if not membership:
        raise HTTPException(status_code=403, detail="Not a member of this guild")
    
    message = {
        "id": str(uuid.uuid4()),
        "channel": f"guild_{guild_id}",
        "user_id": request.user_id,
        "username": request.username,
        "rank": membership["rank"],
        "message": request.message[:500],  # Limit message length
        "message_type": "text",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.chat_messages.insert_one(message)
    
    # Update last active
    await db.guild_members.update_one(
        {"guild_id": guild_id, "user_id": request.user_id},
        {"$set": {"last_active": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "message": {k: v for k, v in message.items() if k != "_id"}}


@router.get("/{guild_id}/chat")
async def get_guild_chat(guild_id: str, limit: int = 50, before: str = None):
    """Get guild chat messages"""
    query = {"channel": f"guild_{guild_id}"}
    if before:
        query["created_at"] = {"$lt": before}
    
    messages = await db.chat_messages.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"messages": list(reversed(messages))}


# ========== GUILD LEADERBOARD ==========

@router.get("/leaderboard")
async def get_guild_leaderboard(limit: int = 100):
    """Get top guilds by level and XP"""
    guilds = await db.guilds.find(
        {},
        {"_id": 0, "id": 1, "name": 1, "tag": 1, "icon": 1, "level": 1, "experience": 1, "member_count": 1, "total_fish_caught": 1}
    ).sort([("level", -1), ("experience", -1)]).limit(limit).to_list(limit)
    
    for i, guild in enumerate(guilds):
        guild["rank"] = i + 1
    
    return {"leaderboard": guilds}


@router.get("/{guild_id}/leaderboard")
async def get_guild_member_leaderboard(guild_id: str):
    """Get member contribution leaderboard"""
    members = await db.guild_members.find(
        {"guild_id": guild_id},
        {"_id": 0}
    ).sort("contribution_points", -1).to_list(100)
    
    for i, member in enumerate(members):
        member["rank"] = i + 1
    
    return {"leaderboard": members}
