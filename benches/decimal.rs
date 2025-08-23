use criterion::{Bencher, Criterion, criterion_group, criterion_main};
use rust_decimal::prelude::*;

fn f64_decimal_divide(value: &Decimal, den: &Decimal) -> Decimal {
    Decimal::from_f64(value.to_f64().unwrap() / den.to_f64().unwrap()).unwrap()
}

fn f32_decimal_divide(value: &Decimal, den: &Decimal) -> Decimal {
    Decimal::from_f32(value.to_f32().unwrap() / den.to_f32().unwrap()).unwrap()
}

fn f64_decimal_sqrt(value: &Decimal) -> Decimal {
    Decimal::from_f64(value.to_f64().unwrap().sqrt()).unwrap()
}

fn f32_decimal_sqrt(value: &Decimal) -> Decimal {
    Decimal::from_f32(value.to_f32().unwrap().sqrt()).unwrap()
}

fn f64_decimal_ln(value: &Decimal) -> Decimal {
    Decimal::from_f64(value.to_f64().unwrap().ln()).unwrap()
}

fn f32_decimal_ln(value: &Decimal) -> Decimal {
    Decimal::from_f32(value.to_f32().unwrap().ln()).unwrap()
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

fn divide_decimal(b: &mut Bencher) {
    let value = Decimal::from_str("50000.0").unwrap();
    let divisor = Decimal::from_str("8.0").unwrap();
    b.iter(|| value / divisor);
}

fn divide_decimal_f32(b: &mut Bencher) {
    let value = Decimal::from_str("50000.0").unwrap();
    let divisor = Decimal::from_str("8.0").unwrap();
    b.iter(|| f32_decimal_divide(&value, &divisor));
}

fn divide_decimal_f64(b: &mut Bencher) {
    let value = Decimal::from_f64(50000.0).unwrap();
    let divisor = Decimal::from_f64(8.0).unwrap();
    b.iter(|| f64_decimal_divide(&value, &divisor));
}

fn log_decimal(b: &mut Bencher) {
    let value = Decimal::from_str("50000.0").unwrap();
    b.iter(|| value.ln());
}

fn log_decimal_f32(b: &mut Bencher) {
    let value = Decimal::from_str("50000.0").unwrap();
    b.iter(|| f32_decimal_ln(&value));
}

fn log_decimal_f64(b: &mut Bencher) {
    let value = Decimal::from_f64(50000.0).unwrap();
    b.iter(|| f64_decimal_ln(&value));
}

fn bench_sqrt(c: &mut Criterion) {
    let mut sqrt_group = c.benchmark_group("decimal-sqrt");
    sqrt_group.bench_function("sqrt_f32", sqrt_f32);
    sqrt_group.bench_function("sqrt_f64", sqrt_f64);
    sqrt_group.bench_function("sqrt_decimal", sqrt_decimal);
    sqrt_group.bench_function("sqrt_decimal_f32", sqrt_decimal_f32);
    sqrt_group.bench_function("sqrt_decimal_f64", sqrt_decimal_f64);
    sqrt_group.finish();

    let mut divide_group = c.benchmark_group("decimal-divide");
    divide_group.bench_function("divide_decimal", divide_decimal);
    divide_group.bench_function("divide_decimal_f32", divide_decimal_f32);
    divide_group.bench_function("divide_decimal_f64", divide_decimal_f64);
    divide_group.finish();

    let mut log_group = c.benchmark_group("decimal-log");
    log_group.bench_function("log_decimal", log_decimal);
    log_group.bench_function("log_decimal_f32", log_decimal_f32);
    log_group.bench_function("log_decimal_f64", log_decimal_f64);
    log_group.finish();
}

criterion_group!(benches, bench_sqrt);
criterion_main!(benches);
