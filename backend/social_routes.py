# ========== GO FISH! SOCIAL & GIFT SYSTEM API ==========
# Friend system, gifts, and social interactions

from fastapi import APIRouter, HTTPException
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
import uuid
import os

router = APIRouter(prefix="/api/social", tags=["social"])

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME')]


# ========== GIFT CONFIGURATIONS ==========

GIFT_TYPES = {
    "coins_small": {"name": "Small Coin Pouch", "type": "coins", "amount": 100, "cost": 0},
    "coins_medium": {"name": "Coin Bag", "type": "coins", "amount": 500, "cost": 50},
    "coins_large": {"name": "Treasure Chest", "type": "coins", "amount": 2000, "cost": 200},
    "energy_small": {"name": "Energy Drink", "type": "energy", "amount": 10, "cost": 0},
    "energy_large": {"name": "Energy Tank", "type": "energy", "amount": 50, "cost": 100},
    "bait_common": {"name": "Common Bait Pack", "type": "bait", "amount": 10, "cost": 50},
    "bait_rare": {"name": "Rare Bait Pack", "type": "bait", "amount": 5, "cost": 150},
    "lucky_ticket": {"name": "Lucky Wheel Ticket", "type": "ticket", "amount": 1, "cost": 200},
}

DAILY_GIFT_LIMIT = 5
FREE_GIFT_LIMIT = 3


# ========== REQUEST MODELS ==========

class FriendRequestModel(BaseModel):
    from_user_id: str
    from_username: str
    to_user_id: str
    message: str = ""


class SendGiftRequest(BaseModel):
    from_user_id: str
    from_username: str
    to_user_id: str
    gift_type: str
    message: str = ""


class AcceptFriendRequest(BaseModel):
    request_id: str
    user_id: str


class ClaimGiftRequest(BaseModel):
    gift_id: str
    user_id: str


# ========== FRIEND SYSTEM ==========

@router.post("/friends/request")
async def send_friend_request(request: FriendRequestModel):
    """Send a friend request to another player"""
    if request.from_user_id == request.to_user_id:
        raise HTTPException(status_code=400, detail="Cannot friend yourself")
    
    # Check if already friends
    existing_friendship = await db.friendships.find_one({
        "$or": [
            {"user_id_1": request.from_user_id, "user_id_2": request.to_user_id},
            {"user_id_1": request.to_user_id, "user_id_2": request.from_user_id}
        ]
    })
    if existing_friendship:
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Check for pending request
    existing_request = await db.friend_requests.find_one({
        "$or": [
            {"from_user_id": request.from_user_id, "to_user_id": request.to_user_id, "status": "pending"},
            {"from_user_id": request.to_user_id, "to_user_id": request.from_user_id, "status": "pending"}
        ]
    })
    if existing_request:
        raise HTTPException(status_code=400, detail="Friend request already exists")
    
    friend_request = {
        "id": str(uuid.uuid4()),
        "from_user_id": request.from_user_id,
        "from_username": request.from_username,
        "to_user_id": request.to_user_id,
        "message": request.message[:200],
        "status": "pending",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.friend_requests.insert_one(friend_request)
    
    # Create notification for recipient
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": request.to_user_id,
        "notification_type": "friend_request",
        "title": "New Friend Request",
        "message": f"{request.from_username} wants to be your friend!",
        "icon": "👋",
        "action_type": "view_friend_requests",
        "action_data": {"request_id": friend_request["id"]},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    return {"success": True, "request": {k: v for k, v in friend_request.items() if k != "_id"}}


@router.get("/friends/requests/{user_id}")
async def get_friend_requests(user_id: str):
    """Get pending friend requests"""
    incoming = await db.friend_requests.find(
        {"to_user_id": user_id, "status": "pending"},
        {"_id": 0}
    ).to_list(50)
    
    outgoing = await db.friend_requests.find(
        {"from_user_id": user_id, "status": "pending"},
        {"_id": 0}
    ).to_list(50)
    
    return {"incoming": incoming, "outgoing": outgoing}


@router.post("/friends/accept")
async def accept_friend_request(request: AcceptFriendRequest):
    """Accept a friend request"""
    friend_request = await db.friend_requests.find_one({
        "id": request.request_id,
        "to_user_id": request.user_id,
        "status": "pending"
    })
    
    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    # Create friendship
    friendship = {
        "id": str(uuid.uuid4()),
        "user_id_1": friend_request["from_user_id"],
        "user_id_2": friend_request["to_user_id"],
        "friendship_level": 1,
        "gifts_sent": 0,
        "gifts_received": 0,
        "co_op_sessions": 0,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.friendships.insert_one(friendship)
    
    # Update request status
    await db.friend_requests.update_one(
        {"id": request.request_id},
        {"$set": {"status": "accepted"}}
    )
    
    # Notify sender
    to_user = await db.users.find_one({"id": request.user_id}, {"_id": 0, "username": 1})
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": friend_request["from_user_id"],
        "notification_type": "friend_accepted",
        "title": "Friend Request Accepted!",
        "message": f"{to_user.get('username', 'A player')} accepted your friend request!",
        "icon": "🎉",
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    return {"success": True, "friendship": {k: v for k, v in friendship.items() if k != "_id"}}


@router.post("/friends/reject")
async def reject_friend_request(request: AcceptFriendRequest):
    """Reject a friend request"""
    await db.friend_requests.update_one(
        {"id": request.request_id, "to_user_id": request.user_id},
        {"$set": {"status": "rejected"}}
    )
    return {"success": True}


@router.get("/friends/{user_id}")
async def get_friends(user_id: str):
    """Get user's friends list"""
    friendships = await db.friendships.find({
        "$or": [
            {"user_id_1": user_id},
            {"user_id_2": user_id}
        ]
    }, {"_id": 0}).to_list(100)
    
    friends = []
    for fs in friendships:
        friend_id = fs["user_id_2"] if fs["user_id_1"] == user_id else fs["user_id_1"]
        friend_user = await db.users.find_one({"id": friend_id}, {"_id": 0, "id": 1, "username": 1, "level": 1, "high_score": 1})
        if friend_user:
            friend_user["friendship_level"] = fs["friendship_level"]
            friend_user["friendship_id"] = fs["id"]
            friend_user["gifts_exchanged"] = fs["gifts_sent"] + fs["gifts_received"]
            friends.append(friend_user)
    
    return {"friends": friends, "count": len(friends)}


@router.delete("/friends/{user_id}/{friend_id}")
async def remove_friend(user_id: str, friend_id: str):
    """Remove a friend"""
    result = await db.friendships.delete_one({
        "$or": [
            {"user_id_1": user_id, "user_id_2": friend_id},
            {"user_id_1": friend_id, "user_id_2": user_id}
        ]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Friendship not found")
    
    return {"success": True}


# ========== GIFT SYSTEM ==========

@router.get("/gifts/types")
async def get_gift_types():
    """Get available gift types"""
    return {"gift_types": GIFT_TYPES}


@router.post("/gifts/send")
async def send_gift(request: SendGiftRequest):
    """Send a gift to a friend"""
    if request.gift_type not in GIFT_TYPES:
        raise HTTPException(status_code=400, detail="Invalid gift type")
    
    gift_config = GIFT_TYPES[request.gift_type]
    
    # Check if friends
    friendship = await db.friendships.find_one({
        "$or": [
            {"user_id_1": request.from_user_id, "user_id_2": request.to_user_id},
            {"user_id_1": request.to_user_id, "user_id_2": request.from_user_id}
        ]
    })
    
    if not friendship:
        raise HTTPException(status_code=400, detail="Must be friends to send gifts")
    
    # Check daily gift limit
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)
    gifts_sent_today = await db.gifts.count_documents({
        "from_user_id": request.from_user_id,
        "created_at": {"$gte": today_start.isoformat()}
    })
    
    if gifts_sent_today >= DAILY_GIFT_LIMIT:
        raise HTTPException(status_code=400, detail="Daily gift limit reached")
    
    # Check cost
    if gift_config["cost"] > 0:
        user = await db.users.find_one({"id": request.from_user_id}, {"_id": 0})
        if user.get("score", 0) < gift_config["cost"]:
            raise HTTPException(status_code=400, detail="Insufficient coins")
        
        await db.users.update_one(
            {"id": request.from_user_id},
            {"$inc": {"score": -gift_config["cost"]}}
        )
    
    gift = {
        "id": str(uuid.uuid4()),
        "from_user_id": request.from_user_id,
        "from_username": request.from_username,
        "to_user_id": request.to_user_id,
        "gift_type": request.gift_type,
        "gift_name": gift_config["name"],
        "reward_type": gift_config["type"],
        "reward_amount": gift_config["amount"],
        "message": request.message[:100],
        "status": "pending",
        "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.gifts.insert_one(gift)
    
    # Update friendship stats
    await db.friendships.update_one(
        {"id": friendship["id"]},
        {"$inc": {"gifts_sent": 1}}
    )
    
    # Notify recipient
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": request.to_user_id,
        "notification_type": "gift_received",
        "title": "You received a gift!",
        "message": f"{request.from_username} sent you a {gift_config['name']}!",
        "icon": "🎁",
        "action_type": "claim_gift",
        "action_data": {"gift_id": gift["id"]},
        "is_read": False,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notification)
    
    return {"success": True, "gift": {k: v for k, v in gift.items() if k != "_id"}}


@router.get("/gifts/inbox/{user_id}")
async def get_gift_inbox(user_id: str):
    """Get pending gifts"""
    now = datetime.now(timezone.utc).isoformat()
    gifts = await db.gifts.find({
        "to_user_id": user_id,
        "status": "pending",
        "expires_at": {"$gt": now}
    }, {"_id": 0}).to_list(50)
    
    return {"gifts": gifts}


@router.post("/gifts/claim")
async def claim_gift(request: ClaimGiftRequest):
    """Claim a received gift"""
    gift = await db.gifts.find_one({
        "id": request.gift_id,
        "to_user_id": request.user_id,
        "status": "pending"
    })
    
    if not gift:
        raise HTTPException(status_code=404, detail="Gift not found")
    
    # Check expiry
    if datetime.fromisoformat(gift["expires_at"]) < datetime.now(timezone.utc):
        await db.gifts.update_one({"id": request.gift_id}, {"$set": {"status": "expired"}})
        raise HTTPException(status_code=400, detail="Gift has expired")
    
    # Award gift
    reward_type = gift["reward_type"]
    reward_amount = gift["reward_amount"]
    
    if reward_type == "coins":
        await db.users.update_one(
            {"id": request.user_id},
            {"$inc": {"score": reward_amount}}
        )
    elif reward_type == "energy":
        await db.player_energy.update_one(
            {"user_id": request.user_id},
            {"$inc": {"current_energy": reward_amount}},
            upsert=True
        )
    elif reward_type == "bait":
        await db.player_bait.update_one(
            {"user_id": request.user_id},
            {"$inc": {f"baits.common_bait": reward_amount}},
            upsert=True
        )
    elif reward_type == "ticket":
        await db.player_items.update_one(
            {"user_id": request.user_id},
            {"$inc": {"lucky_tickets": reward_amount}},
            upsert=True
        )
    
    # Update gift status
    await db.gifts.update_one(
        {"id": request.gift_id},
        {"$set": {"status": "claimed", "claimed_at": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {
        "success": True,
        "reward_type": reward_type,
        "reward_amount": reward_amount
    }


@router.post("/gifts/claim-all/{user_id}")
async def claim_all_gifts(user_id: str):
    """Claim all pending gifts"""
    now = datetime.now(timezone.utc)
    gifts = await db.gifts.find({
        "to_user_id": user_id,
        "status": "pending",
        "expires_at": {"$gt": now.isoformat()}
    }, {"_id": 0}).to_list(50)
    
    total_rewards = {"coins": 0, "energy": 0, "bait": 0, "ticket": 0}
    claimed_count = 0
    
    for gift in gifts:
        reward_type = gift["reward_type"]
        reward_amount = gift["reward_amount"]
        
        if reward_type in total_rewards:
            total_rewards[reward_type] += reward_amount
        
        await db.gifts.update_one(
            {"id": gift["id"]},
            {"$set": {"status": "claimed", "claimed_at": now.isoformat()}}
        )
        claimed_count += 1
    
    # Apply rewards
    if total_rewards["coins"] > 0:
        await db.users.update_one(
            {"id": user_id},
            {"$inc": {"score": total_rewards["coins"]}}
        )
    if total_rewards["energy"] > 0:
        await db.player_energy.update_one(
            {"user_id": user_id},
            {"$inc": {"current_energy": total_rewards["energy"]}},
            upsert=True
        )
    
    return {
        "success": True,
        "claimed_count": claimed_count,
        "total_rewards": total_rewards
    }


# ========== SOCIAL SEARCH ==========

@router.get("/search/players")
async def search_players(query: str, limit: int = 20):
    """Search for players by username"""
    if len(query) < 2:
        raise HTTPException(status_code=400, detail="Query too short")
    
    players = await db.users.find(
        {"username": {"$regex": query, "$options": "i"}},
        {"_id": 0, "id": 1, "username": 1, "level": 1, "high_score": 1, "total_catches": 1}
    ).limit(limit).to_list(limit)
    
    return {"players": players}


@router.get("/profile/{user_id}")
async def get_player_profile(user_id: str, viewer_id: str = None):
    """Get public player profile"""
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Get stats
    stats = await db.player_stats.find_one({"user_id": user_id}, {"_id": 0})
    
    # Get achievements count
    achievements_count = len(user.get("achievements", []))
    
    # Get guild info
    guild_membership = await db.guild_members.find_one({"user_id": user_id}, {"_id": 0})
    guild_info = None
    if guild_membership:
        guild = await db.guilds.find_one({"id": guild_membership["guild_id"]}, {"_id": 0, "name": 1, "tag": 1, "icon": 1})
        if guild:
            guild_info = {
                "name": guild["name"],
                "tag": guild["tag"],
                "icon": guild["icon"],
                "rank": guild_membership["rank"]
            }
    
    # Check friendship if viewer provided
    is_friend = False
    friendship_id = None
    if viewer_id and viewer_id != user_id:
        friendship = await db.friendships.find_one({
            "$or": [
                {"user_id_1": viewer_id, "user_id_2": user_id},
                {"user_id_1": user_id, "user_id_2": viewer_id}
            ]
        })
        if friendship:
            is_friend = True
            friendship_id = friendship["id"]
    
    profile = {
        "id": user["id"],
        "username": user.get("username", "Angler"),
        "level": user.get("level", 1),
        "prestige": user.get("prestige", 0),
        "high_score": user.get("high_score", 0),
        "total_catches": user.get("total_catches", 0),
        "achievements_count": achievements_count,
        "guild": guild_info,
        "stats": stats,
        "created_at": user.get("created_at"),
        "is_friend": is_friend,
        "friendship_id": friendship_id
    }
    
    return profile


# ========== ACTIVITY FEED ==========

@router.get("/feed/{user_id}")
async def get_activity_feed(user_id: str, limit: int = 20):
    """Get activity feed from friends"""
    # Get friends list
    friendships = await db.friendships.find({
        "$or": [
            {"user_id_1": user_id},
            {"user_id_2": user_id}
        ]
    }, {"_id": 0}).to_list(100)
    
    friend_ids = []
    for fs in friendships:
        friend_id = fs["user_id_2"] if fs["user_id_1"] == user_id else fs["user_id_1"]
        friend_ids.append(friend_id)
    
    if not friend_ids:
        return {"feed": []}
    
    # Get recent activities from friends
    activities = await db.activity_feed.find(
        {"user_id": {"$in": friend_ids}},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return {"feed": activities}


@router.post("/activity/post")
async def post_activity(
    user_id: str,
    username: str,
    activity_type: str,
    content: Dict[str, Any]
):
    """Post an activity to the feed"""
    activity = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "username": username,
        "activity_type": activity_type,
        "content": content,
        "likes": 0,
        "liked_by": [],
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.activity_feed.insert_one(activity)
    return {"success": True, "activity": {k: v for k, v in activity.items() if k != "_id"}}


@router.post("/activity/{activity_id}/like")
async def like_activity(activity_id: str, user_id: str):
    """Like an activity"""
    activity = await db.activity_feed.find_one({"id": activity_id}, {"_id": 0})
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    if user_id in activity.get("liked_by", []):
        # Unlike
        await db.activity_feed.update_one(
            {"id": activity_id},
            {"$inc": {"likes": -1}, "$pull": {"liked_by": user_id}}
        )
        return {"success": True, "action": "unliked"}
    else:
        # Like
        await db.activity_feed.update_one(
            {"id": activity_id},
            {"$inc": {"likes": 1}, "$push": {"liked_by": user_id}}
        )
        return {"success": True, "action": "liked"}


# ========== NOTIFICATIONS ==========

@router.get("/notifications/{user_id}")
async def get_notifications(user_id: str, limit: int = 50, unread_only: bool = False):
    """Get user notifications"""
    query = {"user_id": user_id}
    if unread_only:
        query["is_read"] = False
    
    notifications = await db.notifications.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    unread_count = await db.notifications.count_documents({
        "user_id": user_id,
        "is_read": False
    })
    
    return {"notifications": notifications, "unread_count": unread_count}


@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, user_id: str):
    """Mark notification as read"""
    await db.notifications.update_one(
        {"id": notification_id, "user_id": user_id},
        {"$set": {"is_read": True}}
    )
    return {"success": True}


@router.post("/notifications/{user_id}/read-all")
async def mark_all_notifications_read(user_id: str):
    """Mark all notifications as read"""
    result = await db.notifications.update_many(
        {"user_id": user_id, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"success": True, "marked_count": result.modified_count}


@router.delete("/notifications/{user_id}/clear")
async def clear_notifications(user_id: str, older_than_days: int = 7):
    """Clear old notifications"""
    cutoff = datetime.now(timezone.utc) - timedelta(days=older_than_days)
    result = await db.notifications.delete_many({
        "user_id": user_id,
        "created_at": {"$lt": cutoff.isoformat()}
    })
    return {"success": True, "deleted_count": result.deleted_count}
