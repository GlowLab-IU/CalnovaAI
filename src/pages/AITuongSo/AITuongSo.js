import React from 'react'
import { InfoSection } from '../../components';
import { homeObjOne, homeObjTwo, homeObjThree } from './Data'

function AITuongSo() {
    return (
        <>
            <InfoSection {...homeObjOne}/>
            <InfoSection {...homeObjTwo}/>
            <InfoSection {...homeObjThree}/>
        </>
    )
}

export default AITuongSo
