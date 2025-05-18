use criterion::{Bencher, Criterion, criterion_group, criterion_main};
use smol_str::SmolStr;

fn time_string_new(b: &mut Bencher) {
    b.iter(|| "test a string".to_string());
}

fn time_string_clone(b: &mut Bencher) {
    let s = "test a string".to_string();
    b.iter(|| s.clone());
}

fn time_smol_new(b: &mut Bencher) {
    b.iter(|| SmolStr::new_inline("test a string"));
}

fn time_smol_clone(b: &mut Bencher) {
    let s = SmolStr::new_inline("test a string");
    b.iter(|| s.clone());
}

fn bench_timestamps(c: &mut Criterion) {
    let mut std_group = c.benchmark_group("stdlib");
    std_group.bench_function("string_new", time_string_new);
    std_group.bench_function("string_clone", time_string_clone);
    std_group.finish();

    let mut quanta_group = c.benchmark_group("smol-str");
    quanta_group.bench_function("smol_new", time_smol_new);
    quanta_group.bench_function("smol_clone", time_smol_clone);
    quanta_group.finish();
}

criterion_group!(benches, bench_timestamps);
criterion_main!(benches);
