import { timeFormat } from "d3-time-format";

export const startDate = new Date();
startDate.setDate(startDate.getDate() - 3 * 28);

export const formatDate = (date) => `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;

export const formatInputDate = timeFormat("%Y-%m-%d");
