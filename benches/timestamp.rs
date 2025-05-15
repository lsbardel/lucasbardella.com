use criterion::{criterion_group, criterion_main, Criterion, Bencher};
use quanta::{Clock};
use lsrs::timestamp::*;
use std::time::Instant as StdInstant;

fn time_std_instant_now(b: &mut Bencher) {
    b.iter(StdInstant::now)
}

fn time_std_now(b: &mut Bencher) {
    b.iter(Timestamp::utcnow)
}

fn time_quanta_instant_now(b: &mut Bencher) {
    let clock = Clock::new();
    b.iter(|| clock.now())
}

fn time_quanta_now(b: &mut Bencher) {
    let factory = QuantaTimestampFactory::default();
    b.iter(|| factory.get_timestamp())
}

fn bench_timestamps(c: &mut Criterion) {
    let mut std_group = c.benchmark_group("stdlib");
    std_group.bench_function("std_instant_now", time_std_instant_now);
    std_group.bench_function("std_now", time_std_now);
    std_group.finish();

    let mut quanta_group = c.benchmark_group("quanta");
    quanta_group.bench_function("quanta_instant_now", time_quanta_instant_now);
    quanta_group.bench_function("quanta_now", time_quanta_now);
    quanta_group.finish();
}


criterion_group!(benches, bench_timestamps);
criterion_main!(benches);
