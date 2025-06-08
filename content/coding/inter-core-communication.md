---
title: Inter-core Communication in Rust
date: 2025-06-05
description: Inter-core communication is a key component in multi-threading Rust applications, especially in high-frequency trading systems.
keywords: programming, rust, seqlock
private: true
---

```js
import {FileAttachment} from "observablehq:stdlib";
import {GihubRepoLink} from "../../components/github.js";
const repos = FileAttachment("../../data/repos.json").json();
```

When developing multi-threaded applications in Rust, especially in high-frequency trading (HFT) systems, efficient inter-core communication is crucial. This article explores the various methods and libraries available in Rust for inter-core communication, focusing on performance and reliability.

```tsx
display(<GihubRepoLink repo={repos["nicholassm/disruptor-rs"]} />);
```

## Benchmarking

Measuring the performance of a data structure for inter-thread communication can be quite brittle and the results depend on many factors.

The [red hat low latency tuning guide](https://access.redhat.com/sites/default/files/attachments/201501-perf-brief-low-latency-tuning-rhel7-v1.1.pdf) provides a good overview of the challenges and techniques for benchmarking multi-threaded applications, including few tips on how to improve measurement accuracy.

## Sequential Lock

A [SeqLock](https://en.wikipedia.org/wiki/Seqlock) is a reader-writer lock that allows multiple readers to access a resource concurrently while ensuring that writers can update the resource without interference.

```tsx
display(<GihubRepoLink repo={repos["Amanieu/seqlock"]} />);
```

The key features of SeqLock include:

* it is a [reader-writer](https://en.wikipedia.org/wiki/Readers%E2%80%93writers_problem) - same as the standard [RwLock](https://doc.rust-lang.org/std/sync/struct.RwLock.html), but with a different implementation
* it is lock-free for readers - readers can access the resource without acquiring a lock, which reduces contention and avoids writer starvation
* allows multiple readers to read concurrently/independently
* allows a single writer to write at a time
* it only works for types that are [Copy](https://doc.rust-lang.org/std/marker/trait.Copy.html)


You can read further in this excellent resources

* [Rust Atomics and Locks](https://marabos.nl/atomics) by Mara Bos
* [Seqlock by Louis Ponet](https://louisponet.github.io/blog/posts/icc-1-seqlock/)
* [Writing a seqlock in Rust](https://pitdicker.github.io/Writing-a-seqlock-in-Rust/)
