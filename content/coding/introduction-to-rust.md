---
title: Introduction to Rust
date: 2023-01-07
description: Rust is a fast, safe, and concurrent systems programming language that is quickly gaining popularity in the high frequency trading (HFT) community.
keywords: programming, rust
---

Rust is a systems programming language that was designed to be fast, safe, multi-threaded and concurrent.
In addition, it has a unique ownership and borrowing system that allows for efficient memory management without needing a garbage collector, which can reduce latencies and improve performance.

<a href="https://www.rust-lang.org/" target="_blank" rel="noopener">
<img src="https://www.rust-lang.org/logos/rust-logo-blk.svg" alt="Rust lang" style="float: right; margin: 10px; background-color: #fff; opacity: 0.5;" width="20%">
</a>

I've been using Rust for a while now (2018), and I find it to be a great language applications that require high performance and low latency.
It works well with other languages too, such as Python via [PyO3](https://pyo3.rs/), which means you can write performance-critical parts of your application in Rust
and expose them to Python for quick research/prototyping.

## Quick setup

- [Install rust](https://www.rust-lang.org/tools/install)
- Check version
  ```bash
  rustc --version
  ```
- To show active/installed toolchains
  ```bash
  rustup show
  ```
- To update rust nightly toolchain run
  ```bash
  rustup update nightly
  ```
- To update rust stable toolchain run
  ```bash
  rustup update stable
  ```
- To change the default toolchain to nightly
  ```bash
  rustup default nightly
  ```
- To install specific nightly toolchains
  ```bash
  rustup toolchain install nightly-2023-01-07
  ```
- Update dependencies in a package
  ```bash
  cargo update
  ```

## Useful dev packages

To install globally via
```bash
cargo install <package>
```

- [cargo-edit](https://github.com/killercup/cargo-edit) to add `cargo-add`, `cargo-rm`, `cargo-upgrade` commands
- [cargo-watch](https://crates.io/crates/cargo-watch) to watch for changes and reload during development
- [cargo-expand](https://github.com/dtolnay/cargo-expand) for macro expansion.
- [cargo-show-asm](https://github.com/pacak/cargo-show-asm) - cargo subcommand showing the assembly, LLVM-IR and MIR generated for Rust code

## References

Here are a few references for Rust programming:

- [Rust lang](https://www.rust-lang.org/) - entry point to rust language
- [Rust book](https://doc.rust-lang.org/book/) - how rust works and its paradigms
- [Rust source code](https://github.com/rust-lang/rust) - hosted on github
- [Rust reference](https://doc.rust-lang.org/reference/index.html) - for the syntax
- [Rust std](https://doc.rust-lang.org/std/index.html) - standard library documentation
- [Rust design patterns](https://rust-unofficial.github.io/patterns/) - design patterns, anti-patterns and idioms
- [Awesome Rust](https://github.com/rust-unofficial/awesome-rust) - a curated list of Rust code and resources
- [Scientific computing](http://www.arewelearningyet.com/scientific-computing/) - collections of crates for scientific computing
- [Rust Atomics and Locks](https://marabos.nl/atomics) by Mara Bos
