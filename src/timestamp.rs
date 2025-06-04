use quanta::Clock;
use std::time::{SystemTime, UNIX_EPOCH};


pub trait TimestampFactory {
    fn get_timestamp(&self) -> Timestamp;
}

pub struct QuantaTimestampFactory {
    clock: Clock,
    system_time: u64,
    clock_time: u64,
}


pub fn system_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_nanos() as u64
}

impl Default for QuantaTimestampFactory {
    fn default() -> Self {
        Self::from_clock(Clock::new())
    }
}

impl TimestampFactory for QuantaTimestampFactory {
    fn get_timestamp(&self) -> Timestamp {
        let nanos = self.clock.delta_as_nanos(self.clock_time, self.clock.raw());
        Timestamp(self.system_time + nanos)
    }
}

impl QuantaTimestampFactory {
    pub fn from_clock(clock: Clock) -> Self {
        Self {
            system_time: system_timestamp(),
            clock_time: clock.raw(),
            clock,
        }
    }
}

pub struct Timestamp(u64);


impl Timestamp {
    pub fn utcnow() -> Self {
        Self(system_timestamp())
    }

    pub fn nanos(&self) -> u64 {
        self.0
    }

    pub fn micros(&self) -> u64 {
        self.0 / 1_000
    }

    pub fn millis(&self) -> u64 {
        self.0 / 1_000_000
    }
}



#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_timestamp() {
        let factory = QuantaTimestampFactory::default();
        let system_ts = Timestamp::utcnow();
        let quanta_ts = factory.get_timestamp();
        assert_eq!(quanta_ts.millis(), system_ts.millis());
    }
}
