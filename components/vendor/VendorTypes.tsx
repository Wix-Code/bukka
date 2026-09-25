// types/vendor.ts
export type MenuItem = {
  id: string;
  name: string;
  price: number;
  note?: string;
};

export type Vendor = {
  slug: string;
  name: string;
  tagline: string;
  phone: string; // "234..." no + no leading 0
  address: string;
  hours: string;
  isOpenNow: boolean;
  mapQuery: string;
  photos: string[];
  menu: MenuItem[];
};
