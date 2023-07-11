// converts a string to two decimal places
function toTwoDecimalPlaces(value: string){
  const [integer, decimal] = value.split(".");
  const _decimal = ( (decimal ? decimal : "")  + "00").slice(0, 2);

  return integer + "." + _decimal;
}

export default toTwoDecimalPlaces;
