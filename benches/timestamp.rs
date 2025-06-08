use criterion::{Bencher, Criterion, criterion_group, criterion_main};
use lsrs::timestamp::*;
use quanta::Clock;
use std::time::Instant as StdInstant;

fn time_std_instant_now(b: &mut Bencher) {
    b.iter(StdInstant::now)
}

fn time_std_now(b: &mut Bencher) {
    b.iter(Timestamp::system_utcnow)
}

fn time_quanta_instant_now(b: &mut Bencher) {
    let clock = Clock::new();
    b.iter(|| clock.now())
}

fn time_quanta_factory_utcnow(b: &mut Bencher) {
    let factory = QuantaTimestampFactory::default();
    b.iter(|| factory.get_timestamp())
}

fn time_quanta_utcnow(b: &mut Bencher) {
    b.iter(Timestamp::utcnow)
}

fn bench_timestamps(c: &mut Criterion) {
    let mut std_group = c.benchmark_group("stdlib");
    std_group.bench_function("std_instant_now", time_std_instant_now);
    std_group.bench_function("std_now", time_std_now);
    std_group.finish();

    let mut quanta_group = c.benchmark_group("quanta");
    quanta_group.bench_function("quanta_instant_now", time_quanta_instant_now);
    quanta_group.bench_function("quanta_factory_utcnow", time_quanta_factory_utcnow);
    quanta_group.bench_function("quanta_utcnow", time_quanta_utcnow);
    quanta_group.finish();
}

criterion_group!(benches, bench_timestamps);
criterion_main!(benches);
