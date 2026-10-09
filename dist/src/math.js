// Pure helpers: importing a calculation module never imports browser code.
export function rng(seed=1) {
  let s=(Number(seed)>>>0)||1;
  return () => { s=(Math.imul(s,1664525)+1013904223)>>>0; return s/4294967296; };
}
export function number(value,min,max,label="value") {
  const n=Number(value);
  if(!Number.isFinite(n)||n<min||n>max) throw new RangeError("Invalid "+label);
  return n;
}
export function integer(value,min,max,label="value") {
  if(typeof value!=="number"||!Number.isInteger(value)||value<min||value>max) throw new RangeError("Invalid "+label);
  return value;
}
export function seedNumber(seed) { return integer(seed,1,4294967295,"seed"); }
