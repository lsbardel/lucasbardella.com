use criterion::{Bencher, Criterion, criterion_group, criterion_main};
use rust_decimal::prelude::*;

fn f64_decimal_sqrt(value: &Decimal) -> Decimal {
    Decimal::from_f64(value.to_f64().unwrap().sqrt()).unwrap()
}

fn f32_decimal_sqrt(value: &Decimal) -> Decimal {
    Decimal::from_f32(value.to_f32().unwrap().sqrt()).unwrap()
}

fn sqrt_f32(b: &mut Bencher) {
    let value = 50000f32;
    b.iter(|| value.sqrt());
}

fn sqrt_f64(b: &mut Bencher) {
    let value = 50000f64;
    b.iter(|| value.sqrt());
}

fn sqrt_decimal(b: &mut Bencher) {
    let value = Decimal::from_str("50000.0").unwrap();
    b.iter(|| value.sqrt());
}

fn sqrt_decimal_f32(b: &mut Bencher) {
    let value = Decimal::from_str("50000.0").unwrap();
    b.iter(|| f32_decimal_sqrt(&value));
}

fn sqrt_decimal_f64(b: &mut Bencher) {
    let value = Decimal::from_f64(50000.0).unwrap();
    b.iter(|| f64_decimal_sqrt(&value));
}

fn bench_sqrt(c: &mut Criterion) {
    let mut std_group = c.benchmark_group("sqrt");
    std_group.bench_function("sqrt_f32", sqrt_f32);
    std_group.bench_function("sqrt_f64", sqrt_f64);
    std_group.bench_function("sqrt_decimal", sqrt_decimal);
    std_group.bench_function("sqrt_decimal_f32", sqrt_decimal_f32);
    std_group.bench_function("sqrt_decimal_f64", sqrt_decimal_f64);
    std_group.finish();
}

criterion_group!(benches, bench_sqrt);
criterion_main!(benches);
