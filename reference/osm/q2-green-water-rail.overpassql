[out:json][timeout:180];
(
  way(18.82,72.795,19.03,72.865)["landuse"~"^(park|grass|recreation_ground|cemetery|meadow|forest|village_green)$"];
  way(18.82,72.795,19.03,72.865)["leisure"~"^(park|garden|pitch|playground|track|recreation_ground|stadium|golf_course|common)$"];
  way(18.82,72.795,19.03,72.865)["natural"~"^(water|coastline|beach|wood)$"];
  way(18.82,72.795,19.03,72.865)["waterway"~"^(river|canal|stream|dock)$"];
  way(18.82,72.795,19.03,72.865)["railway"~"^(rail|light_rail|tram|subway)$"];
);
out geom;
