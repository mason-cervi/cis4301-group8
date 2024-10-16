'use client';

import React, { useState } from 'react';
import { Slider } from 'antd';

const YearSlider = () => {
    const [range, setRange] = useState([2009, 2021]);

    const handleChange = (value) => {
        setRange(value);
    }

    return (
        <div className="mr-48 ml-48 mb-48">
            <Slider
                range
                step={1}
                value={range}
                min={2009}
                max={2021}
                onChange={handleChange}
                className="custom-slider"
            />
            <div className="text-center mt-8 font-light text-sm">
                Selected range: {range[0]} - {range[1]}
            </div>
        </div>
    );
}

export default YearSlider;