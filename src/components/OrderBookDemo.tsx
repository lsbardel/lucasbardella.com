import * as React from "react";
import { Controls, Range, Select } from "./inputs";
import OrderBookChart from "./order-book-chart";

const SYMBOLS = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "XRPUSDT", "DOGEUSDT"];

const OrderBookDemo = () => {
  const [symbol, setSymbol] = React.useState("BTCUSDT");
  const [range, setRange] = React.useState(0.25);

  return (
    <>
      <Controls>
        <div>
          <Select label="Market" value={symbol} onChange={setSymbol} options={SYMBOLS} />
        </div>
        <div>
          <Range label="Price range ±%" value={range} onChange={setRange} min={0.05} max={1} step={0.05} />
        </div>
      </Controls>
      <OrderBookChart symbol={symbol} range={range} />
    </>
  );
};

export default OrderBookDemo;
