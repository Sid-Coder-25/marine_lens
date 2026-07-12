const fishData = [
  {
    id: "green-sawfish",
    commonName: "Green Sawfish",
    scientificName: "Pristis zijsron",
    conservationStatus: "Critically Endangered",
    protectedStatus: "Fishing prohibited throughout the UAE",
    isProtected: true,
    riskLevel: "Critical",
    description:
      "Shallow coastal waters, lagoons, estuaries and mangrove areas.",
    identificationFeatures: [
      "Long saw-shaped snout",
      "Flattened shark-like body",
      "Large triangular fins",
      "Greenish-grey upper body"
    ],
    advice:
      "Do not catch, retain, transport or sell this animal. If it is accidentally caught, keep it in the water, avoid handling the saw, cut the fishing line or net if necessary, and release it immediately. Report the sighting to the relevant environmental authority.",
    warning:
      "PROTECTED SPECIES: Fishing is banned throughout the UAE. Do not deploy the net and release immediately if accidentally caught.",
    resultTheme: "critical"
  },

  {
    id: "halavi-guitarfish",
    commonName: "Halavi Guitarfish",
    scientificName: "Glaucostegus halavi",
    conservationStatus: "Critically Endangered",
    protectedStatus: "Do not catch or retain",
    isProtected: true,
    riskLevel: "Critical",
    description:
      "Shallow coastal waters over sandy or muddy seabeds.",
    identificationFeatures: [
      "Flattened guitar-shaped body",
      "Pointed triangular snout",
      "Broad pectoral fins",
      "Long shark-like tail"
    ],
    advice:
      "Do not keep this animal. In Abu Dhabi, catching, trading or retaining rays of all kinds is prohibited. If accidentally caught, leave it in the water, remove or cut the fishing gear carefully, and release it immediately.",
    warning:
      "PROTECTED RAY: Do not deploy the net. Release immediately if accidentally caught.",
    resultTheme: "critical"
  },

  {
    id: "hammour",
    commonName: "Hammour",
    scientificName: "Epinephelus coioides",
    conservationStatus: "Least Concern",
    protectedStatus: "Maximum 2 per person per day in Abu Dhabi",
    isProtected: false,
    riskLevel: "Moderate",
    description:
      "Coral reefs, rocky seabeds, mangroves, estuaries and shallow coastal waters.",
    identificationFeatures: [
      "Thick grouper-shaped body",
      "Large mouth",
      "Orange-brown spots",
      "Rounded tail"
    ],
    advice:
      "In Abu Dhabi, a recreational shore fisher may keep up to 2 orange-spotted groupers per day, with a maximum of 8 per boat per day. Release additional fish and any visibly juvenile fish. A valid recreational fishing licence is required.",
    warning:
      "LIMITED CATCH: Maximum 2 per person per day and 8 per boat per day in Abu Dhabi.",
    resultTheme: "caution"
  },

  {
    id: "sultan-ibrahim",
    commonName: "Sultan Ibrahim",
    scientificName: "Nemipterus japonicus",
    conservationStatus: "Least Concern",
    protectedStatus: "Catch permitted with a valid licence",
    isProtected: false,
    riskLevel: "Low",
    description:
      "Sandy and muddy seabeds in coastal and offshore waters.",
    identificationFeatures: [
      "Pink or reddish upper body",
      "Silvery underside",
      "Yellow markings",
      "Forked tail"
    ],
    advice:
      "The fish may be kept when caught legally with a valid recreational fishing licence. Do not fish in protected areas, navigation channels or locations marked with no-fishing signs. Release very small or juvenile fish.",
    warning:
      "CATCH PERMITTED: Keep only legally caught adult fish and avoid restricted fishing areas.",
    resultTheme: "safe"
  },

  {
    id: "kingfish",
    commonName: "Kingfish",
    scientificName: "Scomberomorus commerson",
    conservationStatus: "Near Threatened",
    protectedStatus: "Closed season: 15 August–15 October",
    isProtected: false,
    riskLevel: "Moderate",
    description:
      "Open coastal and offshore waters, often near reefs and areas containing schools of smaller fish.",
    identificationFeatures: [
      "Long streamlined silver body",
      "Pointed head",
      "Deeply forked tail",
      "Dark vertical bars"
    ],
    advice:
      "Do not catch kingfish from 15 August to 15 October. Outside the closed season, Abu Dhabi recreational fishers may keep up to 3 kingfish per person per day, with a maximum of 12 per boat per day. Release the fish if the season is closed or the limit has been reached.",
    warning:
      "SEASONAL RULE: No catch from 15 August to 15 October. Abu Dhabi limit: 3 per person and 12 per boat per day.",
    resultTheme: "caution"
  },

  {
    id: "black-pomfret",
    commonName: "Black Pomfret",
    scientificName: "Parastromateus niger",
    conservationStatus: "Least Concern",
    protectedStatus: "Catch permitted with a valid licence",
    isProtected: false,
    riskLevel: "Low",
    description:
      "Coastal and offshore waters, especially above sandy or muddy seabeds.",
    identificationFeatures: [
      "Deep oval-shaped body",
      "Dark silver colouring",
      "Long curved dorsal and anal fins",
      "Deeply forked tail"
    ],
    advice:
      "The fish may be kept when caught legally with a valid recreational fishing licence. Do not fish in protected areas, navigation channels or locations marked with no-fishing signs. Release very small or juvenile fish.",
    warning:
      "CATCH PERMITTED: Keep only legally caught adult fish and avoid restricted fishing areas.",
    resultTheme: "safe"
  },

  {
    id: "unknown",
    commonName: "Unknown Fish",
    scientificName: "Not determined",
    conservationStatus: "Unknown",
    protectedStatus: "Do not retain until identified",
    isProtected: null,
    riskLevel: "Uncertain",
    description:
      "The habitat cannot be determined because the species identification is uncertain.",
    identificationFeatures: [
      "Fish may be partly hidden",
      "Image may be blurry",
      "Lighting may be poor",
      "Species may not yet be included"
    ],
    advice:
      "Do not keep the fish while its identity is uncertain. Take another clear side-view photograph. If already caught, release it carefully unless a competent authority confirms that it may legally be retained.",
    warning:
      "IDENTIFICATION UNCERTAIN: Do not assume this fish is legal to keep.",
    resultTheme: "uncertain"
  }
];

window.FINSIGHT_FISH_DATA = fishData.map((entry) => ({
  id: entry.id,
  commonName: entry.commonName,
  scientificName: entry.scientificName,
  status: entry.conservationStatus,
  statusSummary: entry.warning,
  habitat: entry.description,
  region: entry.protectedStatus,
  conservationNote: entry.riskLevel,
  guidance: entry.advice
}));