"use client";

import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from "react-simple-maps";
import { Checkbox, Divider } from 'antd';


const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

export default function StateMap() {
    return (
    <div className="flex items-center justify-center ml-48 mr-48 mb-20">
      <ComposableMap projection="geoAlbersUsa">
        <Geographies geography={geoUrl}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography 
                key={geo.rsmKey} 
                geography={geo}
                style={{
                    default: {
                      fill: "#E9E3DA",
                      stroke: "#AAAAAA",
                      strokeWidth: 0.75,
                      outline: "none",
                    },
                    hover: {
                      fill: "#CFD8DC",
                      stroke: "#455A64",
                      strokeWidth: 1,
                    },
                    pressed: {
                      fill: "#bbbbbb",
                      stroke: "#37474F",
                      strokeWidth: 1.25,
                    },
                  }}
              />
            ))
          }
        </Geographies>
      </ComposableMap>
      </div>
    )
  }