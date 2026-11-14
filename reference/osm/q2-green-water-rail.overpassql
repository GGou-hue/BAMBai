[out:json][timeout:180];
(
  way(18.905,72.815,18.945,72.845)["landuse"~"^(park|grass|recreation_ground|cemetery|meadow|forest|village_green)$"];
  way(18.905,72.815,18.945,72.845)["leisure"~"^(park|garden|pitch|playground|track|recreation_ground|stadium|golf_course|common)$"];
  way(18.905,72.815,18.945,72.845)["natural"~"^(water|coastline|beach|wood)$"];
  way(18.905,72.815,18.945,72.845)["waterway"~"^(river|canal|stream|dock)$"];
  way(18.905,72.815,18.945,72.845)["railway"~"^(rail|light_rail|tram|subway)$"];
);
out geom;
