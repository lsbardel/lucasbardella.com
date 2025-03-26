---
title: Rust for HFT
description: High-frequency trading (HFT) design patterns in Rust
date: 2025 March 25
---

```js
import {FileAttachment} from "observablehq:stdlib";
import {GihubRepoLink} from "../../components/github.js";
const repos = FileAttachment("../../data/repos.json").json();
```

## What is HFT?

High-frequency trading (HFT) is a type of electronic trading that uses algorithms to transact a large number of orders at extremely high speeds. It is used by financial institutions, hedge funds, and proprietary trading firms to execute trades at microseconds level. HFT is a controversial practice that has been criticized for its potential to disrupt markets and create instability. However, it is also a highly profitable strategy that can generate significant returns for those who are able to execute it successfully.

## Why Rust for HFT?

<a href="https://www.rust-lang.org/" target="_blank" rel="noopener">
<img src="https://www.rust-lang.org/logos/rust-logo-blk.svg" alt="Rust lang" style="float: right; margin: 10px; background-color: #fff; opacity: 0.5;" width="20%">
</a>
Rust is a systems programming language that is designed for performance, reliability, and safety. It is well-suited for use in HFT systems, where speed and performance are critical. Rust's memory safety guarantees and zero-cost abstractions make it an ideal choice for developing low-latency trading systems that can execute trades quickly and efficiently.

Having said that, C++ is by far the most popular language for HFT systems.
Most established trading houses have large, highly-tuned, money-generating codebases in C++ and it would be a huge and risky endeavour to port them over to Rust, especially when the performance implications are perhaps not well understood. It will take time and it might not happen.

However, Rust is gaining popularity in the financial industry due to its safety features and modern design. Rust is also easier to learn and use than C++, which can make it a more attractive option for developers who are new to HFT.

Both Rust and C/C++ don't have [garbage collectors](https://en.wikipedia.org/wiki/Garbage_collection_(computer_science)), which is a big advantage in HFT systems where latency is critical. The garbage collector can introduce unpredictable pauses in the execution of the program, which can lead to missed trades and lost profits.

## General Rules for HFT

When writing HFT systems, there are a few general rules that you should follow to ensure that your system is fast, reliable, and efficient.

* Memory operations tend to be quite expensive compared to arithmetic operations. Therefore, it is important to minimize the number of memory operations in your code. This can be achieved by using stack memory instead of heap memory, and by avoiding unnecessary allocations and deallocations. Think about [Copy](https://doc.rust-lang.org/std/marker/trait.Copy.html) vs [Clone](https://doc.rust-lang.org/std/clone/trait.Clone.html) traits in Rust.
* IO operations, such as writing or reading to disk or to a network socket, are also expensive. It is important to minimize the number of IO operations in the crytical path of your HFT code.

## Multi threaded vs Single threaded

One of the key design decisions when developing an HFT system is whether to use a multi-threaded or single-threaded architecture. Multi-threaded systems can take advantage of multiple cores and processors to execute trades more quickly, but they can also be more complex to develop and maintain. Single-threaded systems are simpler and easier to debug, but they may not be able to achieve the same level of performance as multi-threaded systems.

In addition, the cost of inter-thread communication (~100ns) is not negligible and can be a bottleneck in a multi-threaded system.

Multi-threaded system are the norm in HFT system, but one must be aware of the trade-offs and therefore carefully design the system with as few threads communicating as possible.

## SPSC Queues

Single-producer, single-consumer (SPSC) queues are a type of lock-free data structure that can be used to pass messages between two threads in a multi-threaded system. SPSC queues are designed to be fast and efficient, with low latency and high throughput.

Rusts has few libraries that implement SPSC queues


```tsx
display(<GihubRepoLink repo={repos["mgeier/rtrb"]} />);
```
```tsx
display(<GihubRepoLink repo={repos["agerasev/ringbuf"]} />);
```
```tsx
display(<GihubRepoLink repo={repos["erenon/cueue"]} />);
```

An example where SPSC queues are very useful is separation of logic. For example, one could use a separate thread to perform the application logging. In other words, you could have an HFT bot running the main business logic on one thread which write logs to SPSC queue (log producer). The logging threads consumes the logs from the queue consumer and writes them to disk (or wherever is desired).

```mermaid
flowchart TB
    P --> C
    subgraph Main Thread
      direction TB
      A[Biz Logic] --> P[SPSC Producer]
    end
    subgraph Logging Thread
      direction TB
      C[SPSC Consumer] --> L[logger]
    end

    style P fill:#386641
    style C fill:#386641
```

Most SPSC queues are implemented using a FIFO [ring buffer](https://en.wikipedia.org/wiki/Circular_buffer), which is a circular buffer that can be used to store a **fixed number** of elements. Ring buffers are fast and efficient, with constant-time access to elements and no need for locks or other synchronization mechanisms.

<hr>

* [The coded message](https://www.thecodedmessage.com/)
* [Rust: A Better C++ Than C++](https://www.thecodedmessage.com/rust-c-book/)
* [Fast Logging for HFT In Rust](https://markrbest.github.io/fast-logging-in-rust/)
* [Louis Ponet blog](https://louisponet.github.io/blog/)
