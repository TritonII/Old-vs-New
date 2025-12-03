export interface Barron {
  id: string;
  name: string;
  industry: string;
}

export interface Connection {
  from: string; // ID of the Old Barron
  to: string;   // ID of the New Barron
}

export interface Point {
  x: number;
  y: number;
}

export interface FutureForecast {
  oldId: string;
  newId: string;
  oldName: string;
  newName: string;
  prediction: string;
}