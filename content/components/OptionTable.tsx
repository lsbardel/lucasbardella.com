import * as d3 from "npm:d3";


const formatTime = d3.timeFormat("%Y %b %d %H:%M:%S");
const formatDate = d3.timeFormat("%Y %b %d");
const fwd = d3.format(",.2f");
const strike = d3.format(",.0f");
const ttm = d3.format(".3f");
const iv = d3.format(".2%");


interface Option {
  type: string;
  price: number;
  implied_vol: number;
  moneyness_ttm: number;
  ttm: number;
  strike: number;
  side: string;
  volume: number;
  open_interest: number;
};

export const OptionTable = ({asset, data }: { asset: string; data: Option[] }) => {
  if (!data) return null;
  return (
    <div>
      {data.map((option, index) => <OptionRow key={index} asset={asset} option={option} />)}
    </div>
  );
};


export const OptionRow = ({ asset, option }: { asset: string; option: Option }) => {
  return (
    <div className="option-row mt-3">
      <span>{option.type} option strike {strike(option.strike)} {option.side} {option.price}</span>
      <br/>
      <span>Implied Vol {iv(option.implied_vol)}</span>
      <br/>
      <span>Moneyness {ttm(option.moneyness_ttm)}</span>
      <br/>
      <span>Time to maturity in years {ttm(option.ttm)}</span>
    </div>
  );
};
