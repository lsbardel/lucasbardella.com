---
title: Introduction to Rust
date: 2023-01-07
description: Rust is a fast, safe, and concurrent systems programming language that is quickly gaining popularity for writing HFT applications
keywords: programming, rust
---

<a href="https://www.rust-lang.org/" target="_blank" rel="noopener">
<img src="https://www.rust-lang.org/logos/rust-logo-blk.svg" alt="Rust lang" style="float: right; margin: 10px; background-color: #fff" width="30%">
</a>

High frequency trading (HFT) applications require extremely low latencies and high performance to ensure that trades are executed quickly and accurately. As a result, choosing the correct programming language is crucial for the success of an HFT system.

One language that is well-suited for HFT applications is Rust. Rust is a systems programming language that was designed to be fast, safe, and concurrent. In addition, it has a unique ownership and borrowing system that allows for efficient memory management without needing a garbage collector, which can reduce latencies and improve performance.

In addition to its performance benefits, Rust offers strong safety guarantees that can help prevent errors and reduce the risk of financial losses. Its macro system and rich standard library also make it a versatile language that can be used to build a wide range of applications.

## Quick setup

- [Install rust](https://www.rust-lang.org/tools/install)
- Check version: `rustc --version`
- To show active/installed toolchains `rustup show`
- To update rust run
  ```js
  rustup update nightly
  ```
- To update rust stable toolchain run
  To change the default toolchain `rustup` default nightly`
- To install specific nightly toolchains `rustup toolchain install nightly-2021-08-20`
- Update dependencies in a package `cargo update`

## Useful dev packages

To install globally via `cargo install <package>`

- [cargo-edit](https://github.com/killercup/cargo-edit) to add `cargo-add`, `cargo-rm`, `cargo-upgrade` commands
- [cargo-watch](https://crates.io/crates/cargo-watch) to watch for changes and reload during development
- [cargo-outdated](https://github.com/kbknapp/cargo-outdated) to check for outdated packages.
  Once installed, simply
  ```js
  cargo outdated
  ```
- [cargo-expand](https://github.com/dtolnay/cargo-expand) for macro expansion.

## References

Here are a few references for Rust programming:

- [Rust lang](https://www.rust-lang.org/) - entry point to rust language
- [Rust book](https://doc.rust-lang.org/book/) - how rust works and its paradigms
- [Rust source code](https://github.com/rust-lang/rust) - hosted on github
- [Rust reference](https://doc.rust-lang.org/reference/index.html) - for the syntax
- [Rust std](https://doc.rust-lang.org/std/index.html) - standard library documentation
- [Rust design patterns](https://rust-unofficial.github.io/patterns/) - a catalogue of Rust design patterns, anti-patterns and idioms
- [Awesome Rust](https://github.com/rust-unofficial/awesome-rust) - a curated list of Rust code and resources
- [Scientific computing](http://www.arewelearningyet.com/scientific-computing/) - collections of crates for scientific computing
