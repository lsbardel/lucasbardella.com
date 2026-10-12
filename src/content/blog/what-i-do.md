---
title: What I Actually Do
description: I am an algorithmic trader. I watch markets, design trading strategies and manage risk, and I direct AI agents and engineering teams to test and build them.
date: 2026-10-10
private: true
keywords: algorithmic trading, market making, risk management, macroeconomics, trading strategies, backtesting, ai agents, quantitative trading, trading venues
toc: true
heroImage: adriatic
heroOpacity: "0.7"
heroShade: "0.35"
---

When people ask what I do, I usually say I work in algorithmic trading. Most of them nod and file me under software engineer. It is an understandable guess: my GitHub is public, I talk about Rust and Python, and for a large part of my career writing code was a big share of the job. It is still the wrong picture.

Code is one part of what I do, and these days a small one. I write very little of it myself. Most of my time goes into watching markets, designing new trading strategies, looking at new trading venues, instructing AI agents to backtest ideas, and working with the team to build new integrations. What ties all of that together is not programming, it is domain knowledge in algorithmic trading, risk management and macroeconomics.

This post is an attempt to explain that job to the people who know me, and to anyone curious about what an algorithmic trader actually does now that AI agents can write most of the code.

## The Misconception

From the outside, algorithmic trading looks like software. The strategies run as programs, the trading happens through APIs, and the people involved spend their day in front of terminals and charts. If the visible output of the work is a system, it is natural to assume the work is building systems.

My background reinforces it. I have led engineering teams, been a CTO twice, and spent years building trading infrastructure. The [CV](/cv) reads like a technology career, and the technology is real.

What the CV does not show clearly is the thread running through it. Before any of the engineering roles I was a quantitative analyst and trader at [Nomura](https://www.nomura.com/), then a strategist and an option trader at hedge funds. The engineering was always in service of trading. The systems exist because a strategy needs to run somewhere.

## Algorithmic Trading

Algorithmic trading means expressing a view on the market as rules that a computer executes. The rules decide when to buy and sell, at what price, in what size, and when to stop.

A large part of my work is market making, which means continuously quoting prices to buy and to sell, and earning the difference between the two while managing the inventory that builds up. As I describe on the [now page](/now), I currently lead a team of engineers and researchers providing liquidity on a centralized exchange, across the order book, RFQs and Backstop Liquidity Provision. If you want to see what an order book looks like in real time, the [live order book](/lab/2026/order-book) in the lab streams one into the browser.

The hard part is never the act of sending an order. The hard part is knowing which prices to quote, how much risk to carry, and what to do when the market moves against you.

## My Time

### Markets

A lot of the job is simply paying attention. Markets change character: liquidity moves between venues, volatility comes and goes, and behaviour that was profitable last month can quietly stop working. Noticing those shifts early, and understanding why they happen, is where most good ideas start.

Many of those shifts are macroeconomic. Interest rates, inflation, central bank decisions and the flow of capital between asset classes set the backdrop every strategy trades against. A market making model does not know that a rate decision is coming, so someone has to.

### Strategies

An observation becomes useful when it turns into a strategy. That means deciding how to quote, how to hedge, how much inventory to hold and where the risk limits sit. This is design work, and it depends on knowing how markets behave far more than on knowing how to code.

### Venues

Every exchange and liquidity venue has its own rules, fee structure, order types and quirks. A new venue can be an opportunity or a trap, and telling the two apart takes experience. Deciding where to trade is as much a part of the strategy as deciding how.

### Backtesting

This is where the job has changed the most. When I have an idea, I no longer write the backtest myself. I describe the hypothesis, the data, the assumptions and the pitfalls to an AI agent, and the agent writes and runs the test.

The agent is fast, but it does not know which questions matter. It will not tell you on its own that a result depends on fills you would never get, or that a strategy only worked in one regime. Knowing what to ask for, and knowing when a good looking result is too good to be true, is still my job.

### Integrations

Ideas and venues need to become production systems: market data feeds, exchange connectivity, order management and monitoring. I work with the team to define what needs to be built and why, and to review whether what was built actually behaves like the strategy requires. The team, like me, leans heavily on AI coding agents to ship it.

## Risk Management

If there is one thing that defines the work, it is risk management. A trading strategy is a set of decisions about how to take risk, and a trading system is a machine that takes that risk automatically, at speed, without asking anyone first.

That changes how every other activity looks. Watching markets means watching for what could hurt the positions. Designing a strategy means designing its limits as carefully as its signals. Integrating a new venue means understanding what happens when it misbehaves. None of this is a software problem, even though software is how it gets enforced.

## Less Code

AI agents have changed what my day looks like. A few years ago, testing an idea meant writing the code to test it, and building an integration meant a long stretch of implementation. Today agents do most of that work, and they do it quickly.

That has not made the job easier, it has moved the effort. When writing code is cheap, the expensive part becomes knowing what to write. The value is in specifying the right experiment, recognising a flawed result, and deciding what is safe to put into production.

## Domain Knowledge

Think of research as a pipeline. An idea comes in, it gets turned into a precise question, the question becomes code, the code produces a result, the result gets judged, and the few ideas that survive go into production. For most of my career the slow step was the code. Writing a backtest or an exchange integration took days or weeks, so only a handful of ideas ever made it through.

AI agents have collapsed that step. The code now takes minutes. The pipeline did not get infinitely fast, though. The constraint moved to the steps on either side of the code, and both of them run on domain knowledge.

### The Question

An agent does exactly what it is asked. Ask it whether a quoting strategy would have made money and it will answer that question, even if it is the wrong one. The useful question is usually narrower and harder to state: would it have made money after fees, at the queue position we would realistically get, against counterparties who trade with us precisely when we are wrong?

Framing that question needs an understanding of how a strategy earns money and how it loses it. Nothing in the data says what to look for. The specification is where the trading knowledge goes in, and a vague specification produces a precise answer to the wrong problem.

### The Result

The second constraint is evaluating what comes back. A backtest is a model of the market, and every model leaves something out. The usual suspects are fills that would never have happened, latency that was ignored, costs that were underestimated, and a strategy that only worked in one market regime.

An agent will rarely flag these on its own, and when results come back quickly it becomes very easy to accept a good looking curve. The faster the agents run, the more results land on my desk, and each one still needs someone who can tell a real edge from an artefact of the test. That judgment does not scale with compute.

### Beyond the Data

Some of what matters never appears in a dataset. How a venue behaves when it is under stress, how its matching engine treats certain order types, what happens to liquidity around a specific event, how a counterparty reacts when you change your quotes. This is learned by trading, often by losing money, and an agent working from the data alone has no way to know it.

### Going Live

Finally, someone has to decide that a strategy is ready to trade real money, with real limits, unattended. That is a risk decision, not a technical one. It means asking what the worst plausible day looks like, what happens if a feed goes stale or an exchange stops responding, and whether the limits will hold when they matter. Getting this wrong is far more expensive than any bug.

These four steps are where the bottleneck now sits. AI multiplies the number of ideas that can be tested, but each one still has to pass through a person who knows which questions to ask and which answers to distrust. My edge is that knowledge, built over years of trading and managing risk across fixed income derivatives, macro strategies in rates and currency volatility, sport exchanges, crypto and commodities.

## Conclusion

So, I am not really a software engineer, and I never was. I am an algorithmic trader, and software is the medium the trading is expressed in. AI agents have made that medium cheap, and that has made the rest of the job more visible, not less important.

When anyone can produce a backtest in minutes, a backtest stops being worth much on its own. What is worth something is knowing which backtest to run, which result to throw away, and which strategy is safe to leave running overnight. That is the work I spend my days on: watching markets, designing strategies, choosing venues, directing agents and working with the team, with risk management sitting underneath all of it.

I think this shift applies well beyond trading. As writing code gets cheaper, deep knowledge of a domain becomes the scarce input, and the people who have it can test and ship far more than before. The bottleneck has moved from writing code to judgment.

If you want to know what I am working on right now, the [now page](/now) is kept up to date. For a deeper look at the technology side, there is a post on [Rust for high frequency trading](/coding/2025/rust-for-hft).

And when I step away from the markets, you will most likely find me diving in the Adriatic sea, which is what the photo at the top is about.
