import {AppData} from "../StaticClasses/AppData";
import { useState } from "react";
import { saveData } from "../StaticClasses/SaveHelper";
import {setShowPopUpPanel} from "../StaticClasses/HabitsBus";
import Colors from "../StaticClasses/Colors";
export class MeasurmentsIcon{
    static muscleIconsSrc = [{
        0:'images/BodyIcons/M0.png',
        1:'images/BodyIcons/M1.png',
        2:'images/BodyIcons/M2.png',
        3:'images/BodyIcons/M3.png'
    },
  {
        0:'images/BodyIcons/M0f.png',
        1:'images/BodyIcons/M1f.png',
        2:'images/BodyIcons/M2f.png',
        3:'images/BodyIcons/M3f.png'
  }]
    static get(name,lang,theme) {
        return (
            <div style={{ display:'flex',width:'15%',marginLeft:'auto',marginRight:'10px' }}>
            <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center'}}>
            <div style={{ width: '45px', height: '45px',border:`2px solid ${Colors.get('border',theme)}`,borderRadius:'50%',overflow:'hidden' }}>
                <img 
                    src={this.muscleIconsSrc[AppData.pData.gender][name]} 
                    style={{ width: '55px', height: '55px' }}
                />
            </div>
            </div>
            </div>
        );
    }
    
}
