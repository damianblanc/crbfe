import { element } from 'prop-types';
import React, { Component, useRef } from 'react'
import { useState, useEffect } from 'react'

import CIcon from '@coreui/icons-react'
import { cilPencil, cilPlus, cilTrash } from '@coreui/icons';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CTable, CTableBody, CTableCaption, CTableDataCell, CTableHead, CTableHeaderCell,
  CTableRow, CButton} from '@coreui/react'

import Axios from 'axios';

import FCIRegulationComposition from './FCIRegulationComposition';

function HandleAdd() {
  console.log('button clicked');
  
  // const initialValue = "";
  // const reference = useRef(initialValue);

  // const someHandler = () => {
  //   const value = reference.current;
  //   reference.current = newValue;
  // };

  // useEffect(() => {
  //   myRef.current.appendChild(this.addedRow);
  // }, []);

  // return (
  //   <div ref={myRef} />
  // );

  // return (
  //   <CTableRow>
  //      <CTableDataCell/>
  //      <CTableDataCell/>
  //      <CTableDataCell/>
  //   </CTableRow>
  // )
}

function handleDelete (e) {
    console.log(e.target.value)
};  

function handleUpdate (e) {
  console.log(e.target.value)
};  

function handleSumbit(e) {
  e.preventDefault();
}

function FCIRegulationManagement() {
  const [data, setData] = useState([]);

  async function fetchData() {
    const url = 'http://localhost:8098/api/v1/fci';
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

  const dataAscending = [...data].sort((a, b) => a.id - b.id);

  return (
    <CRow>
       <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>FCI Regulations</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-medium-emphasis small">
              Refers to a <code>&lt;FCI Regulation List&gt;</code> to performs operations beforehand bias process running
              including their composition
            </p>
              <CTable contentEditable="true" hover striped borderless borderColor='string'>
                <CTableCaption>List of FCI Regulations</CTableCaption>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col" contentEditable="false">#</CTableHeaderCell>
                    <CTableHeaderCell scope="col" contentEditable="false">Symbol</CTableHeaderCell>
                    <CTableHeaderCell scope="col" contentEditable="false">Name</CTableHeaderCell>
                    <CTableHeaderCell scope="col" contentEditable="false">Composition</CTableHeaderCell>
                    <CTableHeaderCell scope="col" contentEditable="false">Actions</CTableHeaderCell>
                    <CTableHeaderCell scope="col" contentEditable="false">
                    <CButton component="a" color="light " role="button" size='sm' onClick={() => HandleAdd()}>
                      <CIcon icon={cilPlus} size="xxl"/>
                    </CButton>
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {dataAscending.map((fci) =>
                      <CTableRow key = {fci.id}>
                        <CTableHeaderCell scope="row" contentEditable="false">{fci.id}</CTableHeaderCell>
                        <CTableDataCell contentEditable="false">{fci.symbol}</CTableDataCell>
                        <CTableDataCell>{fci.name}</CTableDataCell>
                        <FCIRegulationComposition composition={fci.composition}/>
                        <CTableDataCell>
                            <CButton shape='rounded' size='sm' color='string'
                                    onClick={ () => handleDelete(fci)}>
                                      <CIcon icon={cilTrash} size="xl"/>
                            </CButton>&nbsp;
                            <CButton shape='rounded' size='sm' color='string'
                              onClick={ () => handleUpdate(fci)}>
                                <CIcon icon={cilPencil} size="xl"/>
                            </CButton>
                        </CTableDataCell>
                        <CTableDataCell/>
                      </CTableRow>
                  )}

                </CTableBody>
                
              </CTable>
              <div id="addedRow"/>
           </CCardBody>
         </CCard>
       </CCol>
     </CRow>
  )
}

export default FCIRegulationManagement
