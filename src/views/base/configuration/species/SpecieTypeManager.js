import React, { useState, useEffect, useRef } from 'react';

import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CPagination, CPaginationItem} from '@coreui/react'
import { cilInput, cilAlignRight, cilBookmark, cilTrash, cilTransfer, cilCheckCircle } from '@coreui/icons';

import CIcon from '@coreui/icons-react'

import './SpecieTypeManager.css';

import './Popup.css';
import 'reactjs-popup/dist/index.css';
import Popup from 'reactjs-popup';

import axios from 'axios';

import { isLoginTimestampValid } from '../../../../utils/utils.js';
import { useNavigate } from 'react-router-dom';

import { CToast, CToastBody, CToastHeader, CToaster } from '@coreui/react'

class SpecieTypeGroup {
    constructor(id, name, description, lot, updatable) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.lot = lot;
        this.updatable = updatable;
    }
}

class SpecieType {
    constructor(id, name, description, updatable) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.updatable = updatable;
    }
}

class Specie {
    constructor(id, specieSymbol, fciSpecieTypeId, specieTypeName, fciReferencedPositionQuantity) {
        this.id = id;
        this.specieSymbol = specieSymbol;
        this.fciSpecieTypeId = fciSpecieTypeId;
        this.specieTypeName = specieTypeName;
        this.fciReferencedPositionQuantity = fciReferencedPositionQuantity;
    }
}

function SpecieTypeManager() {
  const [specieTypeGroups, setSpecieTypeGroups] = useState([]);
  const [specieTypes, setSpecieTypes] = useState([]);
  const [currentGroup, setCurrentGroup] = useState({SpecieTypeGroup});
  const [currentSpecieTypeName, setCurrentSpecieTypeName] = useState('');
  const [newSpecieType, setNewSpecieType] = useState({ id: '', name: '', description: '', updatable: ''});
  const [species, setSpecies] = useState([Specie]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalSpecies, setTotalSpecies] = useState(0);
  const speciesPerPage = 15;
  const navigate = useNavigate();
  const [updatedSpecie, setUpdatedSpecie] = useState(false);
  const [lastupdatedSpecie, setLastUpdatedSpecie] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [showToast, setShowToast] = useState(false);

  /** SpecieType Groups */
  useEffect(() => {
    const isValid = isLoginTimestampValid();
    if (!isValid) {
      localStorage.removeItem("loginTimestamp");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate('/');
    }

    const currentPage = document.location.pathname;
    localStorage.setItem('currentPage', currentPage);
    const previousPage = localStorage.getItem("previousPage");
    if (currentPage !== previousPage) {
        localStorage.setItem('previousPage', currentPage);
        window.location.reload();
    }
  
    const fetchSpecieTypeGroups = async () => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group');
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };

    const fetchSpecies = async (specieTypeGroupName, pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind/page/' + pageNumber);
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
        setErrorMessage(error.response.data.message);
        setShowToast(true);
        showToastMessage(error.response.data.message);
      }
    };

    const fetchTotalSpecies = async (specieTypeGroupName) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };

    const setFetchedData = async () => {
      const tempLoadedSpecieTypeGroups = await fetchSpecieTypeGroups();
      setSpecieTypeGroups(tempLoadedSpecieTypeGroups);
      if (tempLoadedSpecieTypeGroups && tempLoadedSpecieTypeGroups.length == 0) {
        setErrorMessage("» There are no Groups defined: Equities, Bonds, Cedears and Cash must be created");
        setShowToast(true);
      } else {
        const tempLoadedSpecies = await fetchSpecies(tempLoadedSpecieTypeGroups[0].name, 0);
        const tempLoadedTotalSpecies = await fetchTotalSpecies(tempLoadedSpecieTypeGroups[0].name)
        setCurrentGroup(tempLoadedSpecieTypeGroups[0]);
        setSpecieTypes(tempLoadedSpecieTypeGroups[0].fciSpecieTypes);
        setTotalSpecies(tempLoadedTotalSpecies && tempLoadedTotalSpecies.length);
        setSpecies(tempLoadedSpecies);
      }
    };
    setFetchedData();
  }, []); 

  const handlePageChange = async (pageNumber) => {
    setCurrentPage(pageNumber);
    let pPage = pageNumber - 1;
    console.log("url: http://localhost:8098/api/v1/component/specie-type-group/" +  currentGroup.name + '/bind/page/' + pPage);
    const fetchSpecies = async (pageNumber) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  currentGroup.name + '/bind/page/' + pPage);
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeAssociation:', error);
      }
    };
    const tempLoadedSpecies = await fetchSpecies(pageNumber);
    setSpecies(tempLoadedSpecies);
  };

  /** Specie Type Group */
  const selectSpecieTypeGroup = async (specieTypeGroupName) => {
    const fetchSpecieTypeGroup = async (specieTypeGroupName) => {
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' + specieTypeGroupName);
          return responseData.data;
        } catch (error) {
          console.error('#1 - Error receiving specieTypeGroups:', error);
        }
      };
    const fetchSpecies = async (specieTypeGroupName, specieTypeName) => {
        try {
          const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind/page/0');
          return responseData.data;
        } catch (error) {
          console.error('#1 - Error receiving specieTypeGroups:', error);
        }
      };

    const fetchTotalSpecies = async (specieTypeGroupName) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#1 - Error receiving specieTypeGroups:', error);
      }
    };
      
    const setFetchedData = async (specieTypeGroupName) => {
      const tempLoadedSpecieTypeGroup = await fetchSpecieTypeGroup(specieTypeGroupName);
      const tempLoadedSpecies = await fetchSpecies(specieTypeGroupName, tempLoadedSpecieTypeGroup.fciSpecieTypes[0].name)
      const tempLoadedTotalSpecies = await fetchTotalSpecies(specieTypeGroupName);
      setCurrentGroup(tempLoadedSpecieTypeGroup);
      setCurrentPage(1);
      setSpecieTypes(tempLoadedSpecieTypeGroup.fciSpecieTypes);
      setSpecies(tempLoadedSpecies);
      setTotalSpecies(tempLoadedTotalSpecies && tempLoadedTotalSpecies.length);
    }
    setFetchedData(specieTypeGroupName);
  };

  const setCurrentSpecieTypeSelected = (specieTypeName) => {
    setCurrentSpecieTypeName(specieTypeName);
  }

  const upsertSpecieToSpecieTypeAssociation = (specieTypeGroupName, specieTypeName, specieName) => {
    const upsertSpecie = async (specieTypeGroupName, specieTypeName, specieName) => {
      try {
        const responseData = await axios.get('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/specie-type/' + specieTypeName + '/specie/' + specieName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#2 - Error upserting association:', error);
        setUpdatedSpecie(false);
      }
    };

    const upsertData = async (specieTypeGroupName, specieTypeName, specieName) => {
      const upsertedSpecie = await upsertSpecie(specieTypeGroupName, specieTypeName, specieName);
      setUpdatedSpecie(true);
      setLastUpdatedSpecie(specieName);
    
      const updatedSpeciesList = species.map((specie) => {
        if (specie.specieSymbol === specieName) {
          return { ...specie, fciReferencedPositionQuantity: 0 };
        }
        return specie;
      });
      setSpecies(updatedSpeciesList);
    }
    upsertData(specieTypeGroupName, specieTypeName, specieName);
  }

  const validateNewSpecieTypeRow = (newSpecieType) => {
    const errors = {};
    if (!newSpecieType.name || !newSpecieType.description) {
        errors.name = "Fields are not defined";
    }
    return errors;
  }
  
  const addSpecieType = async () => {
    const errors = validateNewSpecieTypeRow(newSpecieType);
    if (Object.keys(errors).length === 0) {
        const fetchCreatedSpecieType = async () => {
            try {
                const body = new SpecieType(null, newSpecieType.name, newSpecieType.description, newSpecieType.updatable);
                newSpecieType.fciSpecieTypeId = specieTypes.length + 1;
                const responseData = await axios.post('http://localhost:8098/api/v1/component/specie-type-group/' + currentGroup.name + '/specie-type', body,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                return responseData.data;
            } catch (error) {
                console.error('Error sending data to the backend:', error);
            }
        }
        fetchCreatedSpecieType();
        setSpecieTypes([newSpecieType, ...specieTypes]);
        clearNewSpecieType();
    }
  }

  const clearNewSpecieType = (() => {
    setNewSpecieType({ ...newSpecieType, fciSpecieTypeId: '', name: '', description: '', updatable: '' });
  })

  const deleteSpecieTypeAssociation = () => {
    const upsertSpecie = async (specieTypeGroupName, specieTypeName, specieName) => {
      try {
        const responseData = await axios.delete('http://localhost:8098/api/v1/component/specie-type-group/' +  specieTypeGroupName + '/specie-type/' + specieTypeName + '/specie/' + specieName + '/bind');
        return responseData.data;
      } catch (error) {
        console.error('#2 - Error upserting association:', error);
        setUpdatedSpecie(false);
      }
    };
  }

  const showToastMessage = (message) => {
    setErrorMessage(message)
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 10000);
  }

  const toggleToast = () => {
    setShowToast(!showToast);
  };

  return (
       <>
      {showToast === true?
      <CToaster classname='p-3' placement='top-end' push={toast} ref={toaster}>
        <CToast show={true} animation={true} autohide={true} 
              fade={true} visible={true} onClose={toggleToast}>
          <CToastHeader closeButton>
            <svg
              className="rounded me-2"
              width="20"
              height="20"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="xMidYMid slice"
              focusable="false"
              role="img"
            >
            <rect width="100%" height="100%" fill="#FF0000"></rect>
            </svg>
            <div className="fw-bold me-auto">Specie Type Error Message</div>
          </CToastHeader>
          <CToastBody>{errorMessage}</CToastBody>
        </CToast>
      </CToaster>
      : null}
      {specieTypeGroups && specieTypeGroups.length > 0? (
        <>
       <CRow>
          <CCol xs={12}>
            <CCard>
              <CCardHeader>
              {<Popup trigger={
                  <CButton className="text-medium-emphasis small" shape='rounded' size='sm' color='string'>
                      <CIcon icon={cilBookmark} size="xl"/>
                  </CButton>} position="right" modal lockScroll="false" backgroundColor="rgba(75,192,192,0.4)"
                   contentStyle={{ top: "6%", width: "60%", height: "42%", overflow: "auto", position: 'absolute', top: '19%', left: '21%'}}>
                  {
                    <CRow>
                    <CCol xs={12}>
                      <CCard>
                        <CCardHeader>
                          <strong className="text-medium-emphasis small">FCI Regulation & Position Biases</strong>
                        </CCardHeader>
                        <CCardBody>
                        <CRow>
                          <CCol>
                          <p className="text-medium-emphasis small">» The specie type page is designed to manage and display specie type groups, specie types, and species.&nbsp;&nbsp;A list of specie type groups are shown and are is able to be selected a group to view its associated specie types and species. New specie types, update the association between a specie and a specie type, and delete specie types operations with associations.</p>
                          <p className="text-medium-emphasis small">» The specie type page displays a table showing the specie type groups, species, and their associations.</p>
                          <p className="text-medium-emphasis small">» The specie type page also provides a popup with information about FCI regulations and position biases.</p>
                          <p className="text-medium-emphasis small">» If there is an error with the data, the specie type page displays an error message to the user. The error message is displayed as a toast notification at the top right corner of the screen.</p>
                          </CCol>
                        </CRow>
                      </CCardBody>
                      </CCard>
                      </CCol>
                      </CRow>}
                      </Popup>}
                <strong className="text-medium-emphasis small">Specie Type Groups Configuration</strong>
              </CCardHeader>
              <CCardBody>
              <table className="text-medium-emphasis small">
               <thead>
                  <tr>
                    <td width="15%"><strong><code>&lt;Specie Type Group&gt;</code></strong></td>
                    <td width="80%">
                      <select className="text-medium-emphasis large" onChange={(e) => selectSpecieTypeGroup(e.target.value)}>
                        {Object.prototype.toString.call(specieTypeGroups) === '[object Array]' && specieTypeGroups?.map((group, index) => 
                          <React.Fragment key={group.id || index}>
                          <option value={group.name}>{group.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{currentGroup.description}
                    </td>
                  </tr>
                </thead>
               
                <tbody></tbody>
               </table>
              </CCardBody>
            </CCard>
        </CCol>
      </CRow> 
      <br/>
        <CRow>
        <CCol xs={12}>
          <CCard>
             <CCardHeader className="text-medium-emphasis small d-flex align-items-center" style={{ padding: '0.5rem 1rem', lineHeight: '3rem' }}>
              &nbsp;&nbsp;&nbsp;<CIcon icon={cilAlignRight} size="xl"/>&nbsp;&nbsp;&nbsp;
              <strong>Specie Types in Group&nbsp;&nbsp;&nbsp;<code>&lt;{currentGroup.name}&gt;</code></strong>
            </CCardHeader>
            <CCardHeader className="text-medium-emphasis small" style={{ border: "none", marginBottom: "-30px"}}>
              <table>
              <tbody>
                <tr>
                  <td width="60%">&nbsp;<code>*&nbsp;</code>Associate each market specie to its required specie type for further recognition at position uploading time</td>
                  <td style={{ width: "10%", border: "none", verticalAlign: "bottom"}}>
                      <CPagination style={{verticalAlign: "bottom"}} align="end" size="sm" 
                          activepage = {currentPage}
                          pages = {Math.floor(totalSpecies / speciesPerPage)}>
                            {currentPage === 1? (
                              <CPaginationItem disabled>«</CPaginationItem> ) 
                            : (<CPaginationItem onClick={() => handlePageChange(currentPage - 1)}>«</CPaginationItem>)}
                          
                            <CPaginationItem style={{ background : currentPage === 1? 'lightgrey' : 'lightcyan' }}
                                onClick={() => handlePageChange(currentPage)}>{currentPage}</CPaginationItem>
                            {currentPage === Math.ceil(totalSpecies / speciesPerPage)? (
                            <CPaginationItem style={{ backgroundColor: 'lightgrey' }}>{Math.ceil(totalSpecies / speciesPerPage)}</CPaginationItem>
                            ) :
                            (<CPaginationItem style={{ backgroundColor: 'lightcyan' }}>{species === undefined? 1 : Math.ceil(totalSpecies / speciesPerPage)}</CPaginationItem>)}
                            
                            <CPaginationItem style={{ backgroundColor: 'lightblue' }} >{species === undefined? 0 : totalSpecies && species && totalSpecies < speciesPerPage? species.length : totalSpecies}</CPaginationItem>

                            {!totalSpecies || totalSpecies === 0 || currentPage === Math.ceil(totalSpecies / speciesPerPage)? (
                              <CPaginationItem disabled>»</CPaginationItem>) 
                            : (<CPaginationItem className={"custom-pagination-item"} onClick={() => handlePageChange(currentPage + 1)}>»</CPaginationItem>)}
                      </CPagination>
                    </td>
                </tr>
              </tbody>
              </table>
            </CCardHeader>
            <CCardBody>
              <table>
                <thead>
                  <tr className="text-medium-emphasis">
                    <th className='text-medium-emphasis small'>#</th>
                    <th className='text-medium-emphasis small'>Specie Symbol</th>
                    <th className='text-medium-emphasis small'>Specie Type</th>
                    <th className='text-medium-emphasis small'>Referenced Positions</th>
                    <th className='text-medium-emphasis small'>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.prototype.toString.call(species) === '[object Array]' && species?.map((item, index) => 
                    <React.Fragment key={item.id || index}>
                    <tr>
                    <td width="5%" className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.id}</td>
                      <td width="5%" className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.specieSymbol}</td>
                      <td width="15%" className='text-medium-emphasis small'>
                      <select className="text-medium-emphasis large"  onChange={(e) => setCurrentSpecieTypeSelected(e.target.value)}>
                        <option>&nbsp;&nbsp;&nbsp;</option> 
                        {Object.prototype.toString.call(specieTypes) === '[object Array]' && specieTypes?.map((specietype, index) => 
                          <React.Fragment key={specietype.id || index}>
                            <option value={specietype.name}
                            selected={specietype.name === item.specieTypeName}>
                            {specietype.name}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</option>
                          </React.Fragment>
                        )}
                      </select>
                    </td>
                    <td width="5%" className="small" style={{ color: index % 2 != 0 ? 'green' : '#000080' }}>{item.fciReferencedPositionQuantity}</td>
                    <td>
                      <CButton  className='text-medium-emphasis small' component="a" color="string" role="button" size='sm' 
                        onClick={() => upsertSpecieToSpecieTypeAssociation(currentGroup.name, currentSpecieTypeName, item.specieSymbol)}
                        disabled={item.fciReferencedPositionQuantity > 0}>
                          <CIcon icon={item.fciReferencedPositionQuantity === null ? cilInput : cilTransfer} size="xl"/>
                      </CButton>
                      <CButton className='text-medium-emphasis small' component="a" color="string" role="button" size='sm' 
                        onClick={() => deleteSpecieTypeAssociation()}
                        disabled={item.fciReferencedPositionQuantity > 0}>
                          <CIcon icon={cilTrash} size="xl"/>
                      </CButton>
                      &nbsp;&nbsp;&nbsp;&nbsp;
                      {updatedSpecie && item.specieSymbol === lastupdatedSpecie? 
                        <CIcon icon={cilCheckCircle} size="l" />
                      : null}  
                      </td>
                    </tr>
                    </React.Fragment>
                    )}
                </tbody>
              </table>
          </CCardBody>
         </CCard>
        </CCol>
        </CRow> 
      </>
      ) : null}  
      <br/>
      </>
  );
}


export default SpecieTypeManager;