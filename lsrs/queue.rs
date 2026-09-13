

pub enum QueueType {
    /// Single Producer, Multiple Consumer
    SpMc,
    /// Multiple Producer, Multiple Consumer
    MpMc,
}


pub trait Queue<T> {
    fn push(&mut self, item: T) -> Result<(), String>;
    fn pop(&mut self) -> Option<T>;
    fn is_empty(&self) -> bool;
    fn len(&self) -> usize;
}


pub struct Queue<T> {
    queue_type: QueueType,
    inner: Box<dyn Queue<T>>,
}
