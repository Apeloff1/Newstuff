# ========== GO FISH! ENHANCED GAME MODELS ==========
# Advanced models for tournaments, guilds, social features, and monetization

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone, timedelta
import uuid


# ========== TOURNAMENT SYSTEM MODELS (400+ lines) ==========

class TournamentTier(BaseModel):
    """Tournament reward tier"""
    rank_min: int
    rank_max: int
    rewards: Dict[str, Any]
    trophy_type: str = "bronze"


class Tournament(BaseModel):
    """Competitive fishing tournament"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    tournament_type: str  # daily, weekly, special, guild
    start_time: str
    end_time: str
    entry_fee: int = 0
    entry_currency: str = "coins"  # coins, gems, tickets
    max_participants: int = 1000
    current_participants: int = 0
    status: str = "upcoming"  # upcoming, active, ended, cancelled
    rules: Dict[str, Any] = Field(default_factory=dict)
    reward_tiers: List[TournamentTier] = Field(default_factory=list)
    leaderboard: List[Dict[str, Any]] = Field(default_factory=list)
    stage_requirements: List[int] = Field(default_factory=list)
    fish_requirements: List[str] = Field(default_factory=list)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TournamentEntry(BaseModel):
    """Player's tournament entry"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    tournament_id: str
    user_id: str
    username: str
    score: int = 0
    fish_caught: int = 0
    biggest_fish: int = 0
    perfect_catches: int = 0
    combo_max: int = 0
    joined_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class TournamentResult(BaseModel):
    """Tournament final results"""
    tournament_id: str
    user_id: str
    final_rank: int
    final_score: int
    rewards_claimed: bool = False
    rewards: Dict[str, Any] = Field(default_factory=dict)


# ========== GUILD SYSTEM MODELS (400+ lines) ==========

class GuildRank(BaseModel):
    """Guild member rank"""
    name: str
    permissions: List[str]
    required_contribution: int = 0


class GuildMember(BaseModel):
    """Guild membership"""
    user_id: str
    username: str
    rank: str = "member"
    contribution_points: int = 0
    fish_donated: int = 0
    joined_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    last_active: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Guild(BaseModel):
    """Fishing guild/team"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    tag: str  # 3-5 char abbreviation
    description: str = ""
    icon: str = "🎣"
    banner_color: str = "#3B82F6"
    leader_id: str
    level: int = 1
    experience: int = 0
    max_members: int = 30
    members: List[GuildMember] = Field(default_factory=list)
    ranks: List[GuildRank] = Field(default_factory=list)
    perks: List[str] = Field(default_factory=list)
    treasury: Dict[str, int] = Field(default_factory=lambda: {"coins": 0, "gems": 0})
    weekly_contribution: int = 0
    total_fish_caught: int = 0
    achievements: List[str] = Field(default_factory=list)
    settings: Dict[str, Any] = Field(default_factory=lambda: {
        "auto_accept": False,
        "min_level": 1,
        "is_public": True
    })
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class GuildApplication(BaseModel):
    """Application to join a guild"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    guild_id: str
    user_id: str
    username: str
    message: str = ""
    status: str = "pending"  # pending, accepted, rejected
    applied_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class GuildChallenge(BaseModel):
    """Guild vs Guild challenge"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    challenger_guild_id: str
    defender_guild_id: str
    challenge_type: str  # fish_count, total_score, biggest_fish
    target: int
    duration_hours: int = 24
    stake: Dict[str, int] = Field(default_factory=dict)
    challenger_progress: int = 0
    defender_progress: int = 0
    status: str = "pending"  # pending, active, completed
    winner_guild_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ========== SOCIAL SYSTEM MODELS (300+ lines) ==========

class FriendRequest(BaseModel):
    """Friend request between players"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    from_username: str
    to_user_id: str
    message: str = ""
    status: str = "pending"  # pending, accepted, rejected
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Friendship(BaseModel):
    """Friendship relationship"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id_1: str
    user_id_2: str
    friendship_level: int = 1
    gifts_sent: int = 0
    gifts_received: int = 0
    co_op_sessions: int = 0
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class Gift(BaseModel):
    """Gift between players"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_user_id: str
    from_username: str
    to_user_id: str
    gift_type: str  # coins, bait, lure, fish, energy
    gift_amount: int
    gift_item_id: Optional[str] = None
    message: str = ""
    status: str = "pending"  # pending, claimed, expired
    expires_at: str = Field(default_factory=lambda: (datetime.now(timezone.utc) + timedelta(days=7)).isoformat())
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ChatMessage(BaseModel):
    """Chat message (guild/global)"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    channel: str  # global, guild_{id}, private_{user1}_{user2}
    user_id: str
    username: str
    message: str
    message_type: str = "text"  # text, emote, system, achievement
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


# ========== SEASON PASS / BATTLE PASS MODELS (300+ lines) ==========

class SeasonPassTier(BaseModel):
    """Individual tier in season pass"""
    level: int
    required_xp: int
    free_reward: Optional[Dict[str, Any]] = None
    premium_reward: Optional[Dict[str, Any]] = None


class SeasonPass(BaseModel):
    """Season pass definition"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    season: int
    theme: str  # underwater, tropical, arctic, etc.
    start_date: str
    end_date: str
    max_level: int = 50
    tiers: List[SeasonPassTier] = Field(default_factory=list)
    bonus_challenges: List[Dict[str, Any]] = Field(default_factory=list)
    premium_price: float = 9.99
    status: str = "active"  # upcoming, active, ended


class PlayerSeasonPass(BaseModel):
    """Player's season pass progress"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    season_pass_id: str
    current_level: int = 1
    current_xp: int = 0
    is_premium: bool = False
    claimed_free_rewards: List[int] = Field(default_factory=list)
    claimed_premium_rewards: List[int] = Field(default_factory=list)
    bonus_challenges_completed: List[str] = Field(default_factory=list)
    purchased_at: Optional[str] = None


# ========== QUEST / MISSION SYSTEM MODELS (300+ lines) ==========

class QuestObjective(BaseModel):
    """Individual quest objective"""
    type: str  # catch_fish, catch_type, catch_size, score, combo, perfect, etc.
    target: int
    current: int = 0
    fish_type: Optional[str] = None
    min_size: Optional[int] = None
    stage: Optional[int] = None


class Quest(BaseModel):
    """Quest/mission definition"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    quest_type: str  # daily, weekly, story, achievement, event
    difficulty: str = "normal"  # easy, normal, hard, legendary
    objectives: List[QuestObjective] = Field(default_factory=list)
    rewards: Dict[str, Any] = Field(default_factory=dict)
    requirements: Dict[str, Any] = Field(default_factory=dict)  # level, stage unlock, etc.
    expires_at: Optional[str] = None
    repeatable: bool = False
    cooldown_hours: int = 0


class PlayerQuest(BaseModel):
    """Player's quest progress"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    quest_id: str
    status: str = "active"  # active, completed, claimed, expired
    objectives_progress: List[int] = Field(default_factory=list)
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None
    claimed_at: Optional[str] = None


# ========== DAILY REWARDS / LOGIN BONUS MODELS (200+ lines) ==========

class DailyReward(BaseModel):
    """Daily login reward"""
    day: int
    reward_type: str  # coins, gems, bait, lure, rod, fish, energy
    reward_amount: int
    reward_item_id: Optional[str] = None
    is_premium: bool = False


class DailyRewardCalendar(BaseModel):
    """Monthly reward calendar"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    month: int
    year: int
    rewards: List[DailyReward] = Field(default_factory=list)
    milestone_rewards: Dict[int, Dict[str, Any]] = Field(default_factory=dict)  # day 7, 14, 21, 28


class PlayerDailyRewards(BaseModel):
    """Player's daily reward status"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    current_streak: int = 0
    max_streak: int = 0
    total_logins: int = 0
    last_login_date: Optional[str] = None
    claimed_days: List[int] = Field(default_factory=list)
    milestone_claimed: List[int] = Field(default_factory=list)


# ========== LUCKY WHEEL / GACHA MODELS (250+ lines) ==========

class WheelSlot(BaseModel):
    """Lucky wheel slot"""
    slot_id: int
    reward_type: str
    reward_amount: int
    reward_item_id: Optional[str] = None
    probability: float  # 0.0 to 1.0
    rarity: str = "common"  # common, rare, epic, legendary


class LuckyWheel(BaseModel):
    """Lucky wheel configuration"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    wheel_type: str  # daily, premium, event
    slots: List[WheelSlot] = Field(default_factory=list)
    spin_cost: int = 0
    spin_currency: str = "coins"
    free_spins_per_day: int = 1
    ad_spins_per_day: int = 3


class PlayerWheelSpin(BaseModel):
    """Record of player's wheel spin"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    wheel_id: str
    slot_won: int
    reward_type: str
    reward_amount: int
    spin_type: str = "free"  # free, paid, ad
    spun_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class MysteryBox(BaseModel):
    """Mystery box / loot box"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    box_type: str  # common, rare, epic, legendary, event
    price: int
    currency: str = "gems"
    possible_rewards: List[Dict[str, Any]] = Field(default_factory=list)
    guaranteed_rarity: str = "common"


# ========== ENERGY / STAMINA SYSTEM MODELS (150+ lines) ==========

class EnergyConfig(BaseModel):
    """Energy system configuration"""
    max_energy: int = 100
    energy_per_cast: int = 1
    energy_regen_minutes: int = 5
    energy_per_regen: int = 1
    level_bonus_energy: int = 5  # Per 10 levels


class PlayerEnergy(BaseModel):
    """Player's energy status"""
    user_id: str
    current_energy: int = 100
    max_energy: int = 100
    last_regen_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    bonus_energy: int = 0  # From ads, purchases, etc.


# ========== SHOP / MONETIZATION MODELS (300+ lines) ==========

class ShopItem(BaseModel):
    """Item in the shop"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    category: str  # rods, lures, bait, cosmetics, currency, energy, passes
    item_type: str
    item_data: Dict[str, Any] = Field(default_factory=dict)
    price: float
    currency: str  # coins, gems, usd
    discount_percent: int = 0
    is_limited: bool = False
    stock: Optional[int] = None
    available_from: Optional[str] = None
    available_until: Optional[str] = None
    requirements: Dict[str, Any] = Field(default_factory=dict)
    tags: List[str] = Field(default_factory=list)


class ShopBundle(BaseModel):
    """Bundle of shop items"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    items: List[Dict[str, Any]] = Field(default_factory=list)
    original_price: float
    bundle_price: float
    currency: str = "usd"
    discount_percent: int = 0
    is_limited: bool = False
    available_until: Optional[str] = None


class Purchase(BaseModel):
    """Player purchase record"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    item_type: str  # shop_item, bundle, iap
    item_id: str
    item_name: str
    quantity: int = 1
    price: float
    currency: str
    payment_method: str = "in_game"  # in_game, iap, gift
    transaction_id: Optional[str] = None
    purchased_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class DailyDeal(BaseModel):
    """Rotating daily deal"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    shop_item_id: str
    discount_percent: int
    deal_date: str
    expires_at: str
    max_purchases: int = 1
    purchases_count: int = 0


# ========== VIP / SUBSCRIPTION MODELS (200+ lines) ==========

class VIPTier(BaseModel):
    """VIP subscription tier"""
    tier: int
    name: str
    monthly_price: float
    benefits: List[str] = Field(default_factory=list)
    daily_rewards: Dict[str, int] = Field(default_factory=dict)
    bonus_multipliers: Dict[str, float] = Field(default_factory=dict)


class PlayerVIP(BaseModel):
    """Player's VIP status"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    vip_tier: int = 0
    vip_points: int = 0
    subscription_active: bool = False
    subscription_start: Optional[str] = None
    subscription_end: Optional[str] = None
    lifetime_spent: float = 0.0
    benefits_claimed_today: List[str] = Field(default_factory=list)


# ========== NOTIFICATION MODELS (150+ lines) ==========

class Notification(BaseModel):
    """In-game notification"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    notification_type: str  # achievement, gift, guild, tournament, system, social
    title: str
    message: str
    icon: str = "🔔"
    action_type: Optional[str] = None  # navigate, claim, open_shop, etc.
    action_data: Optional[Dict[str, Any]] = None
    is_read: bool = False
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    expires_at: Optional[str] = None


class NotificationPreferences(BaseModel):
    """Player notification settings"""
    user_id: str
    push_enabled: bool = True
    email_enabled: bool = False
    tournament_alerts: bool = True
    guild_alerts: bool = True
    gift_alerts: bool = True
    daily_reminder: bool = True
    energy_full_alert: bool = True
    quiet_hours_start: Optional[int] = None  # Hour 0-23
    quiet_hours_end: Optional[int] = None


# ========== ANALYTICS / TRACKING MODELS (200+ lines) ==========

class PlayerSession(BaseModel):
    """Player session tracking"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    session_start: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    session_end: Optional[str] = None
    duration_seconds: int = 0
    fish_caught: int = 0
    score_earned: int = 0
    coins_earned: int = 0
    coins_spent: int = 0
    stages_played: List[int] = Field(default_factory=list)
    events: List[Dict[str, Any]] = Field(default_factory=list)


class PlayerStats(BaseModel):
    """Comprehensive player statistics"""
    user_id: str
    # Lifetime stats
    total_sessions: int = 0
    total_playtime_seconds: int = 0
    total_fish_caught: int = 0
    total_score: int = 0
    total_coins_earned: int = 0
    total_coins_spent: int = 0
    total_gems_earned: int = 0
    total_gems_spent: int = 0
    # Records
    highest_score_session: int = 0
    highest_combo: int = 0
    biggest_fish_size: int = 0
    most_fish_one_session: int = 0
    longest_session_seconds: int = 0
    # Averages
    avg_score_per_session: float = 0.0
    avg_fish_per_session: float = 0.0
    avg_session_duration: float = 0.0
    # Counts by type
    fish_by_rarity: Dict[str, int] = Field(default_factory=dict)
    fish_by_type: Dict[str, int] = Field(default_factory=dict)
    stages_played_count: Dict[str, int] = Field(default_factory=dict)
    # Streaks
    current_daily_streak: int = 0
    max_daily_streak: int = 0
    # Social
    friends_count: int = 0
    gifts_sent: int = 0
    gifts_received: int = 0
    tournaments_entered: int = 0
    tournaments_won: int = 0


# ========== CRAFTING SYSTEM MODELS (250+ lines) ==========

class CraftingRecipe(BaseModel):
    """Crafting recipe"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    result_type: str  # lure, bait, rod_upgrade, cosmetic
    result_item_id: str
    result_quantity: int = 1
    ingredients: List[Dict[str, Any]] = Field(default_factory=list)
    crafting_time_seconds: int = 0
    required_level: int = 1
    required_workshop_level: int = 1
    success_rate: float = 1.0  # 0.0 to 1.0


class CraftingSlot(BaseModel):
    """Active crafting slot"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    slot_number: int
    recipe_id: Optional[str] = None
    started_at: Optional[str] = None
    completes_at: Optional[str] = None
    status: str = "empty"  # empty, crafting, completed, failed


class PlayerWorkshop(BaseModel):
    """Player's crafting workshop"""
    user_id: str
    workshop_level: int = 1
    unlocked_slots: int = 1
    slots: List[CraftingSlot] = Field(default_factory=list)
    discovered_recipes: List[str] = Field(default_factory=list)
    crafting_xp: int = 0


# ========== FISH BREEDING / EVOLUTION MODELS (200+ lines) ==========

class FishEvolution(BaseModel):
    """Fish evolution path"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    base_fish_type: str
    evolved_fish_type: str
    required_count: int  # Number of base fish needed
    required_level: int = 1
    special_requirements: Dict[str, Any] = Field(default_factory=dict)
    success_rate: float = 1.0
    evolution_time_seconds: int = 0


class FishBreeding(BaseModel):
    """Fish breeding attempt"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    fish_1_type: str
    fish_2_type: str
    possible_results: List[Dict[str, float]] = Field(default_factory=list)  # type: probability
    result_type: Optional[str] = None
    started_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completes_at: str
    status: str = "breeding"  # breeding, ready, claimed


class Aquarium(BaseModel):
    """Player's fish aquarium display"""
    user_id: str
    aquarium_level: int = 1
    max_fish: int = 10
    displayed_fish: List[str] = Field(default_factory=list)  # fish IDs
    decorations: List[str] = Field(default_factory=list)
    background: str = "default"
    visitors_today: int = 0
    total_visitors: int = 0
    coins_earned: int = 0


# ========== EVENT SYSTEM MODELS (200+ lines) ==========

class GameEvent(BaseModel):
    """Special game event"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    event_type: str  # seasonal, holiday, collaboration, anniversary
    theme: str
    start_time: str
    end_time: str
    banner_image: Optional[str] = None
    special_fish: List[str] = Field(default_factory=list)
    special_stages: List[int] = Field(default_factory=list)
    multipliers: Dict[str, float] = Field(default_factory=dict)
    event_currency: Optional[str] = None
    event_shop: List[str] = Field(default_factory=list)
    quests: List[str] = Field(default_factory=list)
    rewards: Dict[str, Any] = Field(default_factory=dict)


class PlayerEventProgress(BaseModel):
    """Player's event progress"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    event_id: str
    event_currency: int = 0
    event_score: int = 0
    milestones_reached: List[int] = Field(default_factory=list)
    rewards_claimed: List[str] = Field(default_factory=list)
    quests_completed: List[str] = Field(default_factory=list)


# ========== BAIT SYSTEM MODELS (150+ lines) ==========

class BaitType(BaseModel):
    """Type of bait"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    rarity: str = "common"
    effects: Dict[str, float] = Field(default_factory=dict)  # bite_chance, rare_chance, size_bonus
    target_fish: List[str] = Field(default_factory=list)  # Preferred fish types
    duration_casts: int = 10  # Number of casts before consumed
    price: int = 0
    currency: str = "coins"


class PlayerBaitInventory(BaseModel):
    """Player's bait inventory"""
    user_id: str
    baits: Dict[str, int] = Field(default_factory=dict)  # bait_id: quantity
    active_bait_id: Optional[str] = None
    active_bait_remaining: int = 0


# ========== FISHING SPOT SYSTEM MODELS (150+ lines) ==========

class FishingSpot(BaseModel):
    """Discoverable fishing spot"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    stage: int
    position: Dict[str, float] = Field(default_factory=dict)  # x, y coordinates
    discovery_requirement: str  # catch_count, fish_type, level, etc.
    discovery_value: Any
    special_fish: List[str] = Field(default_factory=list)
    bonuses: Dict[str, float] = Field(default_factory=dict)
    time_restriction: Optional[str] = None  # day, night, dusk, etc.
    weather_restriction: Optional[str] = None


class PlayerSpots(BaseModel):
    """Player's discovered spots"""
    user_id: str
    discovered_spots: List[str] = Field(default_factory=list)
    active_spot_id: Optional[str] = None
    spot_visits: Dict[str, int] = Field(default_factory=dict)


# ========== EXPORT ALL MODELS ==========

__all__ = [
    # Tournament
    "TournamentTier", "Tournament", "TournamentEntry", "TournamentResult",
    # Guild
    "GuildRank", "GuildMember", "Guild", "GuildApplication", "GuildChallenge",
    # Social
    "FriendRequest", "Friendship", "Gift", "ChatMessage",
    # Season Pass
    "SeasonPassTier", "SeasonPass", "PlayerSeasonPass",
    # Quest
    "QuestObjective", "Quest", "PlayerQuest",
    # Daily Rewards
    "DailyReward", "DailyRewardCalendar", "PlayerDailyRewards",
    # Lucky Wheel
    "WheelSlot", "LuckyWheel", "PlayerWheelSpin", "MysteryBox",
    # Energy
    "EnergyConfig", "PlayerEnergy",
    # Shop
    "ShopItem", "ShopBundle", "Purchase", "DailyDeal",
    # VIP
    "VIPTier", "PlayerVIP",
    # Notifications
    "Notification", "NotificationPreferences",
    # Analytics
    "PlayerSession", "PlayerStats",
    # Crafting
    "CraftingRecipe", "CraftingSlot", "PlayerWorkshop",
    # Fish Breeding
    "FishEvolution", "FishBreeding", "Aquarium",
    # Events
    "GameEvent", "PlayerEventProgress",
    # Bait
    "BaitType", "PlayerBaitInventory",
    # Fishing Spots
    "FishingSpot", "PlayerSpots",
]
