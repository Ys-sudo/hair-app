export interface Dye {
  name: string;
  color: string;
  shop_link: string;
  image: string;
  opacity: number;
}

export interface Series {
  name: string;
  dyes: Dye[];
}

export interface DyeData {
  series: Series[];
}
