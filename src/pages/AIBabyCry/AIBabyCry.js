import React from 'react'
import { InfoSection } from '../../components';
import { homeObjOne, homeObjTwo, homeObjThree } from './Data'

function AIBabyCry() {
    return (
        <>
            <InfoSection {...homeObjOne}/>
            <InfoSection {...homeObjTwo}/>
            <InfoSection {...homeObjThree}/>
        </>
    )
}

export default AIBabyCry
