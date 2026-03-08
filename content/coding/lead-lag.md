---
title: Lead-lag
private: true
---

In financial markets, a "lead-lag" effect occurs when the price movements of one asset are followed by corresponding movements in another asset
after a certain time delay.
In the context of cryptocurrency, this could mean that a price increase in a major cryptocurrency like Bitcoin (the "leader")
is often followed by a similar price increase in an altcoin (the "lagger") a few seconds or minutes later.

For a trading bot, the goal is to:

* Identify a consistent lead-lag relationship: Determine if one of your chosen crypto assets reliably predicts the price movement of the other.
* Quantify the time lag: Measure the average delay between the leader's and the lagger's price movements.
* Develop a trading signal: Create a rule that triggers a trade on the lagging asset as soon as a specific price action is observed in the leading asset.
