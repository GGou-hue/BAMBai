[out:json][timeout:180];
way(18.90,72.81,18.96,72.85)["amenity"~"^(parking|bus_station|fuel|school|college|university|hospital|place_of_worship|marketplace|police|fire_station|cinema|theatre|library|community_centre|townhall|courthouse|bank)$"];
way(18.90,72.81,18.96,72.85)["tourism"];
way(18.90,72.81,18.96,72.85)["historic"];
way(18.90,72.81,18.96,72.85)["man_made"~"^(tower|minaret|lighthouse|pier|breakwater|storage_tank)$"];
out body; >; out skel qt;
