import React from 'react'
import { InfoSection } from '../../components';
import { homeObjOne, homeObjTwo, homeObjThree, homeObjFour } from './Data'

function AIBabyCry() {
    return (
        <>
            <InfoSection {...homeObjOne}/>
            <InfoSection {...homeObjTwo}/>
            <InfoSection {...homeObjThree}/>
            <InfoSection {...homeObjFour}/>
        </>
    )
}

export default AIBabyCry
