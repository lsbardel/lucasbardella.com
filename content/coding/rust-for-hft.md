---
title: Rust for HFT
---


## What is HFT?

High-frequency trading (HFT) is a type of algorithmic trading that uses algorithms to transact a large number of orders at extremely high speeds. It is used by financial institutions, hedge funds, and proprietary trading firms to execute trades at microseconds level. HFT is a controversial practice that has been criticized for its potential to disrupt markets and create instability. However, it is also a highly profitable strategy that can generate significant returns for those who are able to execute it successfully.

## Multi threaded vs Single threaded

One of te key design decisions when developing an HFT system is whether to use a multi-threaded or single-threaded architecture. Multi-threaded systems can take advantage of multiple cores and processors to execute trades more quickly, but they can also be more complex to develop and maintain. Single-threaded systems are simpler and easier to debug, but they may not be able to achieve the same level of performance as multi-threaded systems.

In addition, the cost of inter-thread communication (80ns) is not negligible and can be a bottleneck in a multi-threaded system.

## SPSC queues

Single-producer, single-consumer (SPSC) queues are a type of lock-free data structure that can be used to pass messages between threads in a multi-threaded system. SPSC queues are designed to be fast and efficient, with low latency and high throughput. They are well-suited for use in HFT systems, where speed and performance are critical.

For example, once could use a separate thread to perform the application logging. In other words, you could have an HFT bot running the main business logic on one thread which write logs to SPSC queue (log producer). The logging threads consumes the logs from the queue and writes them to disk (log consumer).


* [The coded message](https://www.thecodedmessage.com/)
* [Rust: A Better C++ Than C++](https://www.thecodedmessage.com/rust-c-book/)
