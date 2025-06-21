import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import { Card } from '@/components/ui/card';
import { LOCATIONS } from '@/utils/inventoryModel';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

const markers = [
  { name: LOCATIONS.MUMBAI, coordinates: [72.8777, 19.0760] },
  { name: LOCATIONS.CHENNAI, coordinates: [80.2707, 13.0827] },
];

const GeographicMap = ({ resources, setLocationFilter, currentLocation }) => {
  const resourceCounts = markers.map(marker => {
    const count = resources.filter(r => r.location.includes(marker.name)).length;
    return { ...marker, count };
  });

  return (
    <Card className="p-2">
      <ComposableMap projectionConfig={{ scale: 600, center: [80, 22] }}>
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#E9EAEA"
                stroke="#D6D6DA"
                style={{
                  default: { outline: "none" },
                  hover: { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>
        {resourceCounts.map(({ name, coordinates, count }) => (
          <Marker key={name} coordinates={coordinates}>
            <g
              fill={currentLocation === name ? "#FF5722" : "#607D8B"}
              stroke={currentLocation === name ? "#BF360C" : "#FFFFFF"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(-12, -24)"
              style={{ cursor: 'pointer' }}
              onClick={() => setLocationFilter(name)}
              onMouseEnter={() => { /* can add tooltip logic here */ }}
            >
              <path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
              <circle cx="12" cy="10" r="3" fill="white" />
            </g>
            <text
              textAnchor="middle"
              y="-30"
              style={{ fontFamily: "system-ui", fill: "#5D5A6D", fontSize: "14px", fontWeight: "bold" }}
            >
              {name} ({count})
            </text>
          </Marker>
        ))}
      </ComposableMap>
    </Card>
  );
};

export default GeographicMap; 