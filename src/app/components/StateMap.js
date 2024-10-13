"use client";

import { ComposableMap, Geographies, Geography } from "react-simple-maps";

const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

const StateMap = () => {
    return (
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ outline, borders }) => (
            <>
              <Geography geography={outline} fill="#E9E3DA" />
              <Geography geography={borders} fill="none" stroke="#FFF" />
            </>
          )}
        </Geographies>
      </ComposableMap>
    );
};
  
export default StateMap;
  