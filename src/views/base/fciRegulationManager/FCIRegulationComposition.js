import React, { Component } from 'react'
import { useState, useEffect } from 'react'

import Axios from 'axios';

import { CTableDataCell, CInputGroup, CFormInput, CInputGroupText } from '@coreui/react'

import { IMaskMixin } from 'react-imask'


const CFormInputWithMask = IMaskMixin(({ inputRef, ...props }) => (
    <CFormInput
      {...props}
      ref={inputRef}
    />
  ))

function findPercentage(c, e) {
  const r = c.forEach(element => {
    console.log("c.specieType=" + c.specieType); 
    console.log("element=" + e); 
        if (c.specieType === "Bond") return e;
        console.log(element);    
    });
    return r;
};    

export default function FCIComposition({ composition }) {
    const asc = [...composition].sort((a, b) => a.specieType > b.specieType ? 1 : -1);

    const [data, setData] = useState([]);

    async function fetchData() {
        const url = 'http://localhost:8098/api/v1/component/specie-types';
        try {
          const response = await Axios.get(url)
          setData(response.data);
          console.table(data);  
        } catch (error) {
          console.error(error);
        }
      }
    
      useEffect(() => {
        fetchData();
      }, []);
   
    return (
        <CTableDataCell width='15%'>
            {data.map((specieType) => 
            <CInputGroup className="mb-3" key="specieType">
                <CInputGroupText id="basic-addon2">{specieType}</CInputGroupText>
                <CFormInputWithMask placeholder={findPercentage(asc, specieType)} 
                style={{width: '5%'}}  
                mask={Number} min={0} max={100} lazy={false} 
                aria-label="Percentage" aria-describedby="basic-addon2"/>
                <CInputGroupText id="basic-addon2">%</CInputGroupText>
            </CInputGroup>
            )}
        </CTableDataCell>
    );
}