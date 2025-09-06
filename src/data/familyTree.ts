// --------------------
// TYPES
// --------------------
export type PartialDate = {
  year?: number
  month?: number
  day?: number
  approximate?: boolean
  range?: { from?: string; to?: string }
  notes?: string
}

export type Person = {
  id: string
  name: string
  gender?: "male" | "female" | "other"
  dob?: PartialDate
  birthPlace?: string
  deathDate?: PartialDate
  deathPlace?: string
  phone?: string
}

export type Marriage = {
  id: string
  spouses: [string, string]
  date?: PartialDate
  place?: string
  children?: string[]
  status?: "married" | "divorced" | "widowed"
}

// --------------------
// PERSONS
// --------------------
export const persons: Person[] = [
  // Gen 1 (root siblings & spouses)
  { id: "p1", name: "John Doe", gender: "male", dob: { year: 1960, month: 5, day: 10 }, birthPlace: "New York", phone: "111-111-1111" },
  { id: "p2", name: "Jane Smith", gender: "female", dob: { year: 1962, month: 8, day: 3 }, birthPlace: "Boston", phone: "222-222-2222" },
  { id: "p3", name: "Robert Doe", gender: "male", dob: { year: 1964, month: 7, day: 14 }, birthPlace: "Chicago", phone: "333-333-3333" },
  { id: "p4", name: "Emily Brown", gender: "female", dob: { year: 1966 }, birthPlace: "Houston", phone: "444-444-4444" },
  { id: "p5", name: "Michael Doe", gender: "male", dob: { year: 1968 }, birthPlace: "San Francisco", phone: "555-555-5555" },
  { id: "p6", name: "Sarah Wilson", gender: "female", dob: { year: 1970, month: 2 }, birthPlace: "Los Angeles", phone: "666-666-6666" },
  { id: "p7", name: "David Doe", gender: "male", dob: { year: 1972, month: 9 }, birthPlace: "Seattle", phone: "777-777-7777" },
  { id: "p8", name: "Laura Martinez", gender: "female", dob: { year: 1974 }, birthPlace: "Miami", phone: "888-888-8888" },
  { id: "p9", name: "William Doe", gender: "male", dob: { year: 1976 }, birthPlace: "Denver", phone: "999-999-9999" },
  { id: "p10", name: "Olivia Taylor", gender: "female", dob: { year: 1978 }, birthPlace: "Austin", phone: "101-101-1010" },

  // Gen 2 (10 children)
  { id: "p11", name: "Alice Doe", gender: "female", dob: { year: 1985, month: 1 }, birthPlace: "New York", phone: "202-202-2020" },
  { id: "p12", name: "Bob Doe", gender: "male", dob: { year: 1987 }, birthPlace: "New York", phone: "303-303-3030" },
  { id: "p13", name: "Catherine Doe", gender: "female", dob: { year: 1989, approximate: true, notes: "Estimated mid-1989" }, birthPlace: "Chicago", phone: "404-404-4040" },
  { id: "p14", name: "Daniel Doe", gender: "male", dob: { year: 1991, month: 12 }, birthPlace: "Chicago", phone: "505-505-5050" },
  { id: "p15", name: "Ella Doe", gender: "female", dob: { year: 1993, month: 6, day: 22 }, birthPlace: "San Francisco", phone: "606-606-6060" },
  { id: "p16", name: "Frank Doe", gender: "male", dob: { year: 1995, range: { from: "1995", to: "1996" }, notes: "Conflicting records" }, birthPlace: "San Francisco", phone: "707-707-7070" },
  { id: "p17", name: "Grace Doe", gender: "female", dob: { year: 1997 }, birthPlace: "Seattle", phone: "808-808-8080" },
  { id: "p18", name: "Henry Doe", gender: "male", dob: { year: 1999, month: 5 }, birthPlace: "Seattle", phone: "909-909-9090" },
  { id: "p19", name: "Isabella Doe", gender: "female", dob: { year: 2001 }, birthPlace: "Denver", phone: "111-222-3333" },
  { id: "p20", name: "Jack Doe", gender: "male", dob: { year: 2003 }, birthPlace: "Denver", phone: "444-555-6666" },

  // Gen 3 (20 children)
  { id: "p21", name: "Kevin Doe", gender: "male", dob: { year: 2010, month: 3, day: 12 }, birthPlace: "NY", phone: "777-888-9999" },
  { id: "p22", name: "Lily Doe", gender: "female", dob: { year: 2012, month: 7, day: 5 }, birthPlace: "NY", phone: "123-123-1234" },
  { id: "p23", name: "Mason Doe", gender: "male", dob: { year: 2011 }, birthPlace: "Chicago", phone: "234-234-2345" },
  { id: "p24", name: "Nora Doe", gender: "female", dob: { year: 2013, month: 4 }, birthPlace: "Chicago", phone: "345-345-3456" },
  { id: "p25", name: "Owen Doe", gender: "male", dob: { year: 2014, month: 6, day: 8 }, birthPlace: "SF", phone: "456-456-4567" },
  { id: "p26", name: "Penelope Doe", gender: "female", dob: { year: 2016 }, birthPlace: "SF", phone: "567-567-5678" },
  { id: "p27", name: "Quinn Doe", gender: "female", dob: { year: 2015, month: 9 }, birthPlace: "Seattle", phone: "678-678-6789" },
  { id: "p28", name: "Ryan Doe", gender: "male", dob: { year: 2017, month: 11, day: 2 }, birthPlace: "Seattle", phone: "789-789-7890" },
  { id: "p29", name: "Sophia Doe", gender: "female", dob: { year: 2018 }, birthPlace: "Denver", phone: "890-890-8901" },
  { id: "p30", name: "Thomas Doe", gender: "male", dob: { year: 2019 }, birthPlace: "Denver", phone: "901-901-9012" },
  { id: "p31", name: "Uma Doe", gender: "female", dob: { year: 2011, month: 2 }, birthPlace: "Austin", phone: "101-202-3030" },
  { id: "p32", name: "Victor Doe", gender: "male", dob: { year: 2013, month: 6, day: 19 }, birthPlace: "Austin", phone: "202-303-4040" },
  { id: "p33", name: "Wendy Doe", gender: "female", dob: { year: 2012 }, birthPlace: "Boston", phone: "303-404-5050" },
  { id: "p34", name: "Xavier Doe", gender: "male", dob: { year: 2014 }, birthPlace: "Boston", phone: "404-505-6060" },
  { id: "p35", name: "Yara Doe", gender: "female", dob: { year: 2015, month: 10 }, birthPlace: "Houston", phone: "505-606-7070" },
  { id: "p36", name: "Zack Doe", gender: "male", dob: { year: 2017 }, birthPlace: "Houston", phone: "606-707-8080" },
  { id: "p37", name: "Amy Doe", gender: "female", dob: { year: 2016 }, birthPlace: "Miami", phone: "707-808-9090" },
  { id: "p38", name: "Brian Doe", gender: "male", dob: { year: 2018, month: 8 }, birthPlace: "Miami", phone: "808-909-1010" },
  { id: "p39", name: "Clara Doe", gender: "female", dob: { year: 2019, month: 12, day: 25 }, birthPlace: "LA", phone: "909-101-2020" },
  { id: "p40", name: "Dylan Doe", gender: "male", dob: { year: 2020, month: 1, day: 7 }, birthPlace: "LA", phone: "111-222-4444" },

  // Gen 4 (all with full DOBs)
  { id: "p41", name: "Eva Doe", gender: "female", dob: { year: 2038, month: 3, day: 3 }, birthPlace: "NY", phone: "321-321-4321" },
  { id: "p42", name: "Finn Doe", gender: "male", dob: { year: 2039, month: 6, day: 15 }, birthPlace: "Chicago", phone: "432-432-5432" },
  { id: "p43", name: "Gina Doe", gender: "female", dob: { year: 2040, month: 7, day: 20 }, birthPlace: "SF", phone: "543-543-6543" },
  { id: "p44", name: "Hugo Doe", gender: "male", dob: { year: 2041, month: 9, day: 10 }, birthPlace: "Seattle", phone: "654-654-7654" },
  { id: "p45", name: "Ivy Doe", gender: "female", dob: { year: 2042, month: 11, day: 30 }, birthPlace: "Denver", phone: "765-765-8765" },
  { id: "p46", name: "James Doe", gender: "male", dob: { year: 2043, month: 1, day: 8 }, birthPlace: "Austin", phone: "876-876-9876" },
  { id: "p47", name: "Kate Doe", gender: "female", dob: { year: 2044, month: 4, day: 14 }, birthPlace: "Boston", phone: "987-987-0987" },
  { id: "p48", name: "Leo Doe", gender: "male", dob: { year: 2045, month: 12, day: 2 }, birthPlace: "Houston", phone: "111-333-5555" },
]

// --------------------
// MARRIAGES
// --------------------
export const marriages: Marriage[] = [
  // Gen 1
  { id: "m1", spouses: ["p1", "p2"], date: { year: 1980, month: 6, day: 15 }, place: "New York", status: "married", children: ["p11", "p12"] },
  { id: "m2", spouses: ["p3", "p4"], date: { year: 1982 }, place: "Chicago", status: "married", children: ["p13", "p14"] },
  { id: "m3", spouses: ["p5", "p6"], date: { year: 1984 }, place: "San Francisco", status: "married", children: ["p15", "p16"] },
  { id: "m4", spouses: ["p7", "p8"], date: { year: 1986 }, place: "Seattle", status: "married", children: ["p17", "p18"] },
  { id: "m5", spouses: ["p9", "p10"], date: { year: 1988 }, place: "Denver", status: "married", children: ["p19", "p20"] },

  // Gen 2 (+ one second marriage)
  { id: "m6", spouses: ["p11", "p12"], date: { year: 2008 }, place: "New York", status: "divorced", children: ["p21", "p22"] },
  { id: "m7", spouses: ["p13", "p14"], date: { year: 2009 }, place: "Chicago", status: "married", children: ["p23", "p24"] },
  { id: "m8", spouses: ["p15", "p16"], date: { year: 2010 }, place: "SF", status: "married", children: ["p25", "p26"] },
  { id: "m9", spouses: ["p17", "p18"], date: { year: 2011 }, place: "Seattle", status: "married", children: ["p27", "p28"] },
  { id: "m10", spouses: ["p19", "p20"], date: { year: 2012 }, place: "Denver", status: "married", children: ["p29", "p30"] },
  { id: "m11", spouses: ["p11", "p20"], date: { year: 2015 }, place: "Austin", status: "married", children: ["p31", "p32"] },

  // Gen 3 (8 marriages only)
  { id: "m12", spouses: ["p21", "p22"], date: { year: 2035 }, place: "NY", status: "married", children: ["p41"] },
  { id: "m13", spouses: ["p23", "p24"], date: { year: 2036 }, place: "Chicago", status: "married", children: ["p42"] },
  { id: "m14", spouses: ["p25", "p26"], date: { year: 2037 }, place: "SF", status: "married", children: ["p43"] },
  { id: "m15", spouses: ["p27", "p28"], date: { year: 2038 }, place: "Seattle", status: "married", children: ["p44"] },
  { id: "m16", spouses: ["p29", "p30"], date: { year: 2039 }, place: "Denver", status: "married", children: ["p45"] },
  { id: "m17", spouses: ["p31", "p32"], date: { year: 2040 }, place: "Austin", status: "married", children: ["p46"] },
  { id: "m18", spouses: ["p33", "p34"], date: { year: 2041 }, place: "Boston", status: "married", children: ["p47"] },
  { id: "m19", spouses: ["p35", "p36"], date: { year: 2042 }, place: "Houston", status: "married", children: ["p48"] },
]
