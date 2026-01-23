import React from 'react';
import { AppData } from "../StaticClasses/AppData";
import Colors from "../StaticClasses/Colors";

export class MeasurmentsIcon {
    static muscleIconsSrc = [{
        0: 'images/BodyIcons/M0.png',
        1: 'images/BodyIcons/M1.png',
        2: 'images/BodyIcons/M2.png',
        3: 'images/BodyIcons/M3.png'
    },
    {
        0: 'images/BodyIcons/M0f.png',
        1: 'images/BodyIcons/M1f.png',
        2: 'images/BodyIcons/M2f.png',
        3: 'images/BodyIcons/M3f.png'
    }]

    static get(name, lang, theme) {
        const isLight = theme === 'light';
        // Modern background style matching MuscleIcon
        const bg = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.1)';

        return (
            <div style={{
                width: '42px', 
                height: '42px',
                borderRadius: '12px', // Modern Squircle shape
                backgroundColor: bg,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0 // Prevent shrinking in flex containers
            }}>
                <img
                    src={this.muscleIconsSrc[AppData.pData.gender][name]}
                    style={{ 
                        width: '32px', 
                        height: '32px', 
                        objectFit: 'contain' // Ensures image doesn't distort
                    }}
                    alt=""
                />
            </div>
        );
    }
}
