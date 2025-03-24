```tsx
import {TradingViewTicketTape} from "./components/tradingview.js";
```


```jsx
const symbols = [
  "NASDAQ:AAPL",
  "NASDAQ:GOOGL",
  "NASDAQ:MSFT",
  "NASDAQ:AMZN",
  "NASDAQ:META",
  "NASDAQ:TSLA",
  "NASDAQ:NVDA",
  "NASDAQ:NFLX",
  "NASDAQ:PLTR",
  "NYSE:V",
];
display(<TradingViewTicketTape symbols={symbols} theme="dark" compact={true} />);
```
