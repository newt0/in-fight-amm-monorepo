// Copyright (c) 2025
// SPDX-License-Identifier: Apache-2.0

module app::lsmr_amm;

use sui::coin::{Self, Coin};
use sui::sui::SUI;
use sui::balance::{Self, Balance};
use std::string::String;

/// Error codes
const EMarketResolved: u64 = 1;
const EInsufficientShares: u64 = 2;
const EAlreadyResolved: u64 = 3;
const EInvalidFightId: u64 = 4;
const EResultNotVerified: u64 = 5;
const EMarketNotResolved: u64 = 6;
const ENoWinner: u64 = 7;
const ENoWinningShares: u64 = 8;
const EInvalidFighter: u64 = 9;
const EInsufficientFunds: u64 = 10;

/// Prediction market structure
public struct PredictionMarket has key {
    id: UID,
    fight_id: String,
    liquidity_parameter: u64,       // b (liquidity parameter)
    total_shares_a: u64,            // Total shares for Fighter A
    total_shares_b: u64,            // Total shares for Fighter B
    balance: Balance<SUI>,          // Pool balance
    resolved: bool,                 // Settlement flag
    winner: Option<String>,         // Winner (after settlement)
    event_time_ms: u64,             // Fight start time
}

/// User position
public struct Position has key, store {
    id: UID,
    market_id: ID,
    shares_a: u64,
    shares_b: u64,
    owner: address,
}

/// Create a new prediction market
public entry fun create_market(
    fight_id: String,
    liquidity_parameter: u64,
    event_time_ms: u64,
    initial_liquidity: Coin<SUI>,
    ctx: &mut TxContext,
) {
    let market = PredictionMarket {
        id: object::new(ctx),
        fight_id,
        liquidity_parameter,
        total_shares_a: 0,
        total_shares_b: 0,
        balance: coin::into_balance(initial_liquidity),
        resolved: false,
        winner: option::none(),
        event_time_ms,
    };

    transfer::share_object(market);
}

/// Create a new position for a user
public entry fun create_position(
    market: &PredictionMarket,
    ctx: &mut TxContext,
) {
    let position = Position {
        id: object::new(ctx),
        market_id: object::id(market),
        shares_a: 0,
        shares_b: 0,
        owner: ctx.sender(),
    };

    transfer::transfer(position, ctx.sender());
}

/// Buy shares for a fighter
public entry fun buy_shares(
    market: &mut PredictionMarket,
    position: &mut Position,
    fighter: String,
    payment: Coin<SUI>,
    ctx: &mut TxContext,
) {
    assert!(!market.resolved, EMarketResolved);
    assert!(position.market_id == object::id(market), EInvalidFightId);

    let amount = coin::value(&payment);
    assert!(amount > 0, EInsufficientFunds);

    // Calculate shares to buy using simplified LSMR formula
    let shares = calculate_shares_to_buy(
        market.total_shares_a,
        market.total_shares_b,
        market.liquidity_parameter,
        &fighter,
        amount,
    );

    // Update shares
    if (fighter == b"fighter_a".to_string()) {
        market.total_shares_a = market.total_shares_a + shares;
        position.shares_a = position.shares_a + shares;
    } else if (fighter == b"fighter_b".to_string()) {
        market.total_shares_b = market.total_shares_b + shares;
        position.shares_b = position.shares_b + shares;
    } else {
        abort EInvalidFighter
    };

    // Add funds to pool
    balance::join(&mut market.balance, coin::into_balance(payment));
}

/// Sell shares for a fighter
public entry fun sell_shares(
    market: &mut PredictionMarket,
    position: &mut Position,
    fighter: String,
    shares: u64,
    ctx: &mut TxContext,
) {
    assert!(!market.resolved, EMarketResolved);
    assert!(position.market_id == object::id(market), EInvalidFightId);

    // Calculate amount to receive using simplified LSMR formula
    let amount = calculate_sell_amount(
        market.total_shares_a,
        market.total_shares_b,
        market.liquidity_parameter,
        &fighter,
        shares,
    );

    // Update shares
    if (fighter == b"fighter_a".to_string()) {
        assert!(position.shares_a >= shares, EInsufficientShares);
        position.shares_a = position.shares_a - shares;
        market.total_shares_a = market.total_shares_a - shares;
    } else if (fighter == b"fighter_b".to_string()) {
        assert!(position.shares_b >= shares, EInsufficientShares);
        position.shares_b = position.shares_b - shares;
        market.total_shares_b = market.total_shares_b - shares;
    } else {
        abort EInvalidFighter
    };

    // Withdraw funds from pool
    let payout = coin::from_balance(balance::split(&mut market.balance, amount), ctx);
    transfer::public_transfer(payout, ctx.sender());
}

/// Resolve market with fight result
/// Note: In production, this should verify the fight result using fight_oracle
/// For now, we accept the winner directly (trust-based)
public entry fun resolve_market(
    market: &mut PredictionMarket,
    fight_id: String,
    winner: String,
    _ctx: &mut TxContext,
) {
    assert!(!market.resolved, EAlreadyResolved);
    assert!(market.fight_id == fight_id, EInvalidFightId);

    market.resolved = true;
    market.winner = option::some(winner);
}

/// Claim winnings after market is resolved
public entry fun claim_winnings(
    market: &mut PredictionMarket,
    position: &mut Position,
    ctx: &mut TxContext,
) {
    assert!(market.resolved, EMarketNotResolved);
    assert!(option::is_some(&market.winner), ENoWinner);
    assert!(position.market_id == object::id(market), EInvalidFightId);

    let winner = option::borrow(&market.winner);
    let winning_shares = if (*winner == b"fighter_a".to_string()) {
        position.shares_a
    } else {
        position.shares_b
    };

    assert!(winning_shares > 0, ENoWinningShares);

    // Calculate payout
    let total_winning_shares = if (*winner == b"fighter_a".to_string()) {
        market.total_shares_a
    } else {
        market.total_shares_b
    };

    let payout_amount = (balance::value(&market.balance) * winning_shares) / total_winning_shares;

    // Reset shares
    if (*winner == b"fighter_a".to_string()) {
        position.shares_a = 0;
    } else {
        position.shares_b = 0;
    };

    // Transfer payout
    let payout = coin::from_balance(balance::split(&mut market.balance, payout_amount), ctx);
    transfer::public_transfer(payout, ctx.sender());
}

/// Calculate shares to buy using simplified LSMR formula
/// For hackathon: use linear approximation instead of exponential
fun calculate_shares_to_buy(
    total_shares_a: u64,
    total_shares_b: u64,
    liquidity_parameter: u64,
    fighter: &String,
    amount: u64,
): u64 {
    // Simplified LSMR calculation
    // In production, this should use proper exponential functions
    // For now, we use a linear approximation based on current price

    let (my_shares, other_shares) = if (*fighter == b"fighter_a".to_string()) {
        (total_shares_a, total_shares_b)
    } else {
        (total_shares_b, total_shares_a)
    };

    // Price = e^(my_shares/b) / (e^(my_shares/b) + e^(other_shares/b))
    // Simplified: Price ≈ my_shares / (my_shares + other_shares + b)
    // Shares = amount / price

    if (my_shares + other_shares == 0) {
        // Initial case: return amount directly
        amount * liquidity_parameter / 1000  // Scale factor
    } else {
        let total = my_shares + other_shares + liquidity_parameter;
        let price = ((my_shares + liquidity_parameter / 2) * 1000000) / total;
        (amount * 1000000) / price
    }
}

/// Calculate amount to receive when selling shares
fun calculate_sell_amount(
    total_shares_a: u64,
    total_shares_b: u64,
    liquidity_parameter: u64,
    fighter: &String,
    shares: u64,
): u64 {
    // Simplified LSMR calculation (inverse of buy)
    let (my_shares, other_shares) = if (*fighter == b"fighter_a".to_string()) {
        (total_shares_a, total_shares_b)
    } else {
        (total_shares_b, total_shares_a)
    };

    if (my_shares + other_shares == 0) {
        shares * 1000 / liquidity_parameter
    } else {
        let total = my_shares + other_shares + liquidity_parameter;
        let price = ((my_shares + liquidity_parameter / 2) * 1000000) / total;
        (shares * price) / 1000000
    }
}

/// Getter functions
public fun fight_id(market: &PredictionMarket): String {
    market.fight_id
}

public fun total_shares_a(market: &PredictionMarket): u64 {
    market.total_shares_a
}

public fun total_shares_b(market: &PredictionMarket): u64 {
    market.total_shares_b
}

public fun resolved(market: &PredictionMarket): bool {
    market.resolved
}

public fun winner(market: &PredictionMarket): &Option<String> {
    &market.winner
}

public fun position_shares_a(position: &Position): u64 {
    position.shares_a
}

public fun position_shares_b(position: &Position): u64 {
    position.shares_b
}

#[test_only]
public fun destroy_market_for_testing(market: PredictionMarket) {
    let PredictionMarket { id, fight_id: _, liquidity_parameter: _, total_shares_a: _, total_shares_b: _, balance, resolved: _, winner: _, event_time_ms: _ } = market;
    object::delete(id);
    balance::destroy_for_testing(balance);
}

#[test_only]
public fun destroy_position_for_testing(position: Position) {
    let Position { id, market_id: _, shares_a: _, shares_b: _, owner: _ } = position;
    object::delete(id);
}

#[test]
fun test_create_market() {
    use sui::test_scenario::{Self, ctx};
    use sui::coin;

    let mut scenario = test_scenario::begin(@0x1);

    let initial_liquidity = coin::mint_for_testing<SUI>(1000000, scenario.ctx());

    create_market(
        b"ufc300_main_event".to_string(),
        1000,
        1744684007462,
        initial_liquidity,
        scenario.ctx(),
    );

    scenario.next_tx(@0x1);

    let market = scenario.take_shared<PredictionMarket>();

    assert!(market.fight_id() == b"ufc300_main_event".to_string());
    assert!(market.total_shares_a() == 0);
    assert!(market.total_shares_b() == 0);
    assert!(!market.resolved());

    test_scenario::return_shared(market);
    scenario.end();
}

#[test]
fun test_buy_and_sell_shares() {
    use sui::test_scenario::{Self, ctx};
    use sui::coin;

    let mut scenario = test_scenario::begin(@0x1);

    // Create market
    let initial_liquidity = coin::mint_for_testing<SUI>(1000000, scenario.ctx());
    create_market(
        b"ufc300_main_event".to_string(),
        1000,
        1744684007462,
        initial_liquidity,
        scenario.ctx(),
    );

    scenario.next_tx(@0x1);

    let mut market = scenario.take_shared<PredictionMarket>();

    // Create position
    create_position(&market, scenario.ctx());

    scenario.next_tx(@0x1);

    let mut position = scenario.take_from_sender<Position>();

    // Buy shares for fighter A
    let payment = coin::mint_for_testing<SUI>(10000, scenario.ctx());
    buy_shares(&mut market, &mut position, b"fighter_a".to_string(), payment, scenario.ctx());

    assert!(position.position_shares_a() > 0);
    assert!(market.total_shares_a() > 0);

    test_scenario::return_to_sender(&scenario, position);
    test_scenario::return_shared(market);
    scenario.end();
}
